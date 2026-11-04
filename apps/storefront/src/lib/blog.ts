// Gift-guide articles: the shape of each post in content/blog-posts.js and small helpers shared by
// the blog pages and the home page. The articles themselves load in their own chunk.

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle?: string;
  description: string;
  excerpt: string;
  date: string;
  updated?: string;
  readMinutes: number;
  category: string;
  keywords?: string[];
  image: string;
  imageAlt: string;
  html: string;
  faq?: BlogFaq[];
  products?: string[];
}

export const loadBlogPosts = () =>
  import('../content/blog-posts.js').then(m => m.BLOG_POSTS as unknown as BlogPost[]);

const DATE_FORMAT = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

export function formatPostDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00+05:30`);
  return Number.isNaN(date.getTime()) ? value : DATE_FORMAT.format(date);
}

const slugify = (text: string) =>
  text
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** Gives every section heading an id for the "In this guide" list, and returns that list. */
export function withSectionIds(html: string) {
  const sections: { id: string; title: string }[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (_match, attrs: string, inner: string) => {
    const existing = attrs.match(/\bid="([^"]+)"/)?.[1];
    let id = existing || slugify(inner) || `section-${sections.length + 1}`;
    while (!existing && used.has(id)) id = `${id}-${sections.length + 1}`;
    used.add(id);
    sections.push({ id, title: inner.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim() });
    return existing ? `<h2${attrs}>${inner}</h2>` : `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  // Wide tables scroll sideways on phones instead of squeezing the page.
  const wrapped = out.replace(/<table\b/g, '<div class="table-scroll"><table').replace(/<\/table>/g, '</table></div>');
  return { html: wrapped, sections };
}

/** Posts that share a category come first, then the newest of the rest. */
export function relatedPosts(posts: BlogPost[], current: BlogPost, count = 3) {
  const others = posts.filter(p => p.slug !== current.slug);
  const same = others.filter(p => p.category === current.category);
  const rest = others.filter(p => p.category !== current.category);
  return [...same, ...rest].slice(0, count);
}

/** Card-size sources for a post's picture: product photos have 480px thumbnails, others are used as they are. */
export function postCardImage(src: string) {
  const match = src.match(/^\/assets\/products\/([^/]+)\.(webp|jpe?g|png)$/i);
  if (!match) return { src };
  return { src, srcSet: `/assets/products/thumbs/${match[1]}.webp 480w, ${src} 1024w` };
}

/** Banner photos keep their subject on the right (the left is left plain for headline text). */
export const postImageFocus = (src: string) => (/\/editorial\/hero-[^/]*-desktop\./.test(src) ? 'object-[78%_50%]' : 'object-center');
