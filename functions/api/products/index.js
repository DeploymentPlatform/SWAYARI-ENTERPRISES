import { jsonResponse, errorResponse, getSession } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  try {
    const session = await getSession(request, env);
    const isAdmin = session?.user?.role === 'admin';

    const categoryParam = url.searchParams.get('category');
    const searchParam = url.searchParams.get('search');
    const includeDemo = url.searchParams.get('include_demo') === '1' || isAdmin;
    const statusParam = url.searchParams.get('status');

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status: Customers only see 'published'
    if (isAdmin && statusParam) {
      query += ` AND p.status = ?`;
      params.push(statusParam);
    } else if (!isAdmin) {
      query += ` AND p.status = 'published'`;
    }

    // Separate demo data from production data
    if (!includeDemo) {
      query += ` AND p.is_demo = 0`;
    }

    // Category filter
    if (categoryParam) {
      query += ` AND (c.slug = ? OR c.id = ?)`;
      params.push(categoryParam, categoryParam);
    }

    // Search filter
    if (searchParam && searchParam.trim()) {
      const term = `%${searchParam.trim()}%`;
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.material LIKE ? OR p.sku LIKE ?)`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY p.created_at DESC`;

    const { results } = await env.DB.prepare(query).bind(...params).all();

    const formatted = results.map(row => {
      let images = [];
      let variants = [];
      try { images = JSON.parse(row.images || '[]'); } catch (_) {}
      try { variants = JSON.parse(row.variants_json || '[]'); } catch (_) {}

      return {
        id: row.id,
        sku: row.sku,
        name: row.name,
        slug: row.slug,
        description: row.description,
        categoryId: row.category_id,
        categoryName: row.category_name,
        categorySlug: row.category_slug,
        images: images,
        primaryImage: images[0] || '/assets/brand/swayari_brand_card.jpeg',
        material: row.material,
        dimensions: row.dimensions,
        hasVariants: Boolean(row.has_variants),
        variants: variants,
        indicativePrice: row.indicative_price, // null = "Price on Request"
        minQuantity: row.min_quantity || 1,
        availabilityLabel: row.availability_label || 'Available on Request',
        customisationInfo: row.customisation_info,
        status: row.status,
        isDemo: Boolean(row.is_demo),
        createdAt: row.created_at
      };
    });

    return jsonResponse({
      success: true,
      count: formatted.length,
      products: formatted
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return errorResponse(`Failed to load products: ${err.message}`, 500);
  }
}
