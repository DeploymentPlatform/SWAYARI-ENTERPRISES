import { jsonResponse, errorResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const categorySlug = url.searchParams.get('category');
  const searchQuery = url.searchParams.get('search');
  const budgetBand = url.searchParams.get('budget');
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
             p.created_at, p.updated_at,
             c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'published'
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

    // Budget Band filtering: strictly exclude quote-only items and verify inclusive bounds
    if (budgetBand === 'under-99') {
      query += ' AND p.indicative_price IS NOT NULL AND p.is_quote_only = 0 AND p.indicative_price <= 99';
    } else if (budgetBand === '100-299') {
      query += ' AND p.indicative_price IS NOT NULL AND p.is_quote_only = 0 AND p.indicative_price >= 100 AND p.indicative_price <= 299';
    } else if (budgetBand === '300-499') {
      query += ' AND p.indicative_price IS NOT NULL AND p.is_quote_only = 0 AND p.indicative_price >= 300 AND p.indicative_price <= 499';
    } else if (budgetBand === '500-999') {
      query += ' AND p.indicative_price IS NOT NULL AND p.is_quote_only = 0 AND p.indicative_price >= 500 AND p.indicative_price <= 999';
    } else if (budgetBand === 'under-999') {
      query += ' AND p.indicative_price IS NOT NULL AND p.is_quote_only = 0 AND p.indicative_price <= 999';
    }

    if (occasion && occasion.trim().length > 0) {
      query += ' AND p.occasions_json LIKE ?';
      params.push(`%${occasion.trim()}%`);
    }

    if (bulkOnly) {
      query += ' AND p.supports_bulk = 1';
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.material LIKE ?)';
      const term = `%${searchQuery.trim()}%`;
      params.push(term, term, term);
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
