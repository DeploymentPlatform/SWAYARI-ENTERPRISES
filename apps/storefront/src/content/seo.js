// Page titles, descriptions and canonical URLs for every public page, shared by the app (lib/meta.ts)
// and by the server (functions/_middleware.js), which writes them into the HTML before it is sent,
// so search engines and link previews see the right page details without running the app.
// Plain JavaScript so a Cloudflare Pages Function can import it too.

export const SITE_ORIGIN = 'https://swayari.com';
export const SITE_NAME = 'SWAYARI';
export const PRICE_CAP = 2999;
export const DEFAULT_IMAGE = '/assets/editorial/og-swayari.jpg';

/** Adds the brand to a page title, unless the title already starts with it. */
export const fullTitle = title => (!title ? HOME.title : title.startsWith(SITE_NAME) ? title : `${title} | ${SITE_NAME}`);

const HOME = {
  title: 'SWAYARI — Devotional Return Gifts & God Frames Under ₹2,999',
  description:
    'Silver foil god frames, Telugu stotram frames, god stands and stotram cards, all under ₹2,999. Return gifts from ₹39 — order from 1 piece, bulk prices as you add more.'
};

/** Fixed pages. The app's own pages pass the same title and description to usePageMeta. */
export const PAGES = {
  '/': HOME,
  '/shop': {
    title: 'Shop Devotional Gifts Under ₹2,999',
    description:
      'Silver foil god frames, stotram frames, god stands and stotram cards, all under ₹2,999, with return gifts from ₹39. Order from 1 piece and mix designs to unlock bulk prices. Delivery extra.'
  },
  '/blog': {
    title: 'Gift Guides — Return Gift Ideas, Vratams & Festivals',
    description:
      'Return gift ideas under ₹299 for weddings, gruhapravesam and Varalakshmi Vratham, how bulk pricing works, and how to choose and care for silver foil gifts.'
  },
  '/about': {
    title: 'Our Story',
    description:
      'SWAYARI brings you devotional gifting under ₹2,999 — silver foil god frames, stotram frames and return gifts from ₹39 — with personal help for every order.'
  },
  '/contact': {
    title: 'Contact',
    description: 'Contact SWAYARI about a design, a bulk return-gift order, a special quote or an existing request.'
  },
  '/ordering-policy': {
    title: 'How ordering works',
    description:
      'How to order from SWAYARI: add to cart, send a request, we confirm by call or WhatsApp, then share payment details. Slab pricing explained; delivery extra.'
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description:
      'How SWAYARI ENTERPRISES collects, uses and protects your personal data — Google Sign-In, order requests, cookies, your rights and how to contact us.'
  },
  '/terms': {
    title: 'Terms & Conditions',
    description:
      'Terms & Conditions for SWAYARI — Décor & Gifting by SWAYARI ENTERPRISES: order requests, slab pricing, payment, delivery, returns and grievance redressal.'
  },
  '/shipping-policy': {
    title: 'Shipping & Delivery',
    description:
      'SWAYARI delivers across India by courier. Ready stock dispatched in 2–4 working days; delivery charged at actual cost and confirmed before dispatch.'
  },
  '/refund-policy': {
    title: 'Cancellation, Returns & Refunds',
    description:
      'SWAYARI cancellation, returns and refund policy: free cancellation before dispatch, 48-hour damage reporting with unboxing video, refunds in 7–10 working days.'
  }
};

/** Old or alternative addresses, sent permanently to the main page. */
export const ALIASES = {
  '/privacy': '/privacy-policy',
  '/terms-and-conditions': '/terms',
  '/delivery-policy': '/shipping-policy',
  '/cancellation-policy': '/refund-policy',
  '/returns': '/refund-policy',
  '/gift-guides': '/blog',
  '/journal': '/blog'
};

/** Personal or transactional pages: shown to visitors, kept out of search results. */
export const PRIVATE_PATHS = ['/cart', '/checkout', '/account', '/account/orders', '/orders', '/dev-login', '/search'];
export const PRIVATE_PREFIXES = ['/order-confirmation/'];

/**
 * Shop pages with exactly one of these filters are landing pages of their own (indexed, with their own
 * title); any other combination of filters points search engines back to the plain shop page.
 */
export const LANDINGS = {
  category: {
    'god-frames': {
      title: 'Silver Foil God Frames — Balaji, Lakshmi, Ganesh & More',
      description:
        'Silver foil and colour god frames from ₹329: Balaji, Lakshmi, Ganesh, Sai Baba, Hanuman and more, in carved frames up to 14×17 in. Bulk prices from ₹249.'
    },
    'stotram-frames': {
      title: 'Telugu Stotram Frames & Desk Flip Frames',
      description:
        'Lalitha Sahasranamam, Vishnu Sahasranamam, Hanuman Chalisa and more in silver foil desk flip frames and gold border frames, from ₹499. Bulk prices from ₹359.'
    },
    'god-stands': {
      title: 'Silver Foil God Stands — Return Gifts from ₹49',
      description:
        'Colour silver foil god images in clear acrylic stands, in three sizes from ₹89. Mix designs for bulk prices from ₹49 — wedding and housewarming return gifts.'
    },
    'stotram-cards': {
      title: 'Silver Foil Stotram Cards — Return Gifts from ₹39',
      description:
        '18 Telugu stotram cards in silver foil with red gift covers: Lalitha Harathi, Kanakadhara, Lingashtakam and more. ₹99 each, down to ₹39 for 100+.'
    }
  },
  occasion: {
    'wedding-return-gifts': {
      title: 'Wedding Return Gifts — Devotional Gifts from ₹39',
      description:
        'Devotional wedding return gifts guests keep: silver foil stotram cards from ₹39 and god stands from ₹49 in bulk, plus gift-boxed god frames. Order from 1 piece.'
    },
    'griha-pravesh': {
      title: 'Gruhapravesam (Housewarming) Return Gifts',
      description:
        'Housewarming return gifts and gifts for a new home: Balaji, Lakshmi and Ganesh god stands, god frames and stotram cards, from ₹39 in bulk. Delivery across India.'
    },
    'festivals-vratams': {
      title: 'Varalakshmi Vratham & Festival Return Gifts',
      description:
        'Thamboolam and festival return gifts for Varalakshmi Vratham, Vinayaka Chavithi, Navratri and Diwali: stotram cards, god stands and frames from ₹39.'
    },
    'pooja-room': {
      title: 'Pooja Room God Frames & Stotram Frames',
      description:
        'Silver foil god frames up to 14×17 in and Telugu stotram frames for the pooja room, all under ₹2,999. Order from 1 piece; delivery at actual cost.'
    },
    'corporate-gifting': {
      title: 'Corporate Diwali & Festive Gifts Under ₹2,999',
      description:
        'Devotional corporate gifts for clients and teams: god stands, colour god frames in gift boxes and stotram frames, with bulk prices as you add more.'
    }
  },
  budget: {
    'under-299': {
      title: 'Return Gifts Under ₹299 — Stotram Cards & God Stands',
      description:
        'Devotional return gifts under ₹299: silver foil stotram cards (₹99, down to ₹39) and god stands (₹89, down to ₹49). Mix designs to unlock bulk prices.'
    },
    '300-999': {
      title: 'Devotional Gifts ₹300 – ₹999',
      description:
        'Colour god frames in gift boxes, Telugu stotram flip frames and 8×10 silver foil god frames between ₹300 and ₹999, for close family and housewarmings.'
    },
    '1000-2999': {
      title: 'Grand God Frames ₹1,000 – ₹2,999',
      description:
        'Grand 14×17 in silver foil god frames with lamps and ornaments for the pooja room, between ₹1,000 and ₹2,999. Order from 1 piece; delivery extra.'
    },
    'under-2999': {
      title: 'Devotional Gifts Under ₹2,999',
      description:
        'Every SWAYARI design is under ₹2,999: silver foil god frames, stotram frames, god stands and stotram cards, with return gifts from ₹39.'
    }
  },
  deity: Object.fromEntries(
    [
      ['balaji', 'Balaji (Venkateswara)'],
      ['lakshmi', 'Lakshmi'],
      ['ganesh', 'Ganesh'],
      ['devi', 'Devi'],
      ['krishna', 'Krishna'],
      ['shiva', 'Shiva'],
      ['hanuman', 'Hanuman'],
      ['sai', 'Sai Baba'],
      ['rama', 'Sri Rama'],
      ['vishnu', 'Vishnu']
    ].map(([id, name]) => [
      id,
      {
        title: `${name} God Frames, Stands & Stotram Gifts`,
        description: `Silver foil ${name} god frames, god stands and stotram gifts under ₹2,999 for the pooja room, housewarmings and return gifts. Order from 1 piece.`
      }
    ])
  )
};

const LANDING_KEYS = Object.keys(LANDINGS);
const OTHER_FILTERS = ['search', 'q', 'bulk'];

/** The one landing filter on a shop URL, if the URL is a landing page; otherwise null. */
export function shopLanding(searchParams) {
  const present = LANDING_KEYS.filter(k => (searchParams.get(k) || '').trim());
  if (present.length !== 1 || OTHER_FILTERS.some(k => (searchParams.get(k) || '').trim())) return null;
  const key = present[0];
  const value = searchParams.get(key).trim().toLowerCase();
  const meta = LANDINGS[key][value];
  return meta ? { key, value, meta, path: `/shop?${key}=${encodeURIComponent(value)}` } : null;
}

/** Path without a trailing slash ("/" stays "/"). */
export const cleanPath = pathname => pathname.replace(/\/+$/, '') || '/';

/** Canonical address of a page on the public domain (filters other than one landing filter are dropped). */
export function canonicalUrl(pathname, searchParams) {
  const path = ALIASES[cleanPath(pathname)] || cleanPath(pathname);
  if (path === '/shop') {
    const landing = shopLanding(searchParams);
    return `${SITE_ORIGIN}${landing ? landing.path : '/shop'}`;
  }
  return `${SITE_ORIGIN}${path}`;
}

export const isPrivatePath = pathname => {
  const path = cleanPath(pathname);
  return PRIVATE_PATHS.includes(path) || PRIVATE_PREFIXES.some(p => path.startsWith(p));
};

/** A trimmed description that ends at a word, for meta tags. */
export function summarise(text, max = 158) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 80)).replace(/[,;:\s—–-]+$/, '')}…`;
}

export const absolute = src => (/^https?:\/\//.test(src) ? src : `${SITE_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`);

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE_ORIGIN}/#organization`,
  name: 'SWAYARI Enterprises',
  alternateName: 'SWAYARI — Décor & Gifting',
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/assets/brand/swayari-logo-card.jpg`,
  email: 'swayarienterprises@gmail.com',
  areaServed: 'IN'
};

export function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) }))
  };
}

/** Structured data for a blog article (BlogPosting, breadcrumbs and its questions). */
export function articleStructuredData(post) {
  const url = `${SITE_ORIGIN}/blog/${post.slug}`;
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      mainEntityOfPage: url,
      headline: post.title,
      description: post.description,
      image: [absolute(post.image)],
      datePublished: post.date,
      dateModified: post.updated || post.date,
      inLanguage: 'en-IN',
      keywords: (post.keywords || []).join(', '),
      articleSection: post.category,
      author: { '@type': 'Organization', name: 'SWAYARI', url: `${SITE_ORIGIN}/about` },
      publisher: ORGANIZATION
    },
    breadcrumbs([
      ['Home', '/'],
      ['Gift guides', '/blog'],
      [post.title, `/blog/${post.slug}`]
    ])
  ];
  if (post.faq && post.faq.length) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    });
  }
  return data;
}

/** Structured data for a product page: the product with every size and slab, and its breadcrumbs. */
export function productStructuredData(p) {
  const url = `${SITE_ORIGIN}/product/${p.slug}`;
  const prices = [];
  const sizes = Array.isArray(p.variants) ? p.variants.filter(v => v && (v.indicativePrice == null || v.indicativePrice <= PRICE_CAP)) : [];
  if (p.indicativePrice != null) prices.push(p.indicativePrice);
  for (const t of p.bulkTiers || []) if (t && t.unit_price) prices.push(Number(t.unit_price));
  for (const v of sizes) {
    if (v.indicativePrice != null) prices.push(Number(v.indicativePrice));
    for (const t of v.tiers || []) if (t && t.unit_price) prices.push(Number(t.unit_price));
  }
  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: p.name,
    sku: p.sku,
    description: p.description,
    image: (p.images || []).map(absolute),
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(p.categoryName ? { category: p.categoryName } : {}),
    ...(p.material ? { material: p.material } : {})
  };
  if (prices.length) {
    product.offers = {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: Math.max(1, sizes.length),
      availability: 'https://schema.org/InStock',
      url,
      seller: { '@id': ORGANIZATION['@id'] }
    };
  }
  return [
    product,
    breadcrumbs([
      ['Home', '/'],
      ...(p.categorySlug ? [[p.categoryName || 'Shop', `/shop?category=${p.categorySlug}`]] : [['Shop', '/shop']]),
      [p.name, `/product/${p.slug}`]
    ])
  ];
}
