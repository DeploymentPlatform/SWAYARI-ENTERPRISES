import { jsonResponse, errorResponse, requireCustomerAuth, generateOrderReference, generateCryptoId, logAudit } from '../../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Authenticate customer
  let session;
  try {
    session = await requireCustomerAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const payload = await request.json();
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
    } = payload;

    // 2. Validate input
    if (!idempotencyKey || typeof idempotencyKey !== 'string' || idempotencyKey.length < 8) {
      return errorResponse('Valid idempotencyKey is required (minimum 8 characters)', 400);
    }
    if (!customerName || customerName.trim().length < 2) {
      return errorResponse('Valid customerName is required', 400);
    }
    const cleanPhone = String(customerPhone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return errorResponse('Valid 10-digit mobile number is required', 400);
    }
    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      return errorResponse('Detailed delivery address is required', 400);
    }
    if (!deliveryCity || !deliveryState || !deliveryPincode) {
      return errorResponse('City, state and 6-digit pincode are required', 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse('Order must contain at least one product item', 400);
    }

    // 3. Idempotency Check: Return existing order if identical idempotency token submitted
    const existingOrder = await env.DB.prepare(`
      SELECT id, status, initial_indicative_subtotal, created_at
      FROM orders
      WHERE idempotency_key = ?
    `).bind(idempotencyKey).first();

    if (existingOrder) {
      return jsonResponse({
        success: true,
        orderId: existingOrder.id,
        orderReference: existingOrder.id,
        status: existingOrder.status,
        indicativeSubtotal: existingOrder.initial_indicative_subtotal,
        isExisting: true,
        message: 'Order request was already received and recorded.'
      }, 200);
    }

    // 4. Server-side product price re-verification: Do NOT trust client submitted prices!
    const verifiedItems = [];
    let calculatedSubtotal = 0;
    let hasUnpricedItem = false;

    for (const item of items) {
      const prod = await env.DB.prepare(`
        SELECT id, sku, name, indicative_price, images, status, min_quantity
        FROM products
        WHERE id = ?
      `).bind(item.productId).first();

      if (!prod) {
        return errorResponse(`Product ${item.productId} was not found or is no longer available`, 404);
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const images = JSON.parse(prod.images || '[]');
      const firstImage = images.length > 0 ? images[0] : null;

      if (prod.indicative_price !== null && prod.indicative_price !== undefined) {
        calculatedSubtotal += Number(prod.indicative_price) * qty;
      } else {
        hasUnpricedItem = true;
      }

      verifiedItems.push({
        id: 'item-' + generateCryptoId(16),
        productId: prod.id,
        productSku: prod.sku,
        productName: prod.name,
        selectedVariant: item.selectedVariant || null,
        quantity: qty,
        snapshotIndicativePrice: prod.indicative_price !== null ? Number(prod.indicative_price) : null,
        snapshotImageUrl: firstImage,
        customisationNote: item.customisationNote ? String(item.customisationNote).slice(0, 500) : null
      });
    }

    // 5. Generate Order Reference
    const orderId = generateOrderReference();
    const nowIso = new Date().toISOString();
    const finalSubtotal = hasUnpricedItem && calculatedSubtotal === 0 ? null : calculatedSubtotal;

    // 6. Atomic save with D1 batch transaction
    const batchStatements = [
      env.DB.prepare(`
        INSERT INTO orders (
          id, idempotency_key, customer_id, customer_name, customer_email,
          customer_phone, delivery_address, delivery_city, delivery_state,
          delivery_pincode, customer_notes, status, initial_indicative_subtotal,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new_request', ?, ?, ?)
      `).bind(
        orderId,
        idempotencyKey,
        session.user.id,
        customerName.trim(),
        session.user.email,
        cleanPhone.slice(-10),
        deliveryAddress.trim(),
        deliveryCity.trim(),
        deliveryState.trim(),
        deliveryPincode.trim(),
        customerNotes ? customerNotes.trim() : null,
        finalSubtotal,
        nowIso,
        nowIso
      )
    ];

    for (const vItem of verifiedItems) {
      batchStatements.push(
        env.DB.prepare(`
          INSERT INTO order_items (
            id, order_id, product_id, product_sku, product_name,
            selected_variant, quantity, snapshot_indicative_price,
            snapshot_image_url, customisation_note
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

    // Execute atomic batch
    await env.DB.batch(batchStatements);

    // Audit log
    await logAudit(env, 'order', orderId, 'customer_submitted_request', session.user.email, {
      itemCount: verifiedItems.length,
      subtotal: finalSubtotal
    });

    return jsonResponse({
      success: true,
      orderId,
      orderReference: orderId,
      status: 'new_request',
      indicativeSubtotal: finalSubtotal,
      message: 'Your order request has been received. Our team will contact you shortly to confirm details.'
    }, 201);
  } catch (err) {
    console.error('Order Submission Error:', err);
    return errorResponse(`Failed to submit order request: ${err.message}`, 500);
  }
}
