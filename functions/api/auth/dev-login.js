import {
  generateCryptoId,
  createSessionCookie,
  jsonResponse,
  errorResponse,
  logAudit
} from '../../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  // STRICT SECURITY GUARD: Impossible to execute in production
  if (env.ENVIRONMENT !== 'development') {
    return errorResponse('Forbidden: Dev test endpoint is disabled in production', 403);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const role = body.role === 'admin' ? 'admin' : 'customer';

    const mockUser = role === 'admin' 
      ? {
          id: 'dev-google-sub-admin-swayari',
          email: 'swayarienterprises@gmail.com',
          name: 'SWAYARI Administrator (Dev Test)',
          picture: null,
          role: 'admin'
        }
      : {
          id: body.customId || 'dev-google-sub-customer-1',
          email: body.customEmail || 'customer.test@example.com',
          name: body.customName || 'Demo Customer',
          picture: null,
          role: 'customer'
        };

    const nowIso = new Date().toISOString();

    // Upsert user
    const existing = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(mockUser.id).first();
    if (!existing) {
      await env.DB.prepare(`
        INSERT INTO users (id, email, name, picture, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(mockUser.id, mockUser.email, mockUser.name, mockUser.picture, mockUser.role, nowIso, nowIso).run();
    } else {
      await env.DB.prepare(`
        UPDATE users SET email = ?, name = ?, role = ?, updated_at = ?
        WHERE id = ?
      `).bind(mockUser.email, mockUser.name, mockUser.role, nowIso, mockUser.id).run();
    }

    // Create session
    const sessionId = generateCryptoId(32);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(sessionId, mockUser.id, expiresAt, nowIso).run();

    await logAudit(env, 'auth', mockUser.id, 'dev_login', mockUser.email, { role: mockUser.role });

    const cookie = createSessionCookie(sessionId, false);
    return jsonResponse({
      success: true,
      devMode: true,
      user: mockUser
    }, 200, { 'Set-Cookie': cookie });
  } catch (err) {
    return errorResponse(`Dev login error: ${err.message}`, 500);
  }
}
