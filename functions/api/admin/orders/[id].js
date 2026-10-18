import {
  requireAdmin,
  generateCryptoId,
  jsonResponse,
  errorResponse,
  logAudit
} from '../../../_utils.js';

const ALLOWED_STATUSES = [
  'new_request',
  'contacted',
  'quoted',
  'confirmed',
  'dispatched',
  'completed',
  'cancelled'
];

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const orderId = params.id;

  try {
    await requireAdmin(request, env);

    const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Original items requested
    const { results: items } = await env.DB.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).bind(orderId).all();

    // Quotation revisions
    const { results: quotes } = await env.DB.prepare(`
      SELECT * FROM order_quotations WHERE order_id = ? ORDER BY revision_number DESC
    `).bind(orderId).all();

    // Internal notes (Admin only)
    const { results: internalNotes } = await env.DB.prepare(`
      SELECT * FROM order_internal_notes WHERE order_id = ? ORDER BY created_at ASC
    `).bind(orderId).all();

    // Audit logs for this order
    const { results: audits } = await env.DB.prepare(`
      SELECT * FROM audit_logs WHERE entity_type = 'order' AND entity_id = ? ORDER BY created_at DESC
    `).bind(orderId).all();

    return jsonResponse({
      success: true,
      order: {
        ...order,
        items: items.map(it => ({
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
        quotations: quotes.map(q => {
          let itemsQuote = [];
          try { itemsQuote = JSON.parse(q.items_quotation_json); } catch (_) {}
          return {
            id: q.id,
            revisionNumber: q.revision_number,
            items: itemsQuote,
            itemsSubtotal: q.items_subtotal,
            shippingCharge: q.shipping_charge,
            taxAmount: q.tax_amount,
            totalQuotedAmount: q.total_quoted_amount,
            quotationNotes: q.quotation_notes,
            createdByAdmin: q.created_by_admin,
            createdAt: q.created_at
          };
        }),
        internalNotes: internalNotes.map(n => ({
          id: n.id,
          adminId: n.admin_id,
          adminName: n.admin_name,
          note: n.note,
          createdAt: n.created_at
        })),
        auditLogs: audits.map(a => {
          let details = null;
          try { details = JSON.parse(a.details_json); } catch (_) {}
          return {
            id: a.id,
            action: a.action,
            performedBy: a.performed_by,
            details: details,
            createdAt: a.created_at
          };
        })
      }
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Failed to load admin order details: ${err.message}`, 500);
  }
}

export async function onRequestPatch(context) {
  const { request, env, params } = context;
  const orderId = params.id;

  try {
    const session = await requireAdmin(request, env);
    const body = await request.json();
    const nowIso = new Date().toISOString();

    const existingOrder = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
    if (!existingOrder) {
      return errorResponse('Order not found', 404);
    }

    const updates = [];
    const changeLog = {};

    // 1. Update order status
    if (body.status) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return errorResponse(`Invalid status: ${body.status}. Allowed values: ${ALLOWED_STATUSES.join(', ')}`, 400);
      }
      if (body.status !== existingOrder.status) {
        await env.DB.prepare(`
          UPDATE orders SET status = ?, updated_at = ? WHERE id = ?
        `).bind(body.status, nowIso, orderId).run();
        changeLog.statusChange = { from: existingOrder.status, to: body.status };
        updates.push(`Status changed to ${body.status}`);
      }
    }

    // 2. Add quotation revision if provided
    if (body.quotation && Array.isArray(body.quotation.items)) {
      const qItems = body.quotation.items;
      let itemsSubtotal = 0;

      const validatedQuoteItems = qItems.map(item => {
        const unitPrice = parseFloat(item.agreedUnitPrice) || 0;
        const qty = parseInt(item.quantity, 10) || 1;
        const lineTotal = unitPrice * qty;
        itemsSubtotal += lineTotal;
        return {
          productId: item.productId,
          productName: item.productName,
          quantity: qty,
          agreedUnitPrice: unitPrice,
          lineTotal: lineTotal
        };
      });

      const shippingCharge = parseFloat(body.quotation.shippingCharge) || 0;
      const taxAmount = parseFloat(body.quotation.taxAmount) || 0;
      const totalQuotedAmount = itemsSubtotal + shippingCharge + taxAmount;

      // Find current latest revision
      const lastQuote = await env.DB.prepare(`
        SELECT MAX(revision_number) as max_rev FROM order_quotations WHERE order_id = ?
      `).bind(orderId).first();
      const nextRev = (lastQuote?.max_rev || 0) + 1;

      const quoteId = 'qt-' + generateCryptoId(12);
      await env.DB.prepare(`
        INSERT INTO order_quotations (
          id, order_id, revision_number, items_quotation_json, items_subtotal,
          shipping_charge, tax_amount, total_quoted_amount, quotation_notes,
          created_by_admin, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        quoteId,
        orderId,
        nextRev,
        JSON.stringify(validatedQuoteItems),
        itemsSubtotal,
        shippingCharge,
        taxAmount,
        totalQuotedAmount,
        body.quotation.quotationNotes ? String(body.quotation.quotationNotes).slice(0, 1000) : null,
        session.user.name || session.user.email,
        nowIso
      ).run();

      changeLog.newQuotation = { revision: nextRev, total: totalQuotedAmount, shipping: shippingCharge };
      updates.push(`Added quotation Revision #${nextRev} (Total: ₹${totalQuotedAmount})`);
    }

    // 3. Add internal note if provided
    if (body.internalNote && body.internalNote.trim()) {
      const noteId = 'note-' + generateCryptoId(12);
      await env.DB.prepare(`
        INSERT INTO order_internal_notes (id, order_id, admin_id, admin_name, note, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        noteId,
        orderId,
        session.user.id,
        session.user.name || session.user.email,
        body.internalNote.trim(),
        nowIso
      ).run();

      changeLog.internalNoteAdded = true;
      updates.push('Internal note added');
    }

    // Record audit log
    if (updates.length > 0) {
      await logAudit(
        env,
        'order',
        orderId,
        'order_updated',
        session.user.email,
        changeLog
      );
    }

    return jsonResponse({
      success: true,
      message: updates.join(', ') || 'No changes made',
      changes: changeLog
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Failed to update order: ${err.message}`, 500);
  }
}
