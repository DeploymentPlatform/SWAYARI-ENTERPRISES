import { jsonResponse } from '../../_utils.js';

// Public, non-secret sign-in configuration for the staff portal (admin OAuth client only).
export async function onRequestGet(context) {
  const { env } = context;
  return jsonResponse({
    success: true,
    googleClientId: env.GOOGLE_ADMIN_CLIENT_ID || env.GOOGLE_CLIENT_ID || null,
    devLoginAvailable: env.ENVIRONMENT === 'development'
  });
}
