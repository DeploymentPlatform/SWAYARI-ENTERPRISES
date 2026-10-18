import { jsonResponse, errorResponse, createAdminSessionCookie, generateCryptoId } from '../../_utils.js';

export async function onRequestPost(context) {
  const { env } = context;

  // STRICT BLOCK: Dev login must never run in production
  if (env.ENVIRONMENT === 'production') {
    return errorResponse('Development login bypass is disabled in production', 403);
  }

  try {
    const adminEmail = 'swayarienterprises@gmail.com';
    const adminName = 'SWAYARI Administrator';
    const userId = 'dev-admin-swayari-owner';
    const nowIso = new Date().toISOString();

    const existing = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
    if (!existing) {
      await env.DB.prepare(`
        INSERT INTO users (id, email, name, picture, role, created_at, updated_at)
        VALUES (?, ?, ?, null, 'admin', ?, ?)
      `).bind(userId, adminEmail, adminName, nowIso, nowIso).run();
    }

    const sessionId = generateCryptoId(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, scope, expires_at, created_at)
      VALUES (?, ?, 'admin', ?, ?)
    `).bind(sessionId, userId, expiresAt, nowIso).run();

    const isProduction = false;
    const cookie = createAdminSessionCookie(sessionId, isProduction);

    return jsonResponse({
      success: true,
      user: {
        id: userId,
        email: adminEmail,
        name: adminName,
        role: 'admin'
      }
    }, 200, { 'Set-Cookie': cookie });
  } catch (err) {
    return errorResponse(`Dev admin login error: ${err.message}`, 500);
  }
}
