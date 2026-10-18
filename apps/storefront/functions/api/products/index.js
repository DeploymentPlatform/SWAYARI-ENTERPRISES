import { jsonResponse, errorResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const categorySlug = url.searchParams.get('category');
  const searchQuery = url.searchParams.get('search');
  const includeDemo = url.searchParams.get('include_demo') === '1';

  try {
    let query = `
      SELECT p.id, p.sku, p.name, p.slug, p.description, p.category_id,
             p.images, p.material, p.dimensions, p.has_variants, p.variants_json,
             p.indicative_price, p.min_quantity, p.availability_label,
             p.customisation_info, p.status, p.is_demo, p.created_at, p.updated_at,
             c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'published'
    `;
    const params = [];

    // Strictly exclude demo items unless explicitly asked for in preview mode
    if (!includeDemo) {
      query += ' AND p.is_demo = 0';
    }

    if (categorySlug) {
      query += ' AND c.slug = ?';
      params.push(categorySlug);
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
