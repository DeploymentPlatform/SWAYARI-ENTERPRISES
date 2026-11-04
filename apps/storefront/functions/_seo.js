// Search-engine details for every page, written into the HTML before it leaves the server, so
// crawlers and link previews see each page's own title, description, canonical address and
// structured data without running the app. The rules live in src/content/seo.js, shared with the app.
import {
  PAGES,
  ALIASES,
  LANDINGS,
  PRICE_CAP,
  DEFAULT_IMAGE,
  SITE_ORIGIN,
  absolute,
  articleStructuredData,
  breadcrumbs,
  canonicalUrl,
  cleanPath,
  fullTitle,
  isPrivatePath,
  productStructuredData,
  shopLanding,
  summarise
} from '../src/content/seo.js';
import { BLOG_POSTS } from '../src/content/blog-posts.js';

const INDEX = 'index, follow, max-image-preview:large';
const NOINDEX = 'noindex, nofollow';

const formatRupees = n => `₹${Number(n).toLocaleString('en-IN')}`;

function page(url, meta, extra = {}) {
  return {
    status: 200,
    title: fullTitle(meta.title),
    description: meta.description,
    canonical: canonicalUrl(url.pathname, url.searchParams),
    robots: INDEX,
    image: DEFAULT_IMAGE,
    type: 'website',
    jsonLd: [],
    extraHead: [],
    isHome: false,
    ...extra
  };
}

const notFound = url => page(url, { title: 'Page not found', description: PAGES['/'].description }, { status: 404, robots: NOINDEX });

async function productPage(url, env, slug) {
  if (!env?.DB) return page(url, PAGES['/shop']);
  const row = await env.DB.prepare(
    `SELECT p.id, p.sku, p.name, p.slug, p.description, p.images, p.material, p.variants_json, p.indicative_price,
            p.bulk_tiers_json, p.status, p.is_demo, c.name AS category_name, c.slug AS category_slug, c.is_active AS category_active
     FROM products p LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.slug = ?`
  )
    .bind(slug)
    .first();
  const forSale = row && row.status === 'published' && !row.is_demo && (row.indicative_price == null || row.indicative_price <= PRICE_CAP);
  if (!forSale) {
    // A design that is no longer sold sends visitors (and old search results) to its collection.
    if (row) return { redirect: row.category_slug && row.category_active ? `/shop?category=${row.category_slug}` : '/shop' };
    return notFound(url);
  }
  const parse = (text, fallback) => {
    try {
      return JSON.parse(text || '') ?? fallback;
    } catch {
      return fallback;
    }
  };
  const product = {
    name: row.name,
    sku: row.sku,
    slug: row.slug,
    description: row.description,
    material: row.material,
    images: parse(row.images, []),
    variants: parse(row.variants_json, []),
    bulkTiers: parse(row.bulk_tiers_json, []),
    indicativePrice: row.indicative_price,
    categoryName: row.category_name,
    categorySlug: row.category_active ? row.category_slug : null
  };
  const title = `${product.name}${product.indicativePrice != null ? ` — ${formatRupees(product.indicativePrice)}` : ''}`;
  return page(
    url,
    { title, description: summarise(product.description, 155) },
    { image: product.images[0] || DEFAULT_IMAGE, type: 'product', jsonLd: productStructuredData(product) }
  );
}

async function shopPage(url, env) {
  const category = (url.searchParams.get('category') || '').trim().toLowerCase();
  if (category && !LANDINGS.category[category]) {
    // A collection added later in the admin portal is still a page; a retired or unknown one is not.
    const row = env?.DB ? await env.DB.prepare('SELECT name, is_active FROM categories WHERE slug = ?').bind(category).first() : null;
    if (!row || !row.is_active) return { redirect: '/shop' };
    return page(url, { title: row.name, description: PAGES['/shop'].description });
  }
  const landing = shopLanding(url.searchParams);
  const filtered = [...url.searchParams.keys()].some(k => (url.searchParams.get(k) || '').trim());
  if (landing) {
    return page(url, landing.meta, {
      jsonLd: [breadcrumbs([['Home', '/'], ['Shop', '/shop'], [landing.meta.title, landing.path]])]
    });
  }
  // Searches and combinations of filters are useful to visitors but are not pages of their own.
  return page(url, PAGES['/shop'], { robots: filtered ? 'noindex, follow' : INDEX });
}

function blogIndex(url) {
  return page(url, PAGES['/blog'], {
    image: BLOG_POSTS[0]?.image || DEFAULT_IMAGE,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${SITE_ORIGIN}/blog#blog`,
        name: 'SWAYARI Gift Guides',
        url: `${SITE_ORIGIN}/blog`,
        inLanguage: 'en-IN',
        blogPost: BLOG_POSTS.map(p => ({
          '@type': 'BlogPosting',
          headline: p.title,
          url: `${SITE_ORIGIN}/blog/${p.slug}`,
          datePublished: p.date,
          image: absolute(p.image)
        }))
      },
      breadcrumbs([['Home', '/'], ['Gift guides', '/blog']])
    ],
    extraHead: ['<link rel="alternate" type="application/rss+xml" title="SWAYARI Gift Guides" href="/blog/rss.xml" />']
  });
}

function blogPost(url, slug) {
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) return notFound(url);
  return page(
    url,
    { title: post.metaTitle || post.title, description: post.description },
    {
      image: post.image,
      type: 'article',
      jsonLd: articleStructuredData(post),
      extraHead: [
        `<meta property="article:published_time" content="${post.date}" />`,
        `<meta property="article:modified_time" content="${post.updated || post.date}" />`,
        '<link rel="alternate" type="application/rss+xml" title="SWAYARI Gift Guides" href="/blog/rss.xml" />'
      ]
    }
  );
}

/**
 * What to send for a page request: { redirect } for a permanent redirect, or the page's status and
 * search-engine details. Pure apart from the database read, so it can be tested on its own.
 */
export async function planSeo(url, env) {
  const path = cleanPath(url.pathname);
  if (path !== url.pathname) return { redirect: `${path}${url.search}` };
  if (ALIASES[path]) return { redirect: `${ALIASES[path]}${url.search}` };

  if (isPrivatePath(path)) return page(url, { title: 'Your account', description: PAGES['/'].description }, { robots: NOINDEX });
  if (path === '/') return page(url, PAGES['/'], { isHome: true });
  if (path === '/shop') return shopPage(url, env);
  if (path === '/blog') return blogIndex(url);
  if (path.startsWith('/blog/')) return blogPost(url, decodeURIComponent(path.slice('/blog/'.length)));
  if (path.startsWith('/product/')) return productPage(url, env, decodeURIComponent(path.slice('/product/'.length)));
  if (PAGES[path]) return page(url, PAGES[path]);
  return notFound(url);
}

const safeJson = data => JSON.stringify(data).replace(/</g, '\\u003c');

/** Rewrites the app's HTML shell with the page's own details (Cloudflare's streaming HTMLRewriter). */
export function applySeo(response, seo) {
  const extra = [...seo.jsonLd.map(d => `<script type="application/ld+json">${safeJson(d)}</script>`), ...seo.extraHead].join('');
  const setContent = value => ({ element: el => el.setAttribute('content', value) });
  return new HTMLRewriter()
    .on('title', { element: el => el.setInnerContent(seo.title) })
    .on('meta[name="description"]', setContent(seo.description))
    .on('meta[name="robots"]', setContent(seo.robots))
    .on('meta[property="og:title"]', setContent(seo.title))
    .on('meta[property="og:description"]', setContent(seo.description))
    .on('meta[property="og:url"]', setContent(seo.canonical))
    .on('meta[property="og:image"]', setContent(absolute(seo.image)))
    .on('meta[property="og:type"]', setContent(seo.type))
    .on('link[rel="canonical"]', { element: el => el.setAttribute('href', seo.canonical) })
    // The hero photos are only needed on the home page; elsewhere they would slow the page's own image.
    .on('link[data-hero-preload]', { element: el => (seo.isHome ? el.removeAttribute('data-hero-preload') : el.remove()) })
    .on('head', { element: el => extra && el.append(extra, { html: true }) })
    .transform(response);
}
