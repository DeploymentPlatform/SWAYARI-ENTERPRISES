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
      occasion,
      requiredDate,
      isBulkRequest,
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

    // Size limits keep one request from flooding the order queue or the database.
    const TEXT_LIMITS = {
      idempotencyKey: [idempotencyKey, 100],
      customerName: [customerName, 100],
      customerPhone: [customerPhone, 20],
      deliveryAddress: [deliveryAddress, 500],
      deliveryCity: [deliveryCity, 80],
      deliveryState: [deliveryState, 80],
      deliveryPincode: [deliveryPincode, 10],
      customerNotes: [customerNotes, 1000],
      occasion: [occasion, 100],
      requiredDate: [requiredDate, 30]
    };
    for (const [field, [value, max]] of Object.entries(TEXT_LIMITS)) {
      if (value !== undefined && value !== null && typeof value !== 'string' && !(field === 'customerPhone' && typeof value === 'number')) {
        return errorResponse(`${field} must be text`, 400);
      }
      if (String(value ?? '').length > max) {
        return errorResponse(`${field} is too long (maximum ${max} characters)`, 400);
      }
    }
    if (!/^\d{6}$/.test(String(deliveryPincode).trim())) {
      return errorResponse('Enter a valid 6-digit pincode', 400);
    }
    if (items.length > 50) {
      return errorResponse('Too many lines in one request (maximum 50)', 400);
    }
    for (const item of items) {
      if (String(item?.selectedVariant ?? '').length > 100 || String(item?.customisationNote ?? '').length > 300 || String(item?.productId ?? '').length > 100) {
        return errorResponse('An item in this request has a value that is too long', 400);
      }
      if (Number(item?.quantity) > 100000) {
        return errorResponse('Quantity is too large for one request. Please contact our team for very large orders.', 400);
      }
    }

    // 3. Idempotency Check: Return existing order if identical idempotency token submitted
    const existingOrder = await env.DB.prepare(`
      SELECT id, customer_id, status, initial_indicative_subtotal, created_at
      FROM orders
      WHERE idempotency_key = ?
    `).bind(idempotencyKey).first();

    if (existingOrder) {
      // Idempotency keys are only honoured for the customer who created the order.
      if (existingOrder.customer_id !== session.user.id) {
        return errorResponse('This request reference has already been used. Please refresh and try again.', 409);
      }
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

    // 4. Server-side product price & quantity re-verification: Do NOT trust client submitted prices!
    // Group duplicate line items by design (productId + selectedVariant)
    const aggregatedMap = new Map();
    for (const item of items) {
      if (!item || !item.productId || typeof item.productId !== 'string') {
        return errorResponse('Valid productId is required for each item', 400);
      }

      const rawQty = item.quantity;
      if (rawQty === null || rawQty === undefined || typeof rawQty === 'boolean') {
        return errorResponse(`Quantity is missing or invalid for item ${item.productId}`, 400);
      }
      const qty = Number(rawQty);
      if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty <= 0) {
        return errorResponse(`Quantity for item ${item.productId} must be a positive whole integer (no fractions or zero)`, 400);
      }

      const key = `${item.productId}:::${item.selectedVariant || ''}`;
      if (aggregatedMap.has(key)) {
        const existing = aggregatedMap.get(key);
        existing.quantity += qty;
        if (item.customisationNote && item.customisationNote.trim()) {
          existing.customisationNote = existing.customisationNote
            ? `${existing.customisationNote}; ${item.customisationNote.trim()}`
            : item.customisationNote.trim();
        }
      } else {
        aggregatedMap.set(key, {
          productId: item.productId,
          selectedVariant: item.selectedVariant || null,
          quantity: qty,
          customisationNote: item.customisationNote ? String(item.customisationNote).trim() : null
        });
      }
    }

    const aggregatedItems = Array.from(aggregatedMap.values());
    if (aggregatedItems.length > 200) {
      return errorResponse('Too many different items in one request. Please split it or contact our team.', 400);
    }

    // There is no order-wide minimum any more (slabs start at 1 piece). MIN_ORDER_FRAMES in env
    // remains only as an optional switch for tests or a future campaign.
    const MIN_ORDER_FRAMES = Number(env.MIN_ORDER_FRAMES) > 0 ? Number(env.MIN_ORDER_FRAMES) : 1;
    const totalPieces = aggregatedItems.reduce((sum, it) => sum + it.quantity, 0);
    if (totalPieces < MIN_ORDER_FRAMES) {
      return errorResponse(`Minimum order is ${MIN_ORDER_FRAMES} pieces. This request has ${totalPieces}.`, 400);
    }
    if (totalPieces > 100000) {
      return errorResponse('For orders this large please contact our team for a special quote.', 400);
    }
    const MAX_UNIT_PRICE = 20000; // sanity cap; the largest wall frame is well below it
    let calculatedSubtotalPaise = 0;
    let hasUnpricedItem = false;

    // Check environment: preview samples permitted ONLY if explicitly approved development/preview
    const isApprovedDevOrPreview = env.ENVIRONMENT === 'development' || env.ENVIRONMENT === 'preview';

    // Pass 1: load and validate every line, and resolve the price list for its size.
    const lines = [];
    for (const item of aggregatedItems) {
      const prod = await env.DB.prepare(`
        SELECT id, sku, name, indicative_price, images, status, min_quantity, order_increment, is_demo,
               bulk_tiers_json, variants_json, has_variants, price_group
        FROM products
        WHERE id = ?
      `).bind(item.productId).first();

      if (!prod || prod.status !== 'published') {
        return errorResponse(`Product ${item.productId} was not found or is no longer available`, 404);
      }

      // Preview/sample items can only be requested in approved development/preview environments
      if (prod.is_demo && !isApprovedDevOrPreview) {
        return errorResponse(`${prod.name} is a preview sample and cannot be requested`, 400);
      }

      // Enforce MOQ (Minimum Order Quantity)
      const minQty = Math.max(1, parseInt(prod.min_quantity, 10) || 1);
      if (item.quantity < minQty) {
        return errorResponse(`Product "${prod.name}" requires a minimum order quantity of ${minQty} pieces`, 400);
      }

      // Enforce Order Increment
      const increment = Math.max(1, parseInt(prod.order_increment, 10) || 1);
      if ((item.quantity - minQty) % increment !== 0) {
        return errorResponse(`Product "${prod.name}" quantity must be in multiples of ${increment} above the minimum quantity of ${minQty}`, 400);
      }

      // Size: products with sizes must name one of their own; others carry no size.
      let variants = [];
      try {
        variants = JSON.parse(prod.variants_json || '[]');
      } catch {
        variants = [];
      }
      let basePrice = prod.indicative_price !== null && prod.indicative_price !== undefined ? Number(prod.indicative_price) : null;
      let tiers = JSON.parse(prod.bulk_tiers_json || '[]');
      let variantName = null;
      if (Array.isArray(variants) && variants.length > 0) {
        const chosen = variants.find(v => v && v.name === item.selectedVariant) || (variants.length === 1 ? variants[0] : null);
        if (!chosen) {
          return errorResponse(`Please choose a size for "${prod.name}"`, 400);
        }
        variantName = chosen.name;
        if (chosen.indicativePrice !== null && chosen.indicativePrice !== undefined) {
          basePrice = Number(chosen.indicativePrice);
          tiers = Array.isArray(chosen.tiers) ? chosen.tiers : [];
        }
      }

      if (basePrice !== null && (!Number.isFinite(basePrice) || basePrice <= 0 || basePrice > MAX_UNIT_PRICE)) {
        return errorResponse(`Product ${prod.name} has an invalid price. Please contact our team.`, 400);
      }

      lines.push({ item, prod, basePrice, tiers, variantName, slabKey: `${prod.price_group || prod.id}::${variantName || ''}` });
    }

    // Designs of one product and size count together towards a quantity slab.
    const slabTotals = new Map();
    for (const line of lines) {
      slabTotals.set(line.slabKey, (slabTotals.get(line.slabKey) || 0) + line.item.quantity);
    }

    // Pass 2: price each line with its group slab (server-side; client prices are never trusted).
    const verifiedItems = [];
    for (const { item, prod, basePrice, tiers, variantName, slabKey } of lines) {
      let unitPrice = basePrice;
      const groupQty = slabTotals.get(slabKey) || item.quantity;
      if (Array.isArray(tiers) && tiers.length > 0 && unitPrice !== null) {
        const sortedTiers = [...tiers].sort((a, b) => b.min_qty - a.min_qty);
        for (const tier of sortedTiers) {
          if (groupQty >= tier.min_qty && tier.unit_price) {
            const tierPrice = Number(tier.unit_price);
            if (Number.isFinite(tierPrice) && tierPrice > 0 && tierPrice <= unitPrice) {
              unitPrice = tierPrice;
              break;
            }
          }
        }
      }

      if (unitPrice !== null) {
        calculatedSubtotalPaise += Math.round(unitPrice * 100) * item.quantity;
      } else {
        hasUnpricedItem = true;
      }

      const images = JSON.parse(prod.images || '[]');
      const firstImage = images.length > 0 ? images[0] : null;

      verifiedItems.push({
        id: 'item-' + generateCryptoId(16),
        productId: prod.id,
        productSku: prod.sku,
        productName: prod.name,
        selectedVariant: variantName,
        quantity: item.quantity,
        snapshotIndicativePrice: unitPrice,
        snapshotImageUrl: firstImage,
        customisationNote: item.customisationNote ? String(item.customisationNote).slice(0, 500) : null
      });
    }

    // 5. Generate Order Reference
    const orderId = generateOrderReference();
    // Rate limit: at most 5 new requests per customer per hour (re-sends were answered above).
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recent = await env.DB.prepare(
      'SELECT COUNT(*) AS n FROM orders WHERE customer_id = ? AND created_at > ?'
    ).bind(session.user.id, oneHourAgo).first();
    if (recent && Number(recent.n) >= 5) {
      return errorResponse('You have sent several requests in the last hour. Please wait a little or contact our team.', 429);
    }

    const nowIso = new Date().toISOString();
    const finalSubtotal = hasUnpricedItem && calculatedSubtotalPaise === 0 ? null : (calculatedSubtotalPaise / 100);

    // 6. Atomic save with D1 batch transaction
    const batchStatements = [
      env.DB.prepare(`
        INSERT INTO orders (
          id, idempotency_key, customer_id, customer_name, customer_email,
          customer_phone, delivery_address, delivery_city, delivery_state,
          delivery_pincode, customer_notes, status, initial_indicative_subtotal,
          occasion, required_date, is_bulk_request,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new_request', ?, ?, ?, ?, ?, ?)
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
        occasion ? occasion.trim() : null,
        requiredDate ? requiredDate.trim() : null,
        isBulkRequest ? 1 : 0,
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
    return errorResponse(`Failed to submit order request. Please try again.`, 500);
  }
}
