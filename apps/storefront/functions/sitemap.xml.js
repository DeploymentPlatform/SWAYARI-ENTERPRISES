// Live sitemap: static pages plus every published, non-demo product, built from D1 on request.
const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/shop', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/ordering-policy', changefreq: 'yearly', priority: '0.4' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' }
];

const escapeXml = value =>
  String(value).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

export async function onRequestGet({ request, env }) {
  const origin = new URL(request.url).origin;
  let products = [];
  try {
    const { results } = await env.DB.prepare(
      `SELECT slug, updated_at FROM products
       WHERE status = 'published' AND is_demo = 0 AND (indicative_price IS NULL OR indicative_price <= 999)
       ORDER BY updated_at DESC`
    ).all();
    products = results || [];
  } catch {
    // Database unavailable: still serve the static pages.
  }

  const urls = [
    ...STATIC_PAGES.map(p => `  <url><loc>${origin}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`),
    ...products.map(p => {
      const lastmod = p.updated_at ? `<lastmod>${escapeXml(String(p.updated_at).slice(0, 10))}</lastmod>` : '';
      return `  <url><loc>${origin}/product/${escapeXml(encodeURIComponent(p.slug))}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    })
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
}
