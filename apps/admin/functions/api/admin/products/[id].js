import { jsonResponse, errorResponse, requireAdminAuth, logAudit } from '../../../_utils.js';

export async function onRequestGet(context) {
  const { params, request, env } = context;
  const productId = params.id;

  try {
    await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const row = await env.DB.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).bind(productId).first();

    if (!row) {
      return errorResponse('Product not found', 404);
    }

    return jsonResponse({
      success: true,
      product: {
        id: row.id,
        sku: row.sku,
        name: row.name,
        slug: row.slug,
        description: row.description,
        categoryId: row.category_id,
        categoryName: row.category_name,
        images: JSON.parse(row.images || '[]'),
        material: row.material,
        dimensions: row.dimensions,
        hasVariants: Boolean(row.has_variants),
        variants: JSON.parse(row.variants_json || '[]'),
        indicativePrice: row.indicative_price !== null ? Number(row.indicative_price) : null,
        minQuantity: row.min_quantity || 1,
        availabilityLabel: row.availability_label,
        customisationInfo: row.customisation_info,
        status: row.status,
        isDemo: Boolean(row.is_demo),
        priceType: row.price_type || 'piece',
        setContents: row.set_contents || null,
        orderIncrement: row.order_increment || 1,
        isQuoteOnly: Boolean(row.is_quote_only),
        bulkTiers: JSON.parse(row.bulk_tiers_json || '[]'),
        packagingOptions: JSON.parse(row.packaging_options_json || '[]'),
        shippingInfo: row.shipping_info || 'Standard dispatched in 2–4 business days across India',
        occasions: JSON.parse(row.occasions_json || '[]'),
        supportsIndividual: row.supports_individual !== null ? Boolean(row.supports_individual) : true,
        supportsBulk: row.supports_bulk !== null ? Boolean(row.supports_bulk) : true,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (err) {
    return errorResponse(`Failed to load product: ${err.message}`, 500);
  }
}

export async function onRequestPut(context) {
  const { params, request, env } = context;
  const productId = params.id;

  let session;
  try {
    session = await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const body = await request.json();
    const {
      sku,
      name,
      slug,
      description,
      categoryId,
      images,
      material,
      dimensions,
      hasVariants,
      variants,
      indicativePrice,
      minQuantity,
      availabilityLabel,
      customisationInfo,
      status,
      isDemo,
      priceType,
      setContents,
      orderIncrement,
      isQuoteOnly,
      bulkTiers,
      packagingOptions,
      shippingInfo,
      occasions,
      supportsIndividual,
      supportsBulk
    } = body;

    const existing = await env.DB.prepare('SELECT id, is_demo, has_variants, variants_json, price_type, set_contents, order_increment, is_quote_only, bulk_tiers_json, packaging_options_json, shipping_info, occasions_json, supports_individual, supports_bulk FROM products WHERE id = ?').bind(productId).first();
    if (!existing) {
      return errorResponse('Product not found', 404);
    }
    if (!sku || !name || !slug || !description) {
      return errorResponse('SKU, name, slug and description are required', 400);
    }

    // Fields the editor does not send are preserved. In particular a preview/sample item must
    // never become live inventory merely because it was edited.
    const finalIsDemo = isDemo === undefined ? Number(existing.is_demo) : (isDemo ? 1 : 0);
    const finalHasVariants = hasVariants === undefined ? Number(existing.has_variants) : (hasVariants ? 1 : 0);
    const finalVariantsJson = variants === undefined ? (existing.variants_json || '[]') : JSON.stringify(variants || []);
    const finalPriceType = priceType !== undefined ? priceType : (existing.price_type || 'piece');
    const finalSetContents = setContents !== undefined ? setContents : existing.set_contents;
    const finalOrderIncrement = orderIncrement !== undefined ? Number(orderIncrement) : (existing.order_increment || 1);
    const finalIsQuoteOnly = isQuoteOnly !== undefined ? (isQuoteOnly ? 1 : 0) : Number(existing.is_quote_only || 0);
    const finalBulkTiersJson = bulkTiers !== undefined ? JSON.stringify(bulkTiers || []) : (existing.bulk_tiers_json || '[]');
    const finalPackagingOptionsJson = packagingOptions !== undefined ? JSON.stringify(packagingOptions || []) : (existing.packaging_options_json || '[]');
    const finalShippingInfo = shippingInfo !== undefined ? shippingInfo : (existing.shipping_info || 'Standard dispatched in 2–4 business days across India');
    const finalOccasionsJson = occasions !== undefined ? JSON.stringify(occasions || []) : (existing.occasions_json || '[]');
    const finalSupportsIndividual = supportsIndividual !== undefined ? (supportsIndividual ? 1 : 0) : (existing.supports_individual !== null ? Number(existing.supports_individual) : 1);
    const finalSupportsBulk = supportsBulk !== undefined ? (supportsBulk ? 1 : 0) : (existing.supports_bulk !== null ? Number(existing.supports_bulk) : 1);

    const nowIso = new Date().toISOString();

    await env.DB.prepare(`
      UPDATE products SET
        sku = ?, name = ?, slug = ?, description = ?, category_id = ?,
        images = ?, material = ?, dimensions = ?, has_variants = ?, variants_json = ?,
        indicative_price = ?, min_quantity = ?, availability_label = ?,
        customisation_info = ?, status = ?, is_demo = ?,
        price_type = ?, set_contents = ?, order_increment = ?, is_quote_only = ?,
        bulk_tiers_json = ?, packaging_options_json = ?, shipping_info = ?,
        occasions_json = ?, supports_individual = ?, supports_bulk = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      sku.trim().toUpperCase(),
      name.trim(),
      slug.trim(),
      description.trim(),
      categoryId || null,
      JSON.stringify(images || []),
      material || null,
      dimensions || null,
      finalHasVariants,
      finalVariantsJson,
      indicativePrice !== undefined && indicativePrice !== null && indicativePrice !== '' ? Number(indicativePrice) : null,
      minQuantity ? Number(minQuantity) : 1,
      availabilityLabel || 'Available on Request',
      customisationInfo || null,
      status || 'published',
      finalIsDemo,
      finalPriceType,
      finalSetContents,
      finalOrderIncrement,
      finalIsQuoteOnly,
      finalBulkTiersJson,
      finalPackagingOptionsJson,
      finalShippingInfo,
      finalOccasionsJson,
      finalSupportsIndividual,
      finalSupportsBulk,
      nowIso,
      productId
    ).run();

    await logAudit(env, 'product', productId, 'admin_update_product', session.user.email, { sku, name, status });

    return jsonResponse({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (err) {
    return errorResponse(`Failed to update product: ${err.message}`, 500);
  }
}

export async function onRequestDelete(context) {
  const { params, request, env } = context;
  const productId = params.id;

  let session;
  try {
    session = await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const nowIso = new Date().toISOString();

    // Soft archive: Never physically delete historical records
    await env.DB.prepare("UPDATE products SET status = 'archived', updated_at = ? WHERE id = ?")
      .bind(nowIso, productId)
      .run();

    await logAudit(env, 'product', productId, 'admin_archive_product', session.user.email);

    return jsonResponse({
      success: true,
      message: 'Product safely archived'
    });
  } catch (err) {
    return errorResponse(`Failed to archive product: ${err.message}`, 500);
  }
}
