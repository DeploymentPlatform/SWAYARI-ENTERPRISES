import { jsonResponse, errorResponse, requireCustomerAuth } from '../../_utils.js';

export async function onRequestGet(context) {
  const { params, request, env } = context;
  const orderId = params.id;

  let session;
  try {
    session = await requireCustomerAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    // If orderId is 'my' or empty, list customer's orders
    if (!orderId || orderId === 'my') {
      const { results: orders } = await env.DB.prepare(`
        SELECT id, customer_name, customer_email, customer_phone,
               delivery_city, delivery_state, status, initial_indicative_subtotal,
               created_at, updated_at
        FROM orders
        WHERE customer_id = ?
        ORDER BY created_at DESC
      `).bind(session.user.id).all();

      return jsonResponse({
        success: true,
        orders: orders || []
      });
    }

    // Single order details: Enforce Customer Ownership
    const order = await env.DB.prepare(`
      SELECT id, idempotency_key, customer_id, customer_name, customer_email,
             customer_phone, delivery_address, delivery_city, delivery_state,
             delivery_pincode, customer_notes, status, initial_indicative_subtotal,
             created_at, updated_at
      FROM orders
      WHERE id = ?
    `).bind(orderId).first();

    if (!order) {
      return errorResponse('Order request not found', 404);
    }

    // STRICT CUSTOMER ISOLATION
    if (order.customer_id !== session.user.id) {
      return errorResponse('Access denied to this order', 403);
    }

    // Fetch snapshot items
    const { results: items } = await env.DB.prepare(`
      SELECT id, product_id, product_sku, product_name, selected_variant,
             quantity, snapshot_indicative_price, snapshot_image_url, customisation_note
      FROM order_items
      WHERE order_id = ?
    `).bind(orderId).all();

    // Fetch formal quotation revisions (visible to customer)
    const { results: quotations } = await env.DB.prepare(`
      SELECT id, revision_number, items_quotation_json, items_subtotal,
             shipping_charge, tax_amount, total_quoted_amount, quotation_notes,
             created_at
      FROM order_quotations
      WHERE order_id = ?
      ORDER BY revision_number DESC
    `).bind(orderId).all();

    const formattedQuotations = (quotations || []).map(q => ({
      id: q.id,
      revisionNumber: q.revision_number,
      items: JSON.parse(q.items_quotation_json || '[]'),
      itemsSubtotal: q.items_subtotal,
      shippingCharge: q.shipping_charge,
      taxAmount: q.tax_amount,
      totalQuotedAmount: q.total_quoted_amount,
      notes: q.quotation_notes,
      createdAt: q.created_at
    }));

    // NOTE: order_internal_notes is DELIBERATELY NOT QUERIED OR RETURNED

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
        quotations: formattedQuotations
      }
    });
  } catch (err) {
    return errorResponse(`Failed to fetch order: ${err.message}`, 500);
  }
}
