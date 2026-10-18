export function parseCookies(cookieHeader: string | null | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
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

export function createSessionCookie(
  cookieName: string,
  sessionId: string,
  isProduction = true,
  maxAgeSeconds = 14 * 24 * 60 * 60
): string {
  const secureFlag = isProduction ? '; Secure' : '';
  // Host-only cookie: No Domain attribute specified ensures cookie is only sent to the exact origin host
  return `${cookieName}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureFlag}`;
}

export function clearSessionCookie(cookieName: string, isProduction = true): string {
  const secureFlag = isProduction ? '; Secure' : '';
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;
}
