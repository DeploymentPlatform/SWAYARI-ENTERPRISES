import { jsonResponse, errorResponse, createCustomerSessionCookie, generateCryptoId } from '../../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  // STRICT BLOCK: Dev login is deny-by-default. It only runs when the deployment explicitly
  // declares ENVIRONMENT=development (set by `npm run dev:*`), never when the variable is
  // missing, misspelled or set to production.
  if (env.ENVIRONMENT !== 'development') {
    return errorResponse('Development login bypass is disabled outside local development', 403);
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
