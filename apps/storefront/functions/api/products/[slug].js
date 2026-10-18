import { jsonResponse, errorResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { params, env } = context;
  const slug = params.slug;

  if (!slug) {
    return errorResponse('Product slug is required', 400);
  }

  try {
    const row = await env.DB.prepare(`
      SELECT p.id, p.sku, p.name, p.slug, p.description, p.category_id,
             p.images, p.material, p.dimensions, p.has_variants, p.variants_json,
             p.indicative_price, p.min_quantity, p.availability_label,
             p.customisation_info, p.status, p.is_demo, p.created_at, p.updated_at,
             c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.status = 'published'
    `).bind(slug).first();

    if (!row) {
      return errorResponse('Product not found', 404);
    }

    const product = {
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
    };

    return jsonResponse({
      success: true,
      product
    });
  } catch (err) {
    return errorResponse(`Failed to fetch product details: ${err.message}`, 500);
  }
}
