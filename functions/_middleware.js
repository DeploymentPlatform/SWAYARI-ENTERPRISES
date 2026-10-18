export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // CSRF / Origin validation for state-changing requests
  const method = request.method.toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const origin = request.headers.get('Origin');
    if (origin) {
      const originUrl = new URL(origin);
      // Validate same origin or localhost during development
      const isAllowedOrigin = originUrl.host === url.host || 
        originUrl.hostname === 'localhost' || 
        originUrl.hostname === '127.0.0.1';
      
      if (!isAllowedOrigin) {
        return new Response(JSON.stringify({ success: false, error: 'Cross-origin mutation rejected' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }

  let response;
  try {
    response = await next();
  } catch (err) {
    if (err instanceof Response) {
      return err;
    }
    console.error('Unhandled Pages Function error:', err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'An internal server error occurred' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Clone headers to inject security standards
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'SAMEORIGIN');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CSP allowing Google Identity Services, Google Fonts, and same-origin assets
  newHeaders.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https://lh3.googleusercontent.com https://*.googleusercontent.com; " +
    "connect-src 'self' https://accounts.google.com/gsi/; " +
    "frame-src https://accounts.google.com/gsi/; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
