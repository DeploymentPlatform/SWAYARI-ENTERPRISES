import { jsonResponse, errorResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { params, env, request } = context;
  const slug = params.slug;
  const includeDemo = new URL(request.url).searchParams.get('include_demo') === '1';

  if (!slug) {
    return errorResponse('Product slug is required', 400);
  }

  try {
    const isProduction = env.ENVIRONMENT === 'production';
    const demoFilter = (isProduction || !includeDemo) ? 'AND p.is_demo = 0' : '';

    const row = await env.DB.prepare(`
      SELECT p.id, p.sku, p.name, p.slug, p.description, p.category_id,
             p.images, p.material, p.dimensions, p.has_variants, p.variants_json,
             p.indicative_price, p.min_quantity, p.availability_label,
             p.customisation_info, p.status, p.is_demo, p.price_type, p.set_contents,
             p.order_increment, p.is_quote_only, p.bulk_tiers_json, p.packaging_options_json,
             p.shipping_info, p.occasions_json, p.supports_individual, p.supports_bulk,
             p.deity, p.frame_size, p.orientation, p.border_finish,
             p.created_at, p.updated_at,
             c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.status = 'published' AND (p.indicative_price IS NULL OR p.indicative_price <= 99) ${demoFilter}
    `).bind(slug).first();

    if (!row) {
      return errorResponse('Product not found', 404);
    }

    const product = {
      id: row.id,
      sku: row.sku,
      name: row.name,
      slug: row.slug,
      description: row.description,
      categoryId: row.category_id,
      categoryName: row.category_name,
      categorySlug: row.category_slug,
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
    };

    return jsonResponse({
      success: true,
      product
    });
  } catch (err) {
    return errorResponse(`Failed to fetch product details: ${err.message}`, 500);
  }
}
