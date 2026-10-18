import { jsonResponse, errorResponse, requireAdminAuth } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const ordersResult = await env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `).all();

    const ordersCount = {
      total: 0,
      new_request: 0,
      contacted: 0,
      quoted: 0,
      confirmed: 0,
      dispatched: 0,
      completed: 0,
      cancelled: 0
    };

    (ordersResult.results || []).forEach(r => {
      const cnt = Number(r.count || 0);
      ordersCount.total += cnt;
      if (ordersCount[r.status] !== undefined) {
        ordersCount[r.status] = cnt;
      }
    });

    const productsResult = await env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM products
      GROUP BY status
    `).all();

    const productsCount = {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0
    };

    (productsResult.results || []).forEach(r => {
      const cnt = Number(r.count || 0);
      productsCount.total += cnt;
      if (productsCount[r.status] !== undefined) {
        productsCount[r.status] = cnt;
      }
    });

    const revenueResult = await env.DB.prepare(`
      SELECT SUM(total_quoted_amount) as total_quoted
      FROM order_quotations
    `).first();

    const totalRevenueQuoted = revenueResult && revenueResult.total_quoted ? Number(revenueResult.total_quoted) : 0;

    return jsonResponse({
      success: true,
      stats: {
        orders: ordersCount,
        products: productsCount,
        totalRevenueQuoted
      }
    });
  } catch (err) {
    return errorResponse(`Failed to load admin stats: ${err.message}`, 500);
  }
}
