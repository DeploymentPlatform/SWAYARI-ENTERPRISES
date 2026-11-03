export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // STRICT PORTAL ISOLATION: Storefront must never serve or expose admin routes or APIs
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
    return new Response(JSON.stringify({ error: 'Not Found', status: 404 }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });
  }

  // CSRF: every state-changing request must come from this site's own origin.
  // Browsers always send Origin on POST/PUT/PATCH/DELETE, so a missing or foreign Origin is refused.
  // Local dev (Vite on :5173 proxying to :8788) is allowed only when ENVIRONMENT is 'development'.
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const allowedHosts = new Set([new URL(request.url).host]);
    if (env?.ENVIRONMENT === 'development') {
      for (const h of ['localhost:5173', '127.0.0.1:5173', 'localhost:5174', '127.0.0.1:5174', 'localhost:8788', '127.0.0.1:8788', 'localhost:8789', '127.0.0.1:8789']) allowedHosts.add(h);
    }
    let originHost = null;
    try {
      originHost = new URL(request.headers.get('Origin') || '').host;
    } catch {
      originHost = null;
    }
    if (!originHost || !allowedHosts.has(originHost)) {
      return new Response(JSON.stringify({ error: 'Request blocked: it did not come from this site.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }
  }

  const response = await next();

  // Security Headers
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy compatible with Google Identity Services & fonts
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com/gsi/style",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://lh3.googleusercontent.com https://*.googleusercontent.com",
      "connect-src 'self' https://accounts.google.com/gsi/",
      "frame-src https://accounts.google.com/gsi/",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ')
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
