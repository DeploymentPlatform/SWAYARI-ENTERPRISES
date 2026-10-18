import {
  requireAdmin,
  generateCryptoId,
  jsonResponse,
  errorResponse,
  logAudit
} from '../../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    await requireAdmin(request, env);

    const { results } = await env.DB.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.display_order ASC, c.name ASC
    `).all();

    return jsonResponse({
      success: true,
      categories: results
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Failed to load admin categories: ${err.message}`, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const session = await requireAdmin(request, env);
    const body = await request.json();

    const { name, slug, description, displayOrder } = body;
    if (!name || !name.trim()) {
      return errorResponse('Category name is required', 400);
    }

    const cleanSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    const catId = 'cat-' + generateCryptoId(8);
    const nowIso = new Date().toISOString();

    const existing = await env.DB.prepare('SELECT id FROM categories WHERE slug = ?').bind(cleanSlug).first();
    if (existing) {
      return errorResponse('A category with this slug already exists', 400);
    }

    await env.DB.prepare(`
      INSERT INTO categories (id, name, slug, description, display_order, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).bind(
      catId,
      name.trim(),
      cleanSlug,
      description ? description.trim() : null,
      parseInt(displayOrder, 10) || 0,
      nowIso
    ).run();

    await logAudit(env, 'category', catId, 'create_category', session.user.email, { name, slug: cleanSlug });

    return jsonResponse({
      success: true,
      categoryId: catId,
      message: 'Category created successfully'
    }, 201);
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Failed to create category: ${err.message}`, 500);
  }
}
