import { createRemoteJWKSet, jwtVerify } from 'jose';

let googleJWKS = null;
function getGoogleJWKS() {
  if (!googleJWKS) {
    googleJWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'), {
      cooldownDuration: 30000,
      cacheMaxAge: 3600000
    });
  }
  return googleJWKS;
}

export const CUSTOMER_COOKIE_NAME = 'swayari_customer_session';

export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}

export function errorResponse(message, status = 400, details = null) {
  return jsonResponse({
    success: false,
    error: message,
    details
  }, status);
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const items = cookieHeader.split(';');
  for (const item of items) {
    const parts = item.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      cookies[key] = decodeURIComponent(val);
    }
  }
  return cookies;
}

export function createCustomerSessionCookie(sessionId, isProduction = true) {
  const maxAge = 14 * 24 * 60 * 60; // 14 days
  const secureFlag = isProduction ? '; Secure' : '';
  // Host-only cookie: No Domain attribute
  return `${CUSTOMER_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureFlag}`;
}

export function clearCustomerSessionCookie(isProduction = true) {
  const secureFlag = isProduction ? '; Secure' : '';
  return `${CUSTOMER_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;
}

export function generateCryptoId(bytes = 32) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function generateOrderReference() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const randChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  const randValues = new Uint8Array(4);
  crypto.getRandomValues(randValues);
  for (let i = 0; i < 4; i++) {
    rand += randChars[randValues[i] % randChars.length];
  }
  return `SW-${yyyy}${mm}${dd}-${rand}`;
}

export async function verifyStorefrontGoogleToken(idToken, env) {
  if (!idToken) throw new Error('Missing Google ID token');
  const clientId = env.GOOGLE_STOREFRONT_CLIENT_ID || env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId.startsWith('YOUR_GOOGLE')) {
    throw new Error('Storefront Google Client ID is not configured on server');
  }

  const JWKS = getGoogleJWKS();
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId
  });

  if (!payload.email_verified) {
    throw new Error('Google account email is not verified');
  }

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture || null
  };
}

export async function getCustomerSession(request, env) {
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies[CUSTOMER_COOKIE_NAME];

  if (!sessionId) return null;

  const nowIso = new Date().toISOString();

  // Query D1 database for customer session with explicit scope and expiry check
  const sessionRow = await env.DB.prepare(`
    SELECT s.id as session_id, s.expires_at, s.scope, u.id as user_id, u.email, u.name, u.picture, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > ?
  `).bind(sessionId, nowIso).first();

  if (!sessionRow) {
    return null;
  }

  // Ensure session belongs to customer scope
  const scope = sessionRow.scope || 'customer';
  if (scope !== 'customer') {
    return null;
  }

  return {
    sessionId: sessionRow.session_id,
    user: {
      id: sessionRow.user_id,
      email: sessionRow.email,
      name: sessionRow.name,
      picture: sessionRow.picture,
      role: sessionRow.role
    }
  };
}

export async function requireCustomerAuth(request, env) {
  const session = await getCustomerSession(request, env);
  if (!session) {
    throw new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return session;
}

export async function logAudit(env, entityType, entityId, action, performedBy, details = null) {
  try {
    const id = 'aud-' + generateCryptoId(16);
    const nowIso = new Date().toISOString();
    const detailsJson = details ? JSON.stringify(details) : null;
    await env.DB.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, performed_by, details_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, entityType, entityId, action, performedBy, detailsJson, nowIso).run();
  } catch (err) {
    console.error('Audit log failure:', err.message);
  }
}
