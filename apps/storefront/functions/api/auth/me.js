import { jsonResponse, getCustomerSession } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  const session = await getCustomerSession(request, env);
  if (!session) {
    return jsonResponse({
      authenticated: false,
      user: null
    });
  }

  return jsonResponse({
    authenticated: true,
    user: session.user
  });
}
