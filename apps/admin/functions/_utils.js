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

export const ADMIN_COOKIE_NAME = 'swayari_admin_session';

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

export function createAdminSessionCookie(sessionId, isProduction = true) {
  const maxAge = 7 * 24 * 60 * 60; // 7 days for staff sessions
  const secureFlag = isProduction ? '; Secure' : '';
  // Host-only cookie: No Domain attribute
  return `${ADMIN_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureFlag}`;
}

export function clearAdminSessionCookie(isProduction = true) {
  const secureFlag = isProduction ? '; Secure' : '';
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;
}

export function generateCryptoId(bytes = 32) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function isAllowedAdminEmail(email, env) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (normalized === 'swayarienterprises@gmail.com') return true;
  if (env && env.ADMIN_EMAILS) {
    const list = String(env.ADMIN_EMAILS).split(',').map(e => e.trim().toLowerCase());
    return list.includes(normalized);
  }
  return false;
}

export async function verifyAdminGoogleToken(idToken, env) {
  if (!idToken) throw new Error('Missing Google ID token');
  const clientId = env.GOOGLE_ADMIN_CLIENT_ID || env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId.startsWith('YOUR_GOOGLE')) {
    throw new Error('Admin Google Client ID is not configured on server');
  }

  const JWKS = getGoogleJWKS();
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId
  });

  if (!payload.email_verified) {
    throw new Error('Google account email is not verified');
  }

  const email = (payload.email || '').toLowerCase();
  if (!isAllowedAdminEmail(email, env)) {
    throw new Error(`Unauthorized: ${email} is not in the SWAYARI staff allowlist`);
  }

  return {
    sub: payload.sub,
    email,
    name: payload.name || email.split('@')[0],
    picture: payload.picture || null
  };
}

export async function getAdminSession(request, env) {
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies[ADMIN_COOKIE_NAME];

  if (!sessionId) return null;

  const nowIso = new Date().toISOString();

  // Query D1 database strictly for admin session
  const sessionRow = await env.DB.prepare(`
    SELECT s.id as session_id, s.expires_at, s.scope, u.id as user_id, u.email, u.name, u.picture, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > ?
  `).bind(sessionId, nowIso).first();

  if (!sessionRow) {
    return null;
  }

  // Ensure session has admin scope and user has admin role
  if (sessionRow.scope !== 'admin' || sessionRow.role !== 'admin' || !isAllowedAdminEmail(sessionRow.email, env)) {
    return null;
  }

  return {
    sessionId: sessionRow.session_id,
    user: {
      id: sessionRow.user_id,
      email: sessionRow.email,
      name: sessionRow.name,
      picture: sessionRow.picture,
      role: 'admin'
    }
  };
}

export async function requireAdminAuth(request, env) {
  const session = await getAdminSession(request, env);
  if (!session) {
    throw new Response(JSON.stringify({ success: false, error: 'Admin authentication required' }), {
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

export function validateFramePrice(val, fieldLabel = 'Price') {
  if (val === undefined || val === null || val === '') return { isValid: true, paise: null };
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) {
    return { isValid: false, error: `${fieldLabel} must be a positive finite amount` };
  }
  const paise = Math.round(num * 100);
  if (Math.abs(num * 100 - paise) > 0.0001) {
    return { isValid: false, error: `${fieldLabel} cannot have more than 2 decimal places` };
  }
  if (paise > 9900) {
    return { isValid: false, error: `${fieldLabel} (₹${num}) exceeds the maximum devotional frame limit of ₹99 (9,900 paise)` };
  }
  return { isValid: true, paise, amount: paise / 100 };
}

export function validateQuantity(val, fieldLabel = 'Quantity') {
  const num = Number(val);
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1) {
    return { isValid: false, error: `${fieldLabel} must be a positive whole integer (at least 1)` };
  }
  return { isValid: true, quantity: num };
}

export function validateNonNegativeAmount(val, fieldLabel = 'Amount') {
  if (val === undefined || val === null || val === '') return { isValid: true, amount: 0, paise: 0 };
  const num = Number(val);
  if (!Number.isFinite(num) || num < 0) {
    return { isValid: false, error: `${fieldLabel} must be a non-negative finite amount` };
  }
  const paise = Math.round(num * 100);
  if (Math.abs(num * 100 - paise) > 0.0001) {
    return { isValid: false, error: `${fieldLabel} cannot have more than 2 decimal places` };
  }
  return { isValid: true, amount: paise / 100, paise };
}
