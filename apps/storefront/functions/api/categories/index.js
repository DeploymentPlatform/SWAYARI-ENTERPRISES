import { jsonResponse, errorResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const includeDemo = new URL(request.url).searchParams.get('include_demo') === '1';

  try {
    const { results } = await env.DB.prepare(`
      SELECT c.id, c.name, c.slug, c.description, c.display_order,
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'published' ${includeDemo ? '' : 'AND p.is_demo = 0'}
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `).all();

    const categories = (results || []).map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      displayOrder: row.display_order,
      productCount: Number(row.product_count || 0)
    }));

    return jsonResponse({
      success: true,
      categories
    });
  } catch (err) {
    return errorResponse(`Failed to fetch categories: ${err.message}`, 500);
  }
}
