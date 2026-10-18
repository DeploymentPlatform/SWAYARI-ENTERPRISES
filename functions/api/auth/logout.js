import { parseCookies, clearSessionCookie, jsonResponse, logAudit } from '../../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const cookies = parseCookies(request.headers.get('Cookie'));
    const sessionId = cookies['swayari_session'];

    if (sessionId) {
      // Find session to log audit
      const sessionRow = await env.DB.prepare('SELECT user_id FROM sessions WHERE id = ?').bind(sessionId).first();
      if (sessionRow) {
        await logAudit(env, 'auth', sessionRow.user_id, 'logout', sessionRow.user_id);
      }
      // Invalidate session
      await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
    }

    const isProduction = env.ENVIRONMENT !== 'development';
    return jsonResponse(
      { success: true, message: 'Logged out successfully' },
      200,
      { 'Set-Cookie': clearSessionCookie(isProduction) }
    );
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
