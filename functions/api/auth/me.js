import { getSession, jsonResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const session = await getSession(request, env);
    if (!session) {
      return jsonResponse({
        success: true,
        authenticated: false,
        user: null
      });
    }

    return jsonResponse({
      success: true,
      authenticated: true,
      user: session.user
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      authenticated: false,
      user: null,
      error: err.message
    }, 500);
  }
}
