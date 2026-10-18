import { jsonResponse, errorResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'published' AND p.is_demo = 0) as published_count,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as total_count
      FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.display_order ASC, c.name ASC
    `).all();

    return jsonResponse({
      success: true,
      categories: results.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        displayOrder: r.display_order,
        publishedCount: r.published_count,
        totalCount: r.total_count
      }))
    });
  } catch (err) {
    return errorResponse(`Failed to load categories: ${err.message}`, 500);
  }
}
