import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Phone, Sparkles, Flower2, PackageCheck, HandHeart } from 'lucide-react';
import { Hero } from '../components/Hero';
import { InfoStrip } from '../components/InfoStrip';
import { BulkReturnGiftsSection } from '../components/BulkReturnGiftsSection';
import { CategoryShortcuts } from '../components/CategoryShortcuts';
import { ShopByOccasion } from '../components/ShopByOccasion';
import { ShopByBudget } from '../components/ShopByBudget';
import { productPricing } from '../components/Price';
import { OrderProcessExplanation } from '../components/OrderProcessExplanation';
import { ProductCard } from '../components/ProductCard';
import { SectionHeading } from '../components/ui';
import { Reveal, StaggerGroup, StaggerItem } from '../components/motion';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { PAGES } from '../content/seo.js';
import { useProducts } from '../lib/products';
import { Product, BRAND_TAGLINES, DEITIES, GIFTING_PRICE_CAP } from '@swayari/shared';
import { productCardImage, uniqueProductImages } from '../lib/media';
import { BlogPost, loadBlogPosts } from '../lib/blog';
import { PostCard } from '../components/PostCard';

// Featured cards wrap in a centred row, so an odd last row sits in the middle instead of leaving a gap.
const FEATURED_CELL = 'w-[calc(50%-0.4375rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]';

const SkeletonCard: React.FC = () => (
  <div className="overflow-hidden rounded-card border border-stone-deep/70 bg-white">
    <div className="skeleton aspect-[4/5] rounded-none sm:aspect-square" />
    <div className="space-y-2.5 p-4">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-5 w-4/5" />
      <div className="skeleton h-4 w-1/4" />
      <div className="skeleton mt-3 h-10 w-full rounded-full" />
    </div>
  </div>
);

// Featured picks: two designs from each gift collection, in catalogue order.
const FEATURED_FROM = ['god-frames', 'stotram-frames', 'god-stands', 'stotram-cards'];

const ProductRow: React.FC<{ products: Product[]; loading: boolean; count?: number }> = ({ products, loading, count = 8 }) => (
  <StaggerGroup className="mt-10 flex flex-wrap justify-center gap-3.5 sm:gap-6">
    {loading
      ? Array.from({ length: Math.min(count, 4) }).map((_, i) => (
          <StaggerItem key={i} className={FEATURED_CELL}>
            <SkeletonCard />
          </StaggerItem>
        ))
      : products.slice(0, count).map((prod, idx) => (
          <StaggerItem key={prod.id} className={FEATURED_CELL}>
            <ProductCard product={prod} priority={idx < 2} />
          </StaggerItem>
        ))}
  </StaggerGroup>
);

/** The three newest gift-guide articles; the articles load in their own chunk after the page. */
const GiftGuides: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => {
    let cancelled = false;
    loadBlogPosts()
      .then(list => !cancelled && setPosts(list.slice(0, 3)))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  if (!posts.length) return null;
  return (
    <section aria-labelledby="guides-title" className="section">
      <div className="container-content">
        <Reveal>
          <SectionHeading
            id="guides-title"
            eyebrow="Gift guides"
            title={
              <>
                Ideas for every <em>celebration</em>
              </>
            }
            intro="What to give at weddings, gruhapravesam and vratams — with honest tips on quantities and budgets."
            action={
              <Link to="/blog" className="text-link">
                All gift guides <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
        </Reveal>
        <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <StaggerItem key={post.slug}>
              <PostCard post={post} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
};

export const HomePage: React.FC = () => {
  usePageMeta(PAGES['/'].title, PAGES['/'].description);

  const { products, status } = useProducts();
  const loading = status === 'loading';
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('swayari_recently_viewed');
      if (stored && products.length > 0) {
        const ids: string[] = JSON.parse(stored);
        const matches = ids
          .map(id => products.find(p => p.id === id))
          .filter((p): p is Product => Boolean(p))
          .slice(0, 4);
        setRecentlyViewed(matches);
      }
    } catch {
      // Ignore local storage parse error
    }
  }, [products]);

  const featured = useMemo(
    () => FEATURED_FROM.flatMap(slug => products.filter(p => p.categorySlug === slug).slice(0, 2)),
    [products]
  );
  // Return gifts: everything whose bulk price drops to ₹99 or less
  const returnGifts = useMemo(
    () => products.filter(p => (productPricing(p).best ?? Infinity) <= 99).sort((a, b) => (productPricing(a).best ?? 0) - (productPricing(b).best ?? 0)),
    [products]
  );
  // The grandest pieces on the store: 14×17 god frames, then the frames with diyas.
  const grandFrames = useMemo(() => ['12', '09'].flatMap(g => products.filter(p => p.priceGroup === g)), [products]);
  const giftable = useMemo(() => products.filter(p => p.indicativePrice !== null && p.indicativePrice <= GIFTING_PRICE_CAP), [products]);

  // One tile per god, using a god frame photo where there is one.
  const deityTiles = useMemo(
    () =>
      DEITIES.filter(d => !['all', 'multi', 'interfaith'].includes(d.id))
        .map(d => {
          const matches = products.filter(p => (p.deity || '').toLowerCase().includes(d.id));
          const pick = matches.find(p => p.categorySlug === 'god-frames') || matches[0];
          return pick
            ? { key: d.id, label: d.name, href: `/shop?deity=${d.id}`, image: uniqueProductImages(pick.images)[0], count: matches.length }
            : null;
        })
        .flatMap(d => (d && d.image ? [{ ...d, image: d.image as string }] : [])),
    [products]
  );

  return (
    <div className="min-h-screen">
      <Hero />
      <InfoStrip />

      <CategoryShortcuts />

      {/* Shop by deity */}
      {deityTiles.length > 0 && (
        <section aria-labelledby="deity-title" className="section pb-6 sm:pb-10">
          <div className="container-content">
            <Reveal>
              <SectionHeading
                align="center"
                id="deity-title"
                eyebrow="Shop by god"
                title={
                  <>
                    Choose your <em>blessing</em>
                  </>
                }
              />
            </Reveal>
            <StaggerGroup className="scrollbar-none -mx-4 mt-10 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-8 sm:overflow-visible sm:px-0 lg:grid-cols-10">
              {deityTiles.map(d => (
                <StaggerItem key={d.key} className="w-[104px] flex-shrink-0 snap-start sm:w-auto">
                  <Link to={d.href} className="group flex flex-col items-center text-center">
                    <span className="relative block aspect-square w-full rounded-full p-[3px] transition-all duration-700 ease-luxury [background:conic-gradient(from_180deg,#E3CC9A,#8C6B2E,#E3CC9A,#B8924A,#E3CC9A)] group-hover:rotate-[10deg] group-hover:shadow-gold">
                      <span className="block h-full w-full overflow-hidden rounded-full bg-gradient-to-b from-ivory-light to-stone">
                        <img
                          {...productCardImage(d.image!)}
                          sizes="(min-width: 1024px) 120px, (min-width: 640px) 160px, 104px"
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full scale-[1.15] object-cover transition-transform duration-700 ease-luxury group-hover:-rotate-[10deg] group-hover:scale-[1.5]"
                        />
                      </span>
                    </span>
                    <span className="mt-3 font-display text-[1.05rem] text-ink transition-colors group-hover:text-burgundy sm:text-[1.15rem]">{d.label}</span>
                    <span className="text-[0.75rem] text-ink-soft">{d.count} designs</span>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Featured collection */}
      <section aria-labelledby="featured-title" className="section pt-10 sm:pt-14">
        <div className="container-content">
          <Reveal>
            <SectionHeading
              id="featured-title"
              eyebrow="Most-loved gifts"
              title={
                <>
                  Devotional gifting <em>under ₹2,999</em>
                </>
              }
              intro="Silver foil god frames, Telugu stotram frames, god stands and stotram cards. Order from 1 piece — the price per piece drops as you add more of a product, and you can mix designs."
              action={
                <Link to="/shop?budget=under-2999" className="btn-secondary hidden md:inline-flex">
                  Shop all {giftable.length || ''} gifts <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </Reveal>
          <ProductRow products={featured} loading={loading} />
          <div className="mt-10 flex justify-center md:hidden">
            <Link to="/shop?budget=under-2999" className="btn-primary">
              Shop all gifts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <ShopByOccasion />

      {/* Return gifts */}
      {(loading || returnGifts.length > 0) && (
        <section aria-labelledby="return-gifts-title" className="section bg-white/60">
          <div className="container-content">
            <Reveal>
              <SectionHeading
                id="return-gifts-title"
                eyebrow="Wedding & function return gifts"
                title={
                  <>
                    Return gifts <em>from ₹39</em>
                  </>
                }
                intro="Stotram cards and god stands that guests keep in their pooja room. Bulk price per piece shown — mix designs to reach it."
                action={
                  <Link to="/shop?occasion=wedding-return-gifts" className="btn-secondary hidden md:inline-flex">
                    All return gifts <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
            </Reveal>
            <ProductRow products={returnGifts} loading={loading} count={4} />
          </div>
        </section>
      )}

      {/* Brand story */}
      <section aria-labelledby="story-title" className="section bg-white/60">
        <div className="container-content grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <div className="relative mx-auto max-w-[420px] lg:max-w-[460px]">
              <div className="absolute -inset-3 rounded-t-full border border-gold/40 sm:-inset-5" aria-hidden />
              <div className="relative overflow-hidden rounded-t-full shadow-dialog">
                <img
                  src="/assets/editorial/hero-housewarming-desktop.webp"
                  srcSet="/assets/editorial/hero-housewarming-mobile.webp 900w, /assets/editorial/hero-housewarming-desktop.webp 1376w"
                  sizes="(min-width: 1024px) 460px, 420px"
                  alt="A silver foil Balaji and Padmavathi god frame between brass lamps"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover object-[78%_50%] transition-transform duration-[2000ms] ease-luxury hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-6 -right-2 hidden rounded-2xl border border-gold/30 bg-ivory-light/95 px-6 py-5 shadow-card backdrop-blur sm:block lg:-right-8">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold-dark">Gifting under</p>
                <p className="mt-1 font-display text-4xl text-burgundy">₹2,999</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="eyebrow">Our story</p>
            <h2 id="story-title" className="display-title mt-4">
              Devotion, <em>thoughtfully</em> given
            </h2>
            <p className="lede mt-6">
              SWAYARI brings together devotional gifts that families are proud to give — silver foil god frames, Telugu stotram frames and cards, and god stands — at prices that let you be generous with every guest.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-5">
              {[
                { icon: Flower2, title: `${products.length || 90}+ designs`, body: 'Balaji to Sai Baba' },
                { icon: PackageCheck, title: 'From 1 piece', body: 'Bulk prices as you add' },
                { icon: HandHeart, title: 'Personal service', body: 'We confirm every detail' }
              ].map(item => (
                <li key={item.title} className="flex items-center gap-4 rounded-2xl border border-stone-deep/70 bg-ivory-light/70 p-4 sm:block">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-gold/30 bg-gold-pale/40 sm:h-auto sm:w-auto sm:place-items-start sm:border-0 sm:bg-transparent">
                    <item.icon className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
                  </span>
                  <span className="block">
                    <span className="block font-display text-[1.2rem] leading-tight text-ink sm:mt-3">{item.title}</span>
                    <span className="mt-1 block text-[0.8125rem] text-ink-soft">{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/about" className="text-link group mt-8">
              Read our story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {grandFrames.length > 0 && (
        <section aria-labelledby="grand-title" className="section">
          <div className="container-content">
            <Reveal>
              <SectionHeading
                id="grand-title"
                eyebrow="For the pooja room"
                title={
                  <>
                    Grand <em>god frames</em>
                  </>
                }
                intro="Embossed silver foil deities with lamps and foil ornaments on deep maroon, in carved gold-trimmed frames — a centrepiece for the pooja room and a gift to remember for a griha pravesh."
              />
            </Reveal>
            <ProductRow products={grandFrames} loading={false} count={4} />
          </div>
        </section>
      )}

      <ShopByBudget />

      <BulkReturnGiftsSection products={returnGifts} />

      <OrderProcessExplanation />

      <GiftGuides />

      {/* Concierge band */}
      <section aria-labelledby="contact-strip-title" className="section">
        <div className="container-content">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-gold/30 bg-gradient-to-br from-gold-pale via-ivory-light to-white px-6 py-12 text-center shadow-card sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-burgundy/10 blur-3xl" />
              <div className="relative mx-auto max-w-2xl">
                <p className="eyebrow justify-center">
                  <Sparkles className="h-3.5 w-3.5" /> Personal coordination
                </p>
                <h2 id="contact-strip-title" className="display-title mt-4">
                  Planning for hundreds of guests? <em>Let’s talk.</em>
                </h2>
                <p className="lede mx-auto mt-5 max-w-xl">
                  Fill your cart with any mix of designs and send it as a request. Our team guides you on designs, packing and delivery for your event date — and quotes specially for very large orders.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link to="/contact" className="btn-primary">
                    <Phone className="h-4 w-4" /> Contact our team
                  </Link>
                  <Link to="/shop?occasion=corporate-gifting" className="btn-secondary">
                    Corporate & bulk gifting
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section aria-labelledby="recent-title" className="pb-20">
          <div className="container-content">
            <p id="recent-title" className="eyebrow">
              Recently viewed
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4">
              {recentlyViewed.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
