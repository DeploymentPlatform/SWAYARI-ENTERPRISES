import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronRight, Clock, Phone } from 'lucide-react';
import { BLOG_POSTS } from '../content/blog-posts.js';
import { BlogPost, formatPostDate, postImageFocus, relatedPosts, withSectionIds } from '../lib/blog';
import { Link, useRouter } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { useProducts } from '../lib/products';
import { EASE_LUXURY, Reveal, StaggerGroup, StaggerItem } from '../components/motion';
import { ProductCard } from '../components/ProductCard';
import { PostCard } from '../components/PostCard';
import { SectionHeading } from '../components/ui';
import { NotFoundPage } from './NotFoundPage';

const POSTS = BLOG_POSTS as unknown as BlogPost[];

const productSlug = (path: string) => decodeURIComponent(path.replace(/^\/product\//, '').split(/[?#]/)[0]);

/** Articles carry plain links; keep the visitor inside the app when they point at our own pages. */
function useInternalLinks() {
  const { navigate } = useRouter();
  return (event: React.MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');
    if (!anchor || !href || anchor.target === '_blank') return;
    if (href.startsWith('#')) {
      event.preventDefault();
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (!href.startsWith('/') || href.startsWith('//')) return;
    event.preventDefault();
    navigate(href);
  };
}

export const BlogPostPage: React.FC<{ slug: string }> = ({ slug }) => {
  const post = POSTS.find(p => p.slug === slug) || null;
  usePageMeta(post ? post.metaTitle || post.title : 'Page not found', post?.description, { image: post?.image, noindex: !post });
  const onArticleClick = useInternalLinks();
  const article = useMemo(() => (post ? withSectionIds(post.html) : null), [post]);
  const wanted = post?.products || [];
  const { products } = useProducts();
  const featured = useMemo(() => {
    if (!wanted.length) return [];
    const bySlug = new Map(products.map(p => [p.slug, p]));
    return wanted
      .map(productSlug)
      .map(s => bySlug.get(s))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .slice(0, 4);
  }, [products, wanted.join('|')]);

  if (!post || !article) return <NotFoundPage />;
  const related = relatedPosts(POSTS, post);
  const updated = post.updated && post.updated !== post.date ? post.updated : null;

  return (
    <article className="pb-6">
      {/* Title block */}
      <header className="relative overflow-hidden border-b border-stone-deep/70 bg-gradient-to-b from-gold-pale/40 via-ivory-light to-transparent">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="container-content relative grid gap-10 pb-12 pt-8 md:pb-16 md:pt-12 lg:grid-cols-12 lg:items-center lg:gap-14">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_LUXURY }}
          >
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-[0.75rem] uppercase tracking-[0.14em] text-ink-faint">
                <li>
                  <Link to="/" className="hover:text-burgundy">
                    Home
                  </Link>
                </li>
                <ChevronRight aria-hidden className="h-3 w-3" />
                <li>
                  <Link to="/blog" className="hover:text-burgundy">
                    Gift guides
                  </Link>
                </li>
                <ChevronRight aria-hidden className="h-3 w-3" />
                <li className="text-gold-dark">{post.category}</li>
              </ol>
            </nav>
            <h1 className="font-display text-[2.15rem] font-medium leading-[1.08] text-ink sm:text-[2.75rem] lg:text-[3.1rem]">{post.title}</h1>
            <p className="lede mt-5 max-w-xl">{post.excerpt}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem] text-ink-soft">
              <span className="inline-flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-burgundy font-display text-[0.95rem] text-ivory-light">S</span>
                SWAYARI gifting team
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-gold-dark" />
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gold-dark" /> {post.readMinutes} min read
              </span>
            </div>
          </motion.div>
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE_LUXURY, delay: 0.1 }}
          >
            <div className="relative">
              <div aria-hidden className="absolute -inset-2.5 rounded-[26px] border border-gold/30 sm:-inset-3.5" />
              <img
                src={post.image}
                alt={post.imageAlt}
                width={1200}
                height={900}
                fetchPriority="high"
                decoding="async"
                className={`relative aspect-[4/3] w-full rounded-card object-cover ${postImageFocus(post.image)} shadow-dialog`}
              />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Body */}
      <div className="container-content grid gap-12 py-12 md:py-16 lg:grid-cols-12 lg:gap-14">
        <aside className="lg:order-2 lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-28">
            {article.sections.length > 2 && (
              <details className="group rounded-card border border-stone-deep/80 bg-white/80 p-5 shadow-subtle lg:open:bg-white" open>
                <summary className="flex cursor-pointer list-none items-center justify-between text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-gold-dark">
                  In this guide
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <ol className="mt-4 space-y-2.5 border-l border-gold/30 pl-4 text-[0.9rem] leading-snug lg:max-h-[38vh] lg:overflow-y-auto lg:pr-2">
                  {article.sections.map(s => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        onClick={e => {
                          e.preventDefault();
                          document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="text-ink-soft transition-colors hover:text-burgundy"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}
            <div className="relative overflow-hidden rounded-card bg-burgundy-deep p-6 text-ivory-light shadow-card">
              <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
              <p className="relative text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold-light">Shop the collection</p>
              <p className="relative mt-3 font-display text-[1.45rem] leading-snug">Every design under ₹2,999. Return gifts from ₹39.</p>
              <p className="relative mt-3 text-[0.875rem] leading-relaxed text-ivory-light/85">
                Order from 1 piece, mix designs, and the bulk price applies across your whole cart.
              </p>
              <div className="relative mt-5 flex flex-col gap-2.5">
                <Link to="/shop" className="btn-gold btn-sm">
                  Shop all gifts
                </Link>
                <Link to="/contact" className="btn-ghost-light btn-sm">
                  <Phone className="h-3.5 w-3.5" /> Ask our team
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:order-1 lg:col-span-8">
          <div className="prose-swayari" onClick={onArticleClick} dangerouslySetInnerHTML={{ __html: article.html }} />

          {updated && (
            <p className="mt-10 text-[0.8125rem] text-ink-faint">
              Last updated <time dateTime={updated}>{formatPostDate(updated)}</time>
            </p>
          )}

          {post.faq && post.faq.length > 0 && (
            <section aria-labelledby="faq-title" className="mt-14">
              <p className="eyebrow mb-3">Questions we hear often</p>
              <h2 id="faq-title" className="font-display text-[1.9rem] leading-tight text-ink sm:text-[2.2rem]">
                Frequently asked <em className="italic text-burgundy">questions</em>
              </h2>
              <div className="mt-6 divide-y divide-stone-deep/80 rounded-card border border-stone-deep/80 bg-white/80">
                {post.faq.map((item, i) => (
                  <details key={i} className="group px-5 py-1 sm:px-6" open={i === 0}>
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 font-display text-[1.15rem] leading-snug text-ink transition-colors hover:text-burgundy">
                      {item.q}
                      <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold/50 text-gold-dark transition-transform duration-300 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="pb-5 text-[0.98rem] leading-relaxed text-ink-soft">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {featured.length > 0 && (
        <section aria-labelledby="guide-products-title" className="section border-t border-stone-deep/60 bg-white/60">
          <div className="container-content">
            <Reveal>
              <SectionHeading
                id="guide-products-title"
                eyebrow="From this guide"
                title={
                  <>
                    Gifts we <em>mentioned</em>
                  </>
                }
                action={
                  <Link to="/shop" className="text-link">
                    Shop all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="section">
          <div className="container-content">
            <Reveal>
              <SectionHeading
                id="related-title"
                eyebrow="Keep reading"
                title={
                  <>
                    More <em>gift guides</em>
                  </>
                }
                action={
                  <Link to="/blog" className="text-link">
                    All guides <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />
            </Reveal>
            <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(p => (
                <StaggerItem key={p.slug}>
                  <PostCard post={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}
    </article>
  );
};
