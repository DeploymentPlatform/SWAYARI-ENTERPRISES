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

  // Origin check for state mutations to protect against CSRF
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('Origin');
    const host = request.headers.get('Host');
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host && !originUrl.host.includes('localhost') && !originUrl.host.includes('127.0.0.1')) {
          return new Response(JSON.stringify({ error: 'CSRF Forbidden: Origin mismatch' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid origin header' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
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
      "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://lh3.googleusercontent.com https://*.googleusercontent.com",
      "connect-src 'self' https://accounts.google.com",
      "frame-src https://accounts.google.com"
    ].join('; ')
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
