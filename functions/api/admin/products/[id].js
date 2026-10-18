import {
  requireAdmin,
  jsonResponse,
  errorResponse,
  logAudit
} from '../../../_utils.js';

export async function onRequestPatch(context) {
  const { request, env, params } = context;
  const prodId = params.id;

  try {
    const session = await requireAdmin(request, env);
    const body = await request.json();

    const existing = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(prodId).first();
    if (!existing) {
      return errorResponse('Product not found', 404);
    }

    const nowIso = new Date().toISOString();
    const sku = body.sku !== undefined ? body.sku.trim().toUpperCase() : existing.sku;
    const name = body.name !== undefined ? body.name.trim() : existing.name;
    const slug = body.slug !== undefined ? body.slug.trim() : existing.slug;
    const description = body.description !== undefined ? body.description.trim() : existing.description;
    const categoryId = body.categoryId !== undefined ? (body.categoryId || null) : existing.category_id;
    const images = body.images !== undefined ? JSON.stringify(body.images) : existing.images;
    const material = body.material !== undefined ? (body.material ? body.material.trim() : null) : existing.material;
    const dimensions = body.dimensions !== undefined ? (body.dimensions ? body.dimensions.trim() : null) : existing.dimensions;
    const hasVariants = body.hasVariants !== undefined ? (body.hasVariants ? 1 : 0) : existing.has_variants;
    const variantsJson = body.variants !== undefined ? JSON.stringify(body.variants) : existing.variants_json;
    const indicativePrice = body.indicativePrice !== undefined 
      ? (body.indicativePrice !== '' && body.indicativePrice !== null ? parseFloat(body.indicativePrice) : null)
      : existing.indicative_price;
    const minQuantity = body.minQuantity !== undefined ? parseInt(body.minQuantity, 10) : existing.min_quantity;
    const availabilityLabel = body.availabilityLabel !== undefined ? body.availabilityLabel.trim() : existing.availability_label;
    const customisationInfo = body.customisationInfo !== undefined ? (body.customisationInfo ? body.customisationInfo.trim() : null) : existing.customisation_info;
    const status = body.status !== undefined && ['draft', 'published', 'archived'].includes(body.status) ? body.status : existing.status;
    const isDemo = body.isDemo !== undefined ? (body.isDemo ? 1 : 0) : existing.is_demo;

    await env.DB.prepare(`
      UPDATE products SET
        sku = ?, name = ?, slug = ?, description = ?, category_id = ?,
        images = ?, material = ?, dimensions = ?, has_variants = ?,
        variants_json = ?, indicative_price = ?, min_quantity = ?,
        availability_label = ?, customisation_info = ?, status = ?,
        is_demo = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      sku, name, slug, description, categoryId,
      images, material, dimensions, hasVariants,
      variantsJson, indicativePrice, minQuantity,
      availabilityLabel, customisationInfo, status,
      isDemo, nowIso, prodId
    ).run();

    await logAudit(env, 'product', prodId, 'update_product', session.user.email, { status, sku, name });

    return jsonResponse({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Failed to update product: ${err.message}`, 500);
  }
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const prodId = params.id;

  try {
    const session = await requireAdmin(request, env);
    const existing = await env.DB.prepare('SELECT id, name FROM products WHERE id = ?').bind(prodId).first();
    if (!existing) {
      return errorResponse('Product not found', 404);
    }

    const nowIso = new Date().toISOString();
    // Soft archive so historical orders are completely preserved
    await env.DB.prepare(`
      UPDATE products SET status = 'archived', updated_at = ? WHERE id = ?
    `).bind(nowIso, prodId).run();

    await logAudit(env, 'product', prodId, 'archive_product', session.user.email, { name: existing.name });

    return jsonResponse({
      success: true,
      message: 'Product archived successfully'
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Failed to archive product: ${err.message}`, 500);
  }
}
