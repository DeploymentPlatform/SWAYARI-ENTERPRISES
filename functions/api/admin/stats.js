import { requireAdmin, jsonResponse, errorResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    await requireAdmin(request, env);

    const orderStats = await env.DB.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'new_request' THEN 1 END) as new_requests,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
        COUNT(CASE WHEN status = 'quoted' THEN 1 END) as quoted,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'dispatched' THEN 1 END) as dispatched,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(*) as total_orders
      FROM orders
    `).first();

    const productStats = await env.DB.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'published' AND is_demo = 0 THEN 1 END) as published_real,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_count,
        COUNT(CASE WHEN is_demo = 1 THEN 1 END) as demo_count,
        COUNT(*) as total_products
      FROM products
    `).first();

    return jsonResponse({
      success: true,
      stats: {
        orders: {
          newRequests: orderStats?.new_requests || 0,
          contacted: orderStats?.contacted || 0,
          quoted: orderStats?.quoted || 0,
          confirmed: orderStats?.confirmed || 0,
          dispatched: orderStats?.dispatched || 0,
          completed: orderStats?.completed || 0,
          cancelled: orderStats?.cancelled || 0,
          total: orderStats?.total_orders || 0
        },
        products: {
          publishedReal: productStats?.published_real || 0,
          draft: productStats?.draft_count || 0,
          archived: productStats?.archived_count || 0,
          demo: productStats?.demo_count || 0,
          total: productStats?.total_products || 0
        }
      }
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Failed to load admin stats: ${err.message}`, 500);
  }
}
