import { jsonResponse, errorResponse, getSession } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const slug = params.slug;

  if (!slug) {
    return errorResponse('Product identifier is required', 400);
  }

  try {
    const session = await getSession(request, env);
    const isAdmin = session?.user?.role === 'admin';

    const row = await env.DB.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? OR p.id = ?
    `).bind(slug, slug).first();

    if (!row) {
      return errorResponse('Product not found', 404);
    }

    // Only admins can see draft/archived products
    if (row.status !== 'published' && !isAdmin) {
      return errorResponse('Product not found or not currently available', 404);
    }

    let images = [];
    let variants = [];
    try { images = JSON.parse(row.images || '[]'); } catch (_) {}
    try { variants = JSON.parse(row.variants_json || '[]'); } catch (_) {}

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
        categorySlug: row.category_slug,
        images: images,
        primaryImage: images[0] || '/assets/brand/swayari_brand_card.jpeg',
        material: row.material,
        dimensions: row.dimensions,
        hasVariants: Boolean(row.has_variants),
        variants: variants,
        indicativePrice: row.indicative_price, // null means Price on Request
        minQuantity: row.min_quantity || 1,
        availabilityLabel: row.availability_label || 'Available on Request',
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
