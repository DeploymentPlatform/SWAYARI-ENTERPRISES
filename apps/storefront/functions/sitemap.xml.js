// Live sitemap: static pages, collection pages and every published, non-demo product (with its
// photos for Google Images), built from D1 on request.
const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/shop', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/ordering-policy', changefreq: 'yearly', priority: '0.4' },
  { path: '/shipping-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/refund-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' }
];

const escapeXml = value =>
  String(value).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

// Always list the public domain, even when the sitemap is fetched from the pages.dev copy.
const origin = 'https://swayari.com';

export async function onRequestGet({ env }) {
  let products = [];
  let categories = [];
  try {
    const [p, c] = await Promise.all([
      env.DB.prepare(
        `SELECT slug, name, images, updated_at FROM products
         WHERE status = 'published' AND is_demo = 0
         ORDER BY updated_at DESC`
      ).all(),
      env.DB.prepare('SELECT slug FROM categories WHERE is_active = 1 ORDER BY display_order').all()
    ]);
    products = p.results || [];
    categories = c.results || [];
  } catch {
    // Database unavailable: still serve the static pages.
  }

  const imageTags = (p) => {
    let list = [];
    try {
      list = JSON.parse(p.images || '[]');
    } catch {
      list = [];
    }
    return list
      .filter(src => typeof src === 'string' && src.startsWith('/'))
      .slice(0, 3)
      .map(src => `<image:image><image:loc>${origin}${escapeXml(src)}</image:loc><image:title>${escapeXml(p.name)}</image:title></image:image>`)
      .join('');
  };

  const urls = [
    ...STATIC_PAGES.map(p => `  <url><loc>${origin}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`),
    ...categories.map(c => `  <url><loc>${origin}/shop?category=${escapeXml(encodeURIComponent(c.slug))}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
    ...products.map(p => {
      const lastmod = p.updated_at ? `<lastmod>${escapeXml(String(p.updated_at).slice(0, 10))}</lastmod>` : '';
      return `  <url><loc>${origin}/product/${escapeXml(encodeURIComponent(p.slug))}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.7</priority>${imageTags(p)}</url>`;
    })
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
}
