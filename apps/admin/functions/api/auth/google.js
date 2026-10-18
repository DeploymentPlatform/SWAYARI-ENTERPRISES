import { jsonResponse, errorResponse, verifyAdminGoogleToken, createAdminSessionCookie, generateCryptoId, logAudit } from '../../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return errorResponse('Google ID token is required', 400);
    }

    const payload = await verifyAdminGoogleToken(idToken, env);
    const nowIso = new Date().toISOString();

    // Upsert admin user
    const existing = await env.DB.prepare('SELECT id, role FROM users WHERE id = ?').bind(payload.sub).first();
    const role = 'admin';

    if (!existing) {
      await env.DB.prepare(`
        INSERT INTO users (id, email, name, picture, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(payload.sub, payload.email, payload.name, payload.picture, role, nowIso, nowIso).run();
    } else {
      await env.DB.prepare(`
        UPDATE users SET email = ?, name = ?, picture = ?, role = 'admin', updated_at = ?
        WHERE id = ?
      `).bind(payload.email, payload.name, payload.picture, nowIso, payload.sub).run();
    }

    // Create session with explicit scope = 'admin'
    const sessionId = generateCryptoId(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, scope, expires_at, created_at)
      VALUES (?, ?, 'admin', ?, ?)
    `).bind(sessionId, payload.sub, expiresAt, nowIso).run();

    await logAudit(env, 'auth', payload.sub, 'admin_google_login', payload.email);

    const isProduction = env.ENVIRONMENT === 'production';
    const cookie = createAdminSessionCookie(sessionId, isProduction);

    return jsonResponse({
      success: true,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        role: 'admin'
      }
    }, 200, { 'Set-Cookie': cookie });
  } catch (err) {
    console.error('Admin Google Auth Error:', err.message);
    return errorResponse(`Admin authentication failed: ${err.message}`, 403);
  }
}
