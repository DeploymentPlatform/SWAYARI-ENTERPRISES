import { jsonResponse, errorResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const categorySlug = url.searchParams.get('category');
  const searchQuery = url.searchParams.get('search');
  const budgetBand = url.searchParams.get('budget');
  const deity = url.searchParams.get('deity');
  const frameSize = url.searchParams.get('frame_size') || url.searchParams.get('size');
  const orientation = url.searchParams.get('orientation');
  const occasion = url.searchParams.get('occasion');
  const bulkOnly = url.searchParams.get('bulk') === '1';
  const includeDemo = url.searchParams.get('include_demo') === '1';

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
             c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'published' AND (p.indicative_price IS NULL OR p.indicative_price <= 99)
    `;
    const params = [];

    const isProduction = env.ENVIRONMENT === 'production';
    // Strictly exclude demo items unless explicitly asked for in preview mode
    if (isProduction || !includeDemo) {
      query += ' AND p.is_demo = 0';
    }

    if (categorySlug) {
      query += ' AND c.slug = ?';
      params.push(categorySlug);
    }

    // Devotional Frame Deity filter
    if (deity && deity.trim().length > 0 && deity !== 'all') {
      query += ' AND LOWER(p.deity) LIKE ?';
      params.push(`%${deity.trim().toLowerCase()}%`);
    }

    // Frame size filter
    if (frameSize && frameSize.trim().length > 0 && frameSize !== 'all') {
      query += ' AND LOWER(p.frame_size) LIKE ?';
      params.push(`%${frameSize.trim().toLowerCase()}%`);
    }

    // Orientation filter
    if (orientation && orientation.trim().length > 0 && orientation !== 'all') {
      query += ' AND LOWER(p.orientation) = ?';
      params.push(orientation.trim().toLowerCase());
    }

    // Price Band filtering: strictly <= 99
    if (budgetBand === 'under-49') {
      query += ' AND p.indicative_price IS NOT NULL AND p.indicative_price <= 49';
    } else if (budgetBand === '50-79') {
      query += ' AND p.indicative_price IS NOT NULL AND p.indicative_price >= 50 AND p.indicative_price <= 79';
    } else if (budgetBand === '80-99') {
      query += ' AND p.indicative_price IS NOT NULL AND p.indicative_price >= 80 AND p.indicative_price <= 99';
    } else if (budgetBand === 'under-99' || budgetBand === 'all-99') {
      query += ' AND p.indicative_price IS NOT NULL AND p.indicative_price <= 99';
    }

    if (occasion && occasion.trim().length > 0) {
      query += ' AND p.occasions_json LIKE ?';
      params.push(`%${occasion.trim()}%`);
    }

    if (bulkOnly) {
      query += ' AND p.supports_bulk = 1';
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.material LIKE ? OR p.deity LIKE ?)';
      const term = `%${searchQuery.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY p.created_at DESC LIMIT 100';

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
    }));

    return jsonResponse({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Products List Error:', err);
    return errorResponse(`Failed to fetch products: ${err.message}`, 500);
  }
}
