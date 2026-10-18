import { jsonResponse, errorResponse, requireAdminAuth } from '../../../_utils.js';

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
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10) || 100));

  try {
    let query = `
      SELECT o.id, o.customer_id, o.customer_name, o.customer_email,
             o.customer_phone, o.delivery_city, o.delivery_state,
             o.status, o.initial_indicative_subtotal, o.created_at, o.updated_at,
             COUNT(i.id) as item_count,
             (SELECT snapshot_image_url FROM order_items fi WHERE fi.order_id = o.id LIMIT 1) as first_image
      FROM orders o
      LEFT JOIN order_items i ON o.id = i.order_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (search && search.trim().length > 0) {
      query += ' AND (o.id LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ? OR o.delivery_city LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT ${limit}`;

    const stmt = env.DB.prepare(query);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const { results } = await bound.all();

    const orders = (results || []).map(row => ({
      id: row.id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      deliveryCity: row.delivery_city,
      deliveryState: row.delivery_state,
      status: row.status,
      indicativeSubtotal: row.initial_indicative_subtotal,
      itemCount: Number(row.item_count || 0),
      firstImage: row.first_image || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return jsonResponse({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    return errorResponse(`Failed to load orders: ${err.message}`, 500);
  }
}
