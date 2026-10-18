import { jsonResponse } from '../../_utils.js';

// Public, non-secret sign-in configuration for the customer storefront.
// The OAuth client ID is not a secret; exposing it lets the browser initialise Google
// Identity Services with the storefront's own client (separate from the admin portal's).
export async function onRequestGet(context) {
  const { env } = context;
  return jsonResponse({
    success: true,
    googleClientId: env.GOOGLE_STOREFRONT_CLIENT_ID || env.GOOGLE_CLIENT_ID || null,
    devLoginAvailable: env.ENVIRONMENT === 'development'
  });
}
