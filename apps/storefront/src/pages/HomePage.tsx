import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Phone, Sparkles, Flower2, PackageCheck, HandHeart } from 'lucide-react';
import { Hero } from '../components/Hero';
import { InfoStrip } from '../components/InfoStrip';
import { BulkReturnGiftsSection } from '../components/BulkReturnGiftsSection';
import { OrderProcessExplanation } from '../components/OrderProcessExplanation';
import { ProductCard } from '../components/ProductCard';
import { SectionHeading } from '../components/ui';
import { Reveal, StaggerGroup, StaggerItem } from '../components/motion';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { useProducts } from '../lib/products';
import { Product, BRAND_TAGLINES, MAX_FRAME_PRICE } from '@swayari/shared';
import { productCardImage, uniqueProductImages } from '../lib/media';

// Short names for the "Shop by deity" row; one tile per frame in the catalogue.
const DEITY_LABELS: Record<string, string> = {
  balaji: 'Balaji',
  'balaji padmavathi': 'Padmavathi Srinivasa',
  'sai baba': 'Sai Baba',
  'radha krishna': 'Radha Krishna',
  'bal krishna': 'Bal Krishna',
  'ram darbar': 'Ram Darbar',
  hanuman: 'Hanuman'
};

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

export const HomePage: React.FC = () => {
  usePageMeta(
    BRAND_TAGLINES.headline,
    `${BRAND_TAGLINES.supporting} Everything under ₹999, including No. 1 silver foil god frames at ₹99 each for wedding return gifts, griha pravesh and poojas. Minimum order 25 frames; shipping extra.`
  );

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
          .filter((p): p is Product => Boolean(p) && (p.indicativePrice === null || p.indicativePrice <= MAX_FRAME_PRICE))
          .slice(0, 4);
        setRecentlyViewed(matches);
      }
    } catch {
      // Ignore local storage parse error
    }
  }, [products]);

  const eligibleFrames = products.filter(p => p.indicativePrice !== null && p.indicativePrice <= MAX_FRAME_PRICE);
  const featuredFrames = (eligibleFrames.length > 0 ? eligibleFrames : products).slice(0, 8);

  // One tile per frame, linking straight to that design.
  const deityTiles = useMemo(
    () =>
      products
        .map(p => ({
          key: p.id,
          label: DEITY_LABELS[(p.deity || '').toLowerCase()] || p.deity || p.name,
          href: `/product/${p.slug}`,
          image: uniqueProductImages(p.images)[0]
        }))
        .filter(d => d.image)
        .slice(0, 8),
    [products]
  );

  return (
    <div className="min-h-screen">
      <Hero />
      <InfoStrip />

      {/* Shop by deity */}
      {deityTiles.length > 0 && (
        <section aria-labelledby="deity-title" className="section pb-6 sm:pb-10">
          <div className="container-content">
            <Reveal>
              <SectionHeading
                align="center"
                id="deity-title"
                eyebrow="Shop by deity"
                title={
                  <>
                    Choose your <em>blessing</em>
                  </>
                }
              />
            </Reveal>
            <StaggerGroup className="scrollbar-none -mx-4 mt-10 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-8 sm:overflow-visible sm:px-0 lg:grid-cols-7">
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
                          className="h-full w-full scale-[1.35] object-cover transition-transform duration-700 ease-luxury group-hover:-rotate-[10deg] group-hover:scale-[1.5]"
                        />
                      </span>
                    </span>
                    <span className="mt-3 font-display text-[1.05rem] text-ink transition-colors group-hover:text-burgundy sm:text-[1.15rem]">{d.label}</span>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Featured collection */}
      <section aria-labelledby="frames-collection-title" className="section pt-10 sm:pt-14">
        <div className="container-content">
          <Reveal>
            <SectionHeading
              id="frames-collection-title"
              eyebrow="The devotional collection"
              title={
                <>
                  Silver foil god frames <em>₹99 each</em>
                </>
              }
              intro="Silver foil relief with hand-applied colour, in a maroon and gold frame that stands on a table or hangs on a wall. Mix any designs — minimum 25 frames per order."
              action={
                <Link to="/shop" className="btn-secondary hidden md:inline-flex">
                  Explore all frames <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </Reveal>

          <StaggerGroup className="mt-10 grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4">
            {loading && products.length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <StaggerItem key={i}>
                    <SkeletonCard />
                  </StaggerItem>
                ))
              : featuredFrames.map((prod, idx) => (
                  <StaggerItem key={prod.id}>
                    <ProductCard product={prod} priority={idx < 2} />
                  </StaggerItem>
                ))}
          </StaggerGroup>

          <div className="mt-10 text-center md:hidden">
            <Link to="/shop" className="btn-primary">
              View all frames <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section aria-labelledby="story-title" className="section bg-white/60">
        <div className="container-content grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <div className="relative mx-auto max-w-[420px] lg:max-w-[460px]">
              <div className="absolute -inset-3 rounded-t-full border border-gold/40 sm:-inset-5" aria-hidden />
              <div className="relative overflow-hidden rounded-t-full shadow-dialog">
                <img
                  src="/assets/editorial/hero-god-frames-desktop.webp"
                  srcSet="/assets/editorial/hero-god-frames-mobile.webp 900w, /assets/editorial/hero-god-frames-desktop.webp 1376w"
                  sizes="(min-width: 1024px) 460px, 420px"
                  alt="Devotional frames arranged for a celebration"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-[2000ms] ease-luxury hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-6 -right-2 hidden rounded-2xl border border-gold/30 bg-ivory-light/95 px-6 py-5 shadow-card backdrop-blur sm:block lg:-right-8">
                <p className="font-display text-4xl text-burgundy">₹999</p>
                <p className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold-dark">Everything is under</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="eyebrow">Our story</p>
            <h2 id="story-title" className="display-title mt-4">
              Devotion, <em>thoughtfully</em> given
            </h2>
            <p className="lede mt-6">
              SWAYARI brings you devotional god frames that families are proud to hand to every guest. Each one has silver foil relief with colour work, a cream mount and a carved-look maroon and gold border — at a price that lets you be generous with every invitation.
            </p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-3">
              {[
                { icon: Flower2, title: 'Seven designs', body: 'Balaji to Sai Baba' },
                { icon: PackageCheck, title: 'From 25 frames', body: 'Mix designs freely' },
                { icon: HandHeart, title: 'Personal service', body: 'We confirm every detail' }
              ].map(item => (
                <li key={item.title} className="rounded-2xl border border-stone-deep/70 bg-ivory-light/70 p-4">
                  <item.icon className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
                  <p className="mt-3 font-display text-[1.2rem] leading-tight text-ink">{item.title}</p>
                  <p className="mt-1 text-[0.8125rem] text-ink-soft">{item.body}</p>
                </li>
              ))}
            </ul>
            <Link to="/about" className="text-link group mt-8">
              Read our story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      <BulkReturnGiftsSection products={eligibleFrames} />

      <OrderProcessExplanation />

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
                  Our team will guide you on deity selections, mixed design arrangements, safe packaging and courier timings for your event date.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link to="/contact" className="btn-primary">
                    <Phone className="h-4 w-4" /> Contact our team
                  </Link>
                  <Link to="/shop?bulk=1" className="btn-secondary">
                    Request a bulk quote
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
