// Live sitemap: fixed pages, collection landing pages, gift-guide articles and every product for sale
// (with its photos for Google Images), built from D1 and src/content on request.
import { LANDINGS, PRICE_CAP, SITE_ORIGIN as origin } from '../src/content/seo.js';
import { BLOG_POSTS } from '../src/content/blog-posts.js';

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/shop', changefreq: 'daily', priority: '0.9' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
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

const day = value => (value ? `<lastmod>${escapeXml(String(value).slice(0, 10))}</lastmod>` : '');

const imageTag = (src, title) =>
  `<image:image><image:loc>${origin}${escapeXml(src)}</image:loc><image:title>${escapeXml(title)}</image:title></image:image>`;

export async function onRequestGet({ env }) {
  let products = [];
  let categories = [];
  try {
    const [p, c] = await Promise.all([
      env.DB.prepare(
        `SELECT slug, name, images, updated_at FROM products
         WHERE status = 'published' AND is_demo = 0 AND (indicative_price IS NULL OR indicative_price <= ?)
         ORDER BY updated_at DESC`
      )
        .bind(PRICE_CAP)
        .all(),
      env.DB.prepare('SELECT slug FROM categories WHERE is_active = 1 ORDER BY display_order').all()
    ]);
    products = p.results || [];
    categories = c.results || [];
  } catch {
    // Database unavailable: still serve the fixed pages and articles.
  }

  const productImages = p => {
    let list = [];
    try {
      list = JSON.parse(p.images || '[]');
    } catch {
      list = [];
    }
    return list
      .filter(src => typeof src === 'string' && src.startsWith('/'))
      .slice(0, 3)
      .map(src => imageTag(src, p.name))
      .join('');
  };

  const latestArticle = BLOG_POSTS.map(p => p.updated || p.date).sort().pop();
  const landing = (key, value) => `${origin}/shop?${key}=${escapeXml(encodeURIComponent(value))}`;
  const urls = [
    ...STATIC_PAGES.map(
      p =>
        `  <url><loc>${origin}${p.path}</loc>${p.path === '/blog' ? day(latestArticle) : ''}<changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
    ),
    ...categories.map(c => `  <url><loc>${landing('category', c.slug)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
    ...['occasion', 'budget', 'deity'].flatMap(key =>
      Object.keys(LANDINGS[key]).map(value => `  <url><loc>${landing(key, value)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`)
    ),
    ...BLOG_POSTS.map(
      post =>
        `  <url><loc>${origin}/blog/${escapeXml(post.slug)}</loc>${day(post.updated || post.date)}<changefreq>monthly</changefreq><priority>0.7</priority>${imageTag(post.image, post.title)}</url>`
    ),
    ...products.map(
      p =>
        `  <url><loc>${origin}/product/${escapeXml(encodeURIComponent(p.slug))}</loc>${day(p.updated_at)}<changefreq>weekly</changefreq><priority>0.7</priority>${productImages(p)}</url>`
    )
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
}
