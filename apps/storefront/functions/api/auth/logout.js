import { jsonResponse, parseCookies, clearCustomerSessionCookie, CUSTOMER_COOKIE_NAME } from '../../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const cookieHeader = request.headers.get('Cookie');
    const cookies = parseCookies(cookieHeader);
    const sessionId = cookies[CUSTOMER_COOKIE_NAME];

    if (sessionId) {
      await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
    }

    const isProduction = env.ENVIRONMENT === 'production';
    const cookie = clearCustomerSessionCookie(isProduction);

    return jsonResponse({
      success: true,
      message: 'Logged out successfully'
    }, 200, { 'Set-Cookie': cookie });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
