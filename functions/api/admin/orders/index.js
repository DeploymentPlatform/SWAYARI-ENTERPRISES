import { requireAdmin, jsonResponse, errorResponse } from '../../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  try {
    await requireAdmin(request, env);

    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    let query = `
      SELECT 
        o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT COUNT(*) FROM order_internal_notes WHERE order_id = o.id) as note_count,
        (SELECT total_quoted_amount FROM order_quotations WHERE order_id = o.id ORDER BY revision_number DESC LIMIT 1) as latest_quote_total,
        (SELECT revision_number FROM order_quotations WHERE order_id = o.id ORDER BY revision_number DESC LIMIT 1) as latest_revision
      FROM orders o
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND o.status = ?`;
      params.push(status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (o.id LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ? OR o.delivery_city LIKE ?)`;
      params.push(term, term, term, term, term);
    }

    query += ` ORDER BY o.created_at DESC`;

    const { results } = await env.DB.prepare(query).bind(...params).all();

    // Also get quick stats
    const statsRow = await env.DB.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'new_request' THEN 1 END) as new_requests,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
        COUNT(CASE WHEN status = 'quoted' THEN 1 END) as quoted,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(*) as total_orders
      FROM orders
    `).first();

    return jsonResponse({
      success: true,
      stats: {
        newRequests: statsRow?.new_requests || 0,
        contacted: statsRow?.contacted || 0,
        quoted: statsRow?.quoted || 0,
        confirmed: statsRow?.confirmed || 0,
        totalOrders: statsRow?.total_orders || 0
      },
      count: results.length,
      orders: results
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Admin orders query failed: ${err.message}`, 500);
  }
}
