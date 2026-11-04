import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import { BLOG_POSTS } from '../content/blog-posts.js';
import { PAGES } from '../content/seo.js';
import { BlogPost, formatPostDate, postImageFocus } from '../lib/blog';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { EASE_LUXURY, Reveal, StaggerGroup, StaggerItem } from '../components/motion';
import { PostCard } from '../components/PostCard';

const POSTS = BLOG_POSTS as unknown as BlogPost[];

export const BlogIndexPage: React.FC = () => {
  usePageMeta(PAGES['/blog'].title, PAGES['/blog'].description, { image: POSTS[0]?.image });
  const categories = useMemo(() => Array.from(new Set(POSTS.map(p => p.category))), []);
  const [category, setCategory] = useState<string | null>(null);
  const [lead, ...rest] = POSTS;
  const list = category ? POSTS.filter(p => p.category === category) : rest;

  return (
    <div>
      <header className="relative overflow-hidden border-b border-stone-deep/70 bg-gradient-to-b from-gold-pale/40 via-ivory-light to-transparent">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-burgundy/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <motion.div
          className="container-content relative py-12 text-center md:py-20"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_LUXURY }}
        >
          <p className="eyebrow mb-4 justify-center">Gift guides</p>
          <h1 className="display-title mx-auto max-w-3xl">
            Thoughtful gifting for every <em>auspicious occasion</em>
          </h1>
          <div className="ornament mt-6" aria-hidden>
            <span className="block h-1.5 w-1.5 rotate-45 bg-gold" />
          </div>
          <p className="lede mx-auto mt-6 max-w-2xl">
            Practical ideas for wedding return gifts, gruhapravesam, vratams and festivals — what to give, how many to plan, and how to keep it
            within budget. Written by the team that packs every order.
          </p>
        </motion.div>
      </header>

      {lead && !category && (
        <section className="container-content pt-12 md:pt-16" aria-label="Latest guide">
          <Reveal>
            <Link
              to={`/blog/${lead.slug}`}
              className="group grid overflow-hidden rounded-[26px] border border-stone-deep/80 bg-white/90 shadow-card transition-all duration-500 ease-luxury hover:border-gold/50 hover:shadow-[0_30px_60px_-34px_rgba(46,12,20,0.5)] md:grid-cols-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone md:aspect-auto md:min-h-[420px]">
                <img
                  src={lead.image}
                  alt={lead.imageAlt}
                  fetchPriority="high"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover ${postImageFocus(lead.image)} transition-transform duration-700 ease-luxury group-hover:scale-[1.04]`}
                />
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                <p className="badge-gold self-start">Latest · {lead.category}</p>
                <h2 className="mt-5 font-display text-[1.9rem] font-medium leading-[1.1] text-ink transition-colors group-hover:text-burgundy sm:text-[2.4rem]">
                  {lead.title}
                </h2>
                <p className="lede mt-4">{lead.excerpt}</p>
                <p className="mt-6 text-[0.75rem] uppercase tracking-[0.14em] text-ink-faint">
                  {formatPostDate(lead.date)} · {lead.readMinutes} min read
                </p>
                <span className="text-link mt-6">
                  Read the guide <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      <section className="container-content section pt-10 md:pt-14" aria-labelledby="all-guides-title">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="all-guides-title" className="font-display text-[1.75rem] text-ink sm:text-[2.1rem]">
            {category || 'All guides'}
          </h2>
          {categories.length > 1 && (
            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter guides by topic">
              <button type="button" className={`chip ${category === null ? 'chip-active' : ''}`} aria-pressed={category === null} onClick={() => setCategory(null)}>
                All
              </button>
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${category === c ? 'chip-active' : ''}`}
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        <StaggerGroup key={category || 'all'} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <StaggerItem key={p.slug}>
              <PostCard post={p} priority={i < 2} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="container-content pb-20" aria-labelledby="blog-cta-title">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-gold/30 bg-gradient-to-br from-gold-pale via-ivory-light to-white px-6 py-12 text-center shadow-card sm:px-12 sm:py-14">
            <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <h2 id="blog-cta-title" className="display-title">
                Ready to choose your <em>gifts?</em>
              </h2>
              <p className="lede mx-auto mt-5 max-w-xl">
                Browse every design under ₹2,999, add any mix to your cart, and send it as a request. We confirm stock, final price and delivery
                with you personally.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/shop" className="btn-primary">
                  Shop the collection
                </Link>
                <Link to="/contact" className="btn-secondary">
                  <Phone className="h-4 w-4" /> Talk to our team
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
