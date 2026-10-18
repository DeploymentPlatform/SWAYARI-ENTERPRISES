import { jsonResponse, errorResponse, requireAdminAuth, generateCryptoId, logAudit } from '../../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const { results } = await env.DB.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `).all();

    const categories = (results || []).map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      displayOrder: row.display_order,
      isActive: Boolean(row.is_active),
      productCount: Number(row.product_count || 0),
      createdAt: row.created_at
    }));

    return jsonResponse({
      success: true,
      categories
    });
  } catch (err) {
    return errorResponse(`Failed to load categories: ${err.message}`, 500);
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
    const { name, slug, description, displayOrder = 0 } = body;

    if (!name) {
      return errorResponse('Category name is required', 400);
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const id = 'cat-' + generateCryptoId(12);
    const nowIso = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO categories (id, name, slug, description, display_order, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).bind(id, name.trim(), finalSlug, description || null, Number(displayOrder) || 0, nowIso).run();

    await logAudit(env, 'category', id, 'admin_create_category', session.user.email, { name, slug: finalSlug });

    return jsonResponse({
      success: true,
      categoryId: id,
      message: 'Category created successfully'
    }, 201);
  } catch (err) {
    return errorResponse(`Failed to create category: ${err.message}`, 500);
  }
}
