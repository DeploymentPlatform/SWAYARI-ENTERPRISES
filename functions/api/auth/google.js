import {
  verifyGoogleIdToken,
  isAllowedAdminEmail,
  generateCryptoId,
  createSessionCookie,
  jsonResponse,
  errorResponse,
  logAudit
} from '../../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return errorResponse('Google credential token is required', 400);
    }

    // Verify token using RFC-compliant JWKS & Web Crypto
    const payload = await verifyGoogleIdToken(credential, env);
    const { sub, email, name, picture } = payload;
    const nowIso = new Date().toISOString();

    // Determine role via server-side allowlist
    const isAdmin = isAllowedAdminEmail(email, env);
    const assignedRole = isAdmin ? 'admin' : 'customer';

    // Check if user exists
    const existingUser = await env.DB.prepare(
      'SELECT id, email, name, picture, role FROM users WHERE id = ?'
    ).bind(sub).first();

    if (!existingUser) {
      await env.DB.prepare(`
        INSERT INTO users (id, email, name, picture, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(sub, email, name, picture, assignedRole, nowIso, nowIso).run();
    } else {
      // Preserve admin role or promote if added to allowlist
      const finalRole = isAdmin ? 'admin' : existingUser.role;
      await env.DB.prepare(`
        UPDATE users SET email = ?, name = ?, picture = ?, role = ?, updated_at = ?
        WHERE id = ?
      `).bind(email, name, picture, finalRole, nowIso, sub).run();
    }

    // Create secure application session
    const sessionId = generateCryptoId(32);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(sessionId, sub, expiresAt, nowIso).run();

    await logAudit(env, 'auth', sub, 'login_success', email, { role: assignedRole });

    const isProduction = env.ENVIRONMENT !== 'development';
    const cookie = createSessionCookie(sessionId, isProduction);

    return jsonResponse(
      {
        success: true,
        user: {
          id: sub,
          email: email,
          name: name,
          picture: picture,
          role: assignedRole
        }
      },
      200,
      { 'Set-Cookie': cookie }
    );
  } catch (err) {
    console.error('Google Sign-in verification error:', err.message);
    return errorResponse(`Sign-in verification failed: ${err.message}`, 401);
  }
}
