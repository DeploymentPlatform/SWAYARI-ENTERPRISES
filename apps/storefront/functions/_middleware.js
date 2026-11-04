import { planSeo, applySeo } from './_seo.js';

const isPageRequest = (request, url) =>
  request.method === 'GET' && !url.pathname.startsWith('/api/') && !/\.[a-z0-9]{2,5}$/i.test(url.pathname);

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

  // Pages: work out the page's own title, canonical address and structured data (or a redirect).
  let seo = null;
  if (isPageRequest(request, url)) {
    try {
      seo = await planSeo(url, env);
    } catch (err) {
      console.error('SEO plan failed:', err);
      seo = null;
    }
    if (seo?.redirect) {
      return new Response(null, { status: 301, headers: { Location: new URL(seo.redirect, url.origin).toString(), 'Cache-Control': 'public, max-age=3600' } });
    }
  }

  // Each page gets its own HTML now, so never answer "not modified" from the shared app shell.
  let forwarded = request;
  if (seo) {
    const plain = new Headers(request.headers);
    plain.delete('If-None-Match');
    plain.delete('If-Modified-Since');
    forwarded = new Request(request, { headers: plain });
  }
  let response = await next(forwarded);
  let status = response.status;
  if (seo && typeof HTMLRewriter !== 'undefined' && (response.headers.get('Content-Type') || '').includes('text/html')) {
    response = applySeo(response, seo);
    status = seo.status;
  }

  // Security Headers
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (seo) {
    headers.delete('ETag');
    headers.delete('Last-Modified');
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  // Only swayari.com is indexed; the pages.dev copy stays out of search results.
  if (url.hostname.endsWith('.pages.dev')) headers.set('X-Robots-Tag', 'noindex, nofollow');

  // Content Security Policy compatible with Google Identity Services, fonts and Cloudflare Web Analytics
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://accounts.google.com https://apis.google.com https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com/gsi/style",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://lh3.googleusercontent.com https://*.googleusercontent.com",
      "connect-src 'self' https://accounts.google.com/gsi/ https://cloudflareinsights.com",
      "frame-src https://accounts.google.com/gsi/",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ')
  );

  return new Response(response.body, {
    status,
    statusText: status === response.status ? response.statusText : '',
    headers
  });
}
