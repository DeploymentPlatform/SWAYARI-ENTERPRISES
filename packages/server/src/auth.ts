import { createRemoteJWKSet, jwtVerify } from 'jose';
import { parseCookies } from './cookies.js';
import { User, SessionScope } from '@swayari/shared';

let googleJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;
function getGoogleJWKS() {
  if (!googleJWKS) {
    googleJWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'), {
      cooldownDuration: 30000,
      cacheMaxAge: 3600000
    });
  }
  return googleJWKS;
}

export function generateCryptoId(bytes = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function generateOrderReference(): string {
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

export function isAllowedAdminEmail(email: string | null | undefined, env: Record<string, any>): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (normalized === 'swayarienterprises@gmail.com') return true;
  if (env && env.ADMIN_EMAILS) {
    const list = String(env.ADMIN_EMAILS)
      .split(',')
      .map(e => e.trim().toLowerCase());
    return list.includes(normalized);
  }
  return false;
}

export async function verifyGoogleIdToken(idToken: string, expectedClientId: string) {
  if (!idToken) throw new Error('Missing Google ID token');
  if (!expectedClientId || expectedClientId.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
    throw new Error('Google Client ID is not configured on server');
  }

  const JWKS = getGoogleJWKS();
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: expectedClientId
  });

  if (!payload.email_verified) {
    throw new Error('Google account email is not verified');
  }

  return {
    sub: payload.sub as string,
    email: (payload.email as string).toLowerCase(),
    name: (payload.name as string) || (payload.email as string).split('@')[0],
    picture: (payload.picture as string) || null
  };
}

export async function getScopedSession(
  request: Request,
  env: Record<string, any>,
  cookieName: string,
  expectedScope: SessionScope
): Promise<{ sessionId: string; user: User } | null> {
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies[cookieName];

  if (!sessionId) return null;

  const nowIso = new Date().toISOString();

  // Query D1 database with explicit scope and expiry check
  // Uses fallback in case migration 0003 is executing
  const sessionRow: any = await env.DB.prepare(`
    SELECT s.id as session_id, s.expires_at, s.scope, u.id as user_id, u.email, u.name, u.picture, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > ?
  `).bind(sessionId, nowIso).first();

  if (!sessionRow) {
    return null;
  }

  // Enforce session scope
  const actualScope = sessionRow.scope || 'customer';
  if (actualScope !== expectedScope) {
    return null;
  }

  return {
    sessionId: sessionRow.session_id,
    user: {
      id: sessionRow.user_id,
      email: sessionRow.email,
      name: sessionRow.name,
      picture: sessionRow.picture,
      role: sessionRow.role as 'customer' | 'admin',
      createdAt: sessionRow.created_at || nowIso
    }
  };
}

export async function requireCustomerAuth(request: Request, env: Record<string, any>) {
  const session = await getScopedSession(request, env, 'swayari_customer_session', 'customer');
  if (!session) {
    throw new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return session;
}

export async function requireAdminAuth(request: Request, env: Record<string, any>) {
  const session = await getScopedSession(request, env, 'swayari_admin_session', 'admin');
  if (!session) {
    throw new Response(JSON.stringify({ success: false, error: 'Admin authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (session.user.role !== 'admin' || !isAllowedAdminEmail(session.user.email, env)) {
    throw new Response(JSON.stringify({ success: false, error: 'Forbidden: Admin access denied' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return session;
}
