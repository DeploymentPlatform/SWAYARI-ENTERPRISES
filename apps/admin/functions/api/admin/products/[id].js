import { jsonResponse, errorResponse, requireAdminAuth, logAudit } from '../../../_utils.js';

export async function onRequestGet(context) {
  const { params, request, env } = context;
  const productId = params.id;

  try {
    await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const row = await env.DB.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).bind(productId).first();

    if (!row) {
      return errorResponse('Product not found', 404);
    }

    return jsonResponse({
      success: true,
      product: {
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
      }
    });
  } catch (err) {
    return errorResponse(`Failed to load product: ${err.message}`, 500);
  }
}

export async function onRequestPut(context) {
  const { params, request, env } = context;
  const productId = params.id;

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
      status,
      isDemo
    } = body;

    const existing = await env.DB.prepare('SELECT id FROM products WHERE id = ?').bind(productId).first();
    if (!existing) {
      return errorResponse('Product not found', 404);
    }

    const nowIso = new Date().toISOString();

    await env.DB.prepare(`
      UPDATE products SET
        sku = ?, name = ?, slug = ?, description = ?, category_id = ?,
        images = ?, material = ?, dimensions = ?, has_variants = ?, variants_json = ?,
        indicative_price = ?, min_quantity = ?, availability_label = ?,
        customisation_info = ?, status = ?, is_demo = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      sku.trim().toUpperCase(),
      name.trim(),
      slug.trim(),
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
      status || 'published',
      isDemo ? 1 : 0,
      nowIso,
      productId
    ).run();

    await logAudit(env, 'product', productId, 'admin_update_product', session.user.email, { sku, name, status });

    return jsonResponse({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (err) {
    return errorResponse(`Failed to update product: ${err.message}`, 500);
  }
}

export async function onRequestDelete(context) {
  const { params, request, env } = context;
  const productId = params.id;

  let session;
  try {
    session = await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const nowIso = new Date().toISOString();

    // Soft archive: Never physically delete historical records
    await env.DB.prepare("UPDATE products SET status = 'archived', updated_at = ? WHERE id = ?")
      .bind(nowIso, productId)
      .run();

    await logAudit(env, 'product', productId, 'admin_archive_product', session.user.email);

    return jsonResponse({
      success: true,
      message: 'Product safely archived'
    });
  } catch (err) {
    return errorResponse(`Failed to archive product: ${err.message}`, 500);
  }
}
