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
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `).all();

    return jsonResponse({
      success: true,
      count: results.length,
      products: results.map(row => {
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
          images: images,
          material: row.material,
          dimensions: row.dimensions,
          hasVariants: Boolean(row.has_variants),
          variants: variants,
          indicativePrice: row.indicative_price,
          minQuantity: row.min_quantity,
          availabilityLabel: row.availability_label,
          customisationInfo: row.customisation_info,
          status: row.status,
          isDemo: Boolean(row.is_demo),
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      })
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Admin products list failed: ${err.message}`, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const session = await requireAdmin(request, env);
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

    if (!sku || !name || !description) {
      return errorResponse('SKU, Name, and Description are required', 400);
    }

    const cleanSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    const prodId = 'prod-' + generateCryptoId(12);
    const nowIso = new Date().toISOString();

    // Check SKU or slug collisions
    const collision = await env.DB.prepare('SELECT id FROM products WHERE sku = ? OR slug = ?').bind(sku, cleanSlug).first();
    if (collision) {
      return errorResponse('Product with this SKU or slug already exists', 400);
    }

    await env.DB.prepare(`
      INSERT INTO products (
        id, sku, name, slug, description, category_id, images,
        material, dimensions, has_variants, variants_json, indicative_price,
        min_quantity, availability_label, customisation_info, status, is_demo,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      prodId,
      sku.trim().toUpperCase(),
      name.trim(),
      cleanSlug,
      description.trim(),
      categoryId || null,
      JSON.stringify(Array.isArray(images) ? images : []),
      material ? material.trim() : null,
      dimensions ? dimensions.trim() : null,
      hasVariants ? 1 : 0,
      JSON.stringify(Array.isArray(variants) ? variants : []),
      indicativePrice != null && indicativePrice !== '' ? parseFloat(indicativePrice) : null,
      parseInt(minQuantity, 10) || 1,
      availabilityLabel ? availabilityLabel.trim() : 'Available on Request',
      customisationInfo ? customisationInfo.trim() : null,
      ['draft', 'published', 'archived'].includes(status) ? status : 'draft',
      isDemo ? 1 : 0,
      nowIso,
      nowIso
    ).run();

    await logAudit(env, 'product', prodId, 'create_product', session.user.email, { sku, name, status });

    return jsonResponse({
      success: true,
      productId: prodId,
      message: 'Product created successfully'
    }, 201);
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Failed to create product: ${err.message}`, 500);
  }
}
