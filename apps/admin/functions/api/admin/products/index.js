import { jsonResponse, errorResponse, requireAdminAuth, generateCryptoId, logAudit } from '../../../_utils.js';

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
             p.customisation_info, p.status, p.is_demo, p.created_at, p.updated_at,
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
      query += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
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
      isDemo = false
    } = body;

    if (!sku || !name || !description) {
      return errorResponse('SKU, Name and Description are required', 400);
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
        customisation_info, status, is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
