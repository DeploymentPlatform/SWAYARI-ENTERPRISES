import { jsonResponse, errorResponse, createCustomerSessionCookie, generateCryptoId } from '../../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  // STRICT BLOCK: Dev login must never run in production
  if (env.ENVIRONMENT === 'production') {
    return errorResponse('Development login bypass is disabled in production', 403);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const role = 'customer'; // Storefront dev-login only allows customer role
    const email = body.customEmail || 'customer.preview@example.com';
    const name = body.customName || 'Storefront Visitor';
    const userId = body.customId || 'dev-cust-' + email.replace(/[^a-zA-Z0-9]/g, '');

    const nowIso = new Date().toISOString();

    const existing = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
    if (!existing) {
      await env.DB.prepare(`
        INSERT INTO users (id, email, name, picture, role, created_at, updated_at)
        VALUES (?, ?, ?, null, ?, ?, ?)
      `).bind(userId, email, name, role, nowIso, nowIso).run();
    }

    const sessionId = generateCryptoId(32);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, scope, expires_at, created_at)
      VALUES (?, ?, 'customer', ?, ?)
    `).bind(sessionId, userId, expiresAt, nowIso).run();

    const isProduction = false;
    const cookie = createCustomerSessionCookie(sessionId, isProduction);

    return jsonResponse({
      success: true,
      user: {
        id: userId,
        email,
        name,
        role: 'customer'
      }
    }, 200, { 'Set-Cookie': cookie });
  } catch (err) {
    return errorResponse(`Dev login error: ${err.message}`, 500);
  }
}
