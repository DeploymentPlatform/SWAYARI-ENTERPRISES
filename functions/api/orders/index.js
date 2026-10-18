import {
  requireAuth,
  generateCryptoId,
  generateOrderReference,
  jsonResponse,
  errorResponse,
  logAudit
} from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const session = await requireAuth(request, env);
    const customerId = session.user.id;

    const { results } = await env.DB.prepare(`
      SELECT 
        o.id,
        o.idempotency_key,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.delivery_city,
        o.delivery_state,
        o.status,
        o.initial_indicative_subtotal,
        o.created_at,
        o.updated_at,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT total_quoted_amount FROM order_quotations WHERE order_id = o.id ORDER BY revision_number DESC LIMIT 1) as latest_quote_total
      FROM orders o
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `).bind(customerId).all();

    return jsonResponse({
      success: true,
      orders: results
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Failed to load orders: ${err.message}`, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const session = await requireAuth(request, env);
    const customerId = session.user.id;

    const body = await request.json();
    const {
      idempotencyKey,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryPincode,
      customerNotes,
      items
    } = body;

    // Validate idempotency key
    if (!idempotencyKey || typeof idempotencyKey !== 'string' || idempotencyKey.length < 8) {
      return errorResponse('Valid idempotency key is required to prevent duplicate order requests', 400);
    }

    // Check if an order with this idempotency key already exists for this customer
    const existingOrder = await env.DB.prepare(`
      SELECT id, status, initial_indicative_subtotal, created_at 
      FROM orders 
      WHERE idempotency_key = ? AND customer_id = ?
    `).bind(idempotencyKey, customerId).first();

    if (existingOrder) {
      return jsonResponse({
        success: true,
        orderId: existingOrder.id,
        status: existingOrder.status,
        indicativeSubtotal: existingOrder.initial_indicative_subtotal,
        isExisting: true,
        message: 'Order request already recorded'
      }, 200);
    }

    // Input validations
    if (!customerName || customerName.trim().length < 2) {
      return errorResponse('Please provide a valid full name', 400);
    }
    const cleanPhone = (customerPhone || '').replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return errorResponse('Please provide a valid 10-digit telephone number for order verification', 400);
    }
    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      return errorResponse('Please provide a complete delivery street address', 400);
    }
    if (!deliveryCity || !deliveryState || !deliveryPincode) {
      return errorResponse('City, State, and Pincode are required for delivery calculations', 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse('Order request must contain at least one item', 400);
    }

    // Re-verify all products and variants from the server database
    // NEVER TRUST client-submitted prices, titles, or subtotals!
    let indicativeSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodId = item.productId;
      const qty = parseInt(item.quantity, 10);

      if (!prodId || isNaN(qty) || qty < 1) {
        return errorResponse('Invalid product item or quantity in order request', 400);
      }

      const prod = await env.DB.prepare(`
        SELECT id, sku, name, indicative_price, images, variants_json, min_quantity, status
        FROM products
        WHERE id = ?
      `).bind(prodId).first();

      if (!prod) {
        return errorResponse(`Product not found or no longer available (ID: ${prodId})`, 404);
      }

      if (prod.status !== 'published' && session.user.role !== 'admin') {
        return errorResponse(`Product "${prod.name}" is currently not available for requests`, 400);
      }

      if (qty < (prod.min_quantity || 1)) {
        return errorResponse(`Minimum requested quantity for "${prod.name}" is ${prod.min_quantity || 1}`, 400);
      }

      // Check variant if specified
      let selectedVariantName = null;
      let unitPrice = prod.indicative_price; // can be null (price on request)

      if (item.variantId && prod.variants_json) {
        try {
          const variants = JSON.parse(prod.variants_json);
          const matchedVariant = variants.find(v => v.id === item.variantId);
          if (matchedVariant) {
            selectedVariantName = matchedVariant.name;
            if (matchedVariant.indicative_price != null) {
              unitPrice = matchedVariant.indicative_price;
            }
          }
        } catch (_) {}
      }

      let images = [];
      try { images = JSON.parse(prod.images || '[]'); } catch (_) {}
      const primaryImg = images[0] || null;

      if (unitPrice != null) {
        indicativeSubtotal += (unitPrice * qty);
      }

      validatedItems.push({
        id: 'item-' + generateCryptoId(12),
        productId: prod.id,
        productSku: prod.sku,
        productName: prod.name,
        selectedVariant: selectedVariantName,
        quantity: qty,
        snapshotIndicativePrice: unitPrice,
        snapshotImageUrl: primaryImg,
        customisationNote: item.customisationNote ? String(item.customisationNote).slice(0, 500) : null
      });
    }

    const orderId = generateOrderReference();
    const nowIso = new Date().toISOString();

    // Prepare atomic D1 transaction batch
    const statements = [
      env.DB.prepare(`
        INSERT INTO orders (
          id, idempotency_key, customer_id, customer_name, customer_email, customer_phone,
          delivery_address, delivery_city, delivery_state, delivery_pincode, customer_notes,
          status, initial_indicative_subtotal, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new_request', ?, ?, ?)
      `).bind(
        orderId,
        idempotencyKey,
        customerId,
        customerName.trim(),
        session.user.email,
        cleanPhone,
        deliveryAddress.trim(),
        deliveryCity.trim(),
        deliveryState.trim(),
        deliveryPincode.trim(),
        customerNotes ? customerNotes.trim().slice(0, 1000) : null,
        indicativeSubtotal > 0 ? indicativeSubtotal : null,
        nowIso,
        nowIso
      )
    ];

    for (const vItem of validatedItems) {
      statements.push(
        env.DB.prepare(`
          INSERT INTO order_items (
            id, order_id, product_id, product_sku, product_name, selected_variant,
            quantity, snapshot_indicative_price, snapshot_image_url, customisation_note
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          vItem.id,
          orderId,
          vItem.productId,
          vItem.productSku,
          vItem.productName,
          vItem.selectedVariant,
          vItem.quantity,
          vItem.snapshotIndicativePrice,
          vItem.snapshotImageUrl,
          vItem.customisationNote
        )
      );
    }

    // Add audit entry in the batch
    const auditId = 'aud-' + generateCryptoId(16);
    statements.push(
      env.DB.prepare(`
        INSERT INTO audit_logs (id, entity_type, entity_id, action, performed_by, details_json, created_at)
        VALUES (?, 'order', ?, 'request_created', ?, ?, ?)
      `).bind(
        auditId,
        orderId,
        session.user.email,
        JSON.stringify({ itemCount: validatedItems.length, subtotal: indicativeSubtotal }),
        nowIso
      )
    );

    // Atomically execute batch
    await env.DB.batch(statements);

    return jsonResponse({
      success: true,
      orderId: orderId,
      status: 'new_request',
      indicativeSubtotal: indicativeSubtotal > 0 ? indicativeSubtotal : null,
      message: 'Order request submitted successfully'
    }, 201);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Order creation error:', err);
    return errorResponse(`Failed to submit order request: ${err.message}`, 500);
  }
}
