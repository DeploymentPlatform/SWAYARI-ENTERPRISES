import { jsonResponse, errorResponse, requireAdminAuth, generateCryptoId, logAudit, validateFramePrice, validateQuantity } from '../../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  try {
    await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  try {
    let query = `
      SELECT p.id, p.sku, p.name, p.slug, p.description, p.category_id,
             p.images, p.material, p.dimensions, p.has_variants, p.variants_json,
             p.indicative_price, p.min_quantity, p.availability_label,
             p.customisation_info, p.status, p.is_demo, p.price_type, p.set_contents,
             p.order_increment, p.is_quote_only, p.bulk_tiers_json, p.packaging_options_json,
             p.shipping_info, p.occasions_json, p.supports_individual, p.supports_bulk,
             p.deity, p.frame_size, p.orientation, p.border_finish,
             p.created_at, p.updated_at,
             c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (search && search.trim().length > 0) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ? OR p.deity LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY p.created_at DESC';

    const stmt = env.DB.prepare(query);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const { results } = await bound.all();

    const products = (results || []).map(row => ({
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
      deity: row.deity || null,
      frameSize: row.frame_size || null,
      orientation: row.orientation || 'portrait',
      borderFinish: row.border_finish || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return jsonResponse({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    return errorResponse(`Failed to load products: ${err.message}`, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

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
      status = 'draft',
      isDemo = false,
      priceType = 'piece',
      setContents = null,
      orderIncrement = 1,
      isQuoteOnly = false,
      bulkTiers = [],
      packagingOptions = [],
      shippingInfo = 'Standard dispatched in 2–4 business days across India',
      occasions = [],
      supportsIndividual = true,
      supportsBulk = true,
      deity = null,
      frameSize = null,
      orientation = 'portrait',
      borderFinish = null
    } = body;

    if (!sku || !name || !description) {
      return errorResponse('SKU, Name and Description are required', 400);
    }

    // Require valid price and photo before publishing live inventory
    if (status === 'published' && !isDemo) {
      if (indicativePrice === undefined || indicativePrice === null || indicativePrice === '') {
        return errorResponse('Published devotional frames must have a valid price (strictly ₹99 or less). Save as draft if unpriced.', 400);
      }
      if (!Array.isArray(images) || images.length === 0) {
        return errorResponse('Published devotional frames must have at least one authentic product photograph attached.', 400);
      }
    }

    // Strict ₹99 rule: Integer paise validation
    const priceCheck = validateFramePrice(indicativePrice, 'Frame indicative price');
    if (!priceCheck.isValid) {
      return errorResponse(priceCheck.error, 400);
    }

    // Validate quantities
    const minQtyNum = Number(minQuantity);
    if (!Number.isFinite(minQtyNum) || !Number.isInteger(minQtyNum) || minQtyNum < 1) {
      return errorResponse('Minimum order quantity must be a positive whole integer (at least 1)', 400);
    }
    const incNum = Number(orderIncrement);
    if (!Number.isFinite(incNum) || !Number.isInteger(incNum) || incNum < 1) {
      return errorResponse('Order increment must be a positive whole integer (at least 1)', 400);
    }

    if (Array.isArray(variants)) {
      for (const v of variants) {
        const vPrice = v.indicativePrice !== undefined ? v.indicativePrice : v.indicative_price;
        const vCheck = validateFramePrice(vPrice, `Variant ${v.name || ''} price`);
        if (!vCheck.isValid) {
          return errorResponse(vCheck.error, 400);
        }
      }
    }

    if (Array.isArray(bulkTiers)) {
      for (const tier of bulkTiers) {
        const tierPrice = tier.unit_price !== undefined ? tier.unit_price : tier.unitPrice;
        const tCheck = validateFramePrice(tierPrice, 'Bulk tier unit price');
        if (!tCheck.isValid) {
          return errorResponse(tCheck.error, 400);
        }
      }
    }

    // Generate clean slug if missing
    const finalSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const id = 'prod-' + generateCryptoId(16);
    const nowIso = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO products (
        id, sku, name, slug, description, category_id,
        images, material, dimensions, has_variants, variants_json,
        indicative_price, min_quantity, availability_label,
        customisation_info, status, is_demo, price_type, set_contents,
        order_increment, is_quote_only, bulk_tiers_json, packaging_options_json,
        shipping_info, occasions_json, supports_individual, supports_bulk,
        deity, frame_size, orientation, border_finish,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      sku.trim().toUpperCase(),
      name.trim(),
      finalSlug,
      description.trim(),
      categoryId || null,
      JSON.stringify(images || []),
      material || null,
      dimensions || null,
      hasVariants ? 1 : 0,
      JSON.stringify(variants || []),
      indicativePrice !== undefined && indicativePrice !== null && indicativePrice !== '' ? Number(indicativePrice) : null,
      minQuantity ? Number(minQuantity) : 1,
      availabilityLabel || 'Available on Request',
      customisationInfo || null,
      status,
      isDemo ? 1 : 0,
      priceType || 'piece',
      setContents || null,
      orderIncrement ? Number(orderIncrement) : 1,
      isQuoteOnly ? 1 : 0,
      JSON.stringify(bulkTiers || []),
      JSON.stringify(packagingOptions || []),
      shippingInfo || 'Standard dispatched in 2–4 business days across India',
      JSON.stringify(occasions || []),
      supportsIndividual ? 1 : 0,
      supportsBulk ? 1 : 0,
      deity || null,
      frameSize || null,
      orientation || 'portrait',
      borderFinish || null,
      nowIso,
      nowIso
    ).run();

    await logAudit(env, 'product', id, 'admin_create_product', session.user.email, { sku, name, status });

    return jsonResponse({
      success: true,
      productId: id,
      message: 'Product created successfully'
    }, 201);
  } catch (err) {
    return errorResponse(`Failed to create product: ${err.message}`, 500);
  }
}
