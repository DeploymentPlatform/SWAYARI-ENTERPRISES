import { requireAuth, jsonResponse, errorResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const orderId = params.id;

  if (!orderId) {
    return errorResponse('Order reference is required', 400);
  }

  try {
    const session = await requireAuth(request, env);
    const isAdmin = session.user.role === 'admin';

    const order = await env.DB.prepare(`
      SELECT * FROM orders WHERE id = ?
    `).bind(orderId).first();

    if (!order) {
      return errorResponse('Order request not found', 404);
    }

    // Customer isolation check: Customer can only view their own order
    if (!isAdmin && order.customer_id !== session.user.id) {
      return errorResponse('Unauthorized to view this order', 403);
    }

    // Fetch snapshot items
    const { results: items } = await env.DB.prepare(`
      SELECT 
        id, product_id, product_sku, product_name, selected_variant,
        quantity, snapshot_indicative_price, snapshot_image_url, customisation_note
      FROM order_items
      WHERE order_id = ?
    `).bind(orderId).all();

    // Fetch quotation revisions (visible to customer and admin)
    const { results: rawQuotes } = await env.DB.prepare(`
      SELECT 
        id, revision_number, items_quotation_json, items_subtotal,
        shipping_charge, tax_amount, total_quoted_amount, quotation_notes,
        created_at
      FROM order_quotations
      WHERE order_id = ?
      ORDER BY revision_number DESC
    `).bind(orderId).all();

    const quotations = rawQuotes.map(q => {
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
        createdAt: q.created_at
      };
    });

    return jsonResponse({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        deliveryAddress: order.delivery_address,
        deliveryCity: order.delivery_city,
        deliveryState: order.delivery_state,
        deliveryPincode: order.delivery_pincode,
        customerNotes: order.customer_notes,
        initialIndicativeSubtotal: order.initial_indicative_subtotal,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
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
        quotations: quotations,
        latestQuotation: quotations[0] || null
      }
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Failed to load order: ${err.message}`, 500);
  }
}
