import { jsonResponse, errorResponse, requireAdminAuth, generateCryptoId, logAudit } from '../../../_utils.js';

export async function onRequestGet(context) {
  const { params, request, env } = context;
  const orderId = params.id;

  try {
    await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const order = await env.DB.prepare(`
      SELECT id, idempotency_key, customer_id, customer_name, customer_email,
             customer_phone, delivery_address, delivery_city, delivery_state,
             delivery_pincode, customer_notes, status, initial_indicative_subtotal,
             created_at, updated_at
      FROM orders
      WHERE id = ?
    `).bind(orderId).first();

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Original immutable requested items
    const { results: items } = await env.DB.prepare(`
      SELECT id, product_id, product_sku, product_name, selected_variant,
             quantity, snapshot_indicative_price, snapshot_image_url, customisation_note
      FROM order_items
      WHERE order_id = ?
    `).bind(orderId).all();

    // Formal quotation revisions
    const { results: quotations } = await env.DB.prepare(`
      SELECT id, revision_number, items_quotation_json, items_subtotal,
             shipping_charge, tax_amount, total_quoted_amount, quotation_notes,
             created_by_admin, created_at
      FROM order_quotations
      WHERE order_id = ?
      ORDER BY revision_number DESC
    `).bind(orderId).all();

    // CONFIDENTIAL Internal staff notes (accessible ONLY in admin)
    const { results: internalNotes } = await env.DB.prepare(`
      SELECT id, admin_id, admin_name, note, created_at
      FROM order_internal_notes
      WHERE order_id = ?
      ORDER BY created_at DESC
    `).bind(orderId).all();

    return jsonResponse({
      success: true,
      order: {
        id: order.id,
        idempotencyKey: order.idempotency_key,
        customerId: order.customer_id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        deliveryAddress: order.delivery_address,
        deliveryCity: order.delivery_city,
        deliveryState: order.delivery_state,
        deliveryPincode: order.delivery_pincode,
        customerNotes: order.customer_notes,
        status: order.status,
        indicativeSubtotal: order.initial_indicative_subtotal,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: (items || []).map(it => ({
          id: it.id,
          productId: it.product_id,
          sku: it.product_sku,
          name: it.product_name,
          variant: it.selected_variant,
          quantity: it.quantity,
          indicativePrice: it.snapshot_indicative_price,
          imageUrl: it.snapshot_image_url,
          customisationNote: it.customisation_note
        })),
        quotations: (quotations || []).map(q => ({
          id: q.id,
          revisionNumber: q.revision_number,
          items: JSON.parse(q.items_quotation_json || '[]'),
          itemsSubtotal: q.items_subtotal,
          shippingCharge: q.shipping_charge,
          taxAmount: q.tax_amount,
          totalQuotedAmount: q.total_quoted_amount,
          notes: q.quotation_notes,
          createdBy: q.created_by_admin,
          createdAt: q.created_at
        })),
        internalNotes: (internalNotes || []).map(n => ({
          id: n.id,
          adminName: n.admin_name,
          note: n.note,
          createdAt: n.created_at
        }))
      }
    });
  } catch (err) {
    return errorResponse(`Failed to load order details: ${err.message}`, 500);
  }
}

export async function onRequestPatch(context) {
  const { params, request, env } = context;
  const orderId = params.id;

  let session;
  try {
    session = await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const body = await request.json();
    const { status, internalNote, quotation } = body;
    const nowIso = new Date().toISOString();

    const existing = await env.DB.prepare('SELECT id, status FROM orders WHERE id = ?').bind(orderId).first();
    if (!existing) {
      return errorResponse('Order not found', 404);
    }

    const batchStatements = [];

    // 1. Update status if supplied
    if (status && status !== existing.status) {
      batchStatements.push(
        env.DB.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').bind(status, nowIso, orderId)
      );
    }

    // 2. Add confidential internal staff note if provided
    if (internalNote && typeof internalNote === 'string' && internalNote.trim().length > 0) {
      const noteId = 'note-' + generateCryptoId(16);
      batchStatements.push(
        env.DB.prepare(`
          INSERT INTO order_internal_notes (id, order_id, admin_id, admin_name, note, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(noteId, orderId, session.user.id, session.user.name, internalNote.trim(), nowIso)
      );
    }

    // 3. Issue quotation revision if provided
    if (quotation && typeof quotation === 'object') {
      const { items, shippingCharge = 0, taxAmount = 0, quotationNotes = null } = quotation;

      if (!Array.isArray(items) || items.length === 0) {
        return errorResponse('Quotation must contain priced items', 400);
      }

      // Determine next revision number
      const maxRevRow = await env.DB.prepare(`
        SELECT MAX(revision_number) as max_rev FROM order_quotations WHERE order_id = ?
      `).bind(orderId).first();
      const nextRev = (maxRevRow?.max_rev || 0) + 1;

      let subtotal = 0;
      const quotedItems = items.map(it => {
        const itemTotal = Number(it.agreedUnitPrice) * Number(it.quantity);
        subtotal += itemTotal;
        return {
          productId: it.productId,
          productName: it.productName,
          quantity: Number(it.quantity),
          agreedUnitPrice: Number(it.agreedUnitPrice),
          customisationNote: it.customisationNote || undefined
        };
      });

      const totalQuotedAmount = subtotal + Number(shippingCharge) + Number(taxAmount);
      const quoteId = 'quote-' + generateCryptoId(16);

      batchStatements.push(
        env.DB.prepare(`
          INSERT INTO order_quotations (
            id, order_id, revision_number, items_quotation_json, items_subtotal,
            shipping_charge, tax_amount, total_quoted_amount, quotation_notes,
            created_by_admin, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          quoteId,
          orderId,
          nextRev,
          JSON.stringify(quotedItems),
          subtotal,
          Number(shippingCharge),
          Number(taxAmount),
          totalQuotedAmount,
          quotationNotes,
          session.user.name,
          nowIso
        )
      );
    }

    if (batchStatements.length > 0) {
      await env.DB.batch(batchStatements);
    }

    await logAudit(env, 'order', orderId, 'admin_update_order', session.user.email, {
      status,
      hasNewNote: Boolean(internalNote),
      hasNewQuotation: Boolean(quotation)
    });

    return jsonResponse({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (err) {
    console.error('Admin order update error:', err);
    return errorResponse(`Failed to update order: ${err.message}`, 500);
  }
}
