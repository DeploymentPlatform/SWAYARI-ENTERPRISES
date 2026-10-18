import { jsonResponse, errorResponse, verifyStorefrontGoogleToken, createCustomerSessionCookie, generateCryptoId, logAudit } from '../../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return errorResponse('Google ID token is required', 400);
    }

    const payload = await verifyStorefrontGoogleToken(idToken, env);
    const nowIso = new Date().toISOString();

    // Upsert customer user
    const existing = await env.DB.prepare('SELECT id, role FROM users WHERE id = ?').bind(payload.sub).first();
    const role = 'customer'; // Storefront authentication always operates in customer role

    if (!existing) {
      await env.DB.prepare(`
        INSERT INTO users (id, email, name, picture, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(payload.sub, payload.email, payload.name, payload.picture, role, nowIso, nowIso).run();
    } else {
      await env.DB.prepare(`
        UPDATE users SET email = ?, name = ?, picture = ?, updated_at = ?
        WHERE id = ?
      `).bind(payload.email, payload.name, payload.picture, nowIso, payload.sub).run();
    }

    // Create session with explicit scope = 'customer'
    const sessionId = generateCryptoId(32);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, scope, expires_at, created_at)
      VALUES (?, ?, 'customer', ?, ?)
    `).bind(sessionId, payload.sub, expiresAt, nowIso).run();

    await logAudit(env, 'auth', payload.sub, 'customer_google_login', payload.email);

    const isProduction = env.ENVIRONMENT === 'production';
    const cookie = createCustomerSessionCookie(sessionId, isProduction);

    return jsonResponse({
      success: true,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        role: 'customer'
      }
    }, 200, { 'Set-Cookie': cookie });
  } catch (err) {
    console.error('Storefront Google Auth Error:', err.message);
    return errorResponse(`Authentication failed: ${err.message}`, 401);
  }
}
