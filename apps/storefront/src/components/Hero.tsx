import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from '../lib/router';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Wide editorial hero. Desktop: the photograph fills the right ~76% and fades into a deep umber
 * panel sampled from its own shadows, so the headline sits in true negative space and never
 * crosses the lamps. Mobile: a dedicated 4:5 crop with the copy on a solid panel beneath it.
 * The photograph is licensed editorial imagery (see docs/ASSET_SOURCES.md), not a product.
 */
export const Hero: React.FC = () => {
  const reduce = useReducedMotion();
  const enter = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: EASE } };

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-umber text-ivory">
      <div className="relative md:h-[clamp(540px,43vw,640px)]">
        <picture>
          <source
            media="(min-width: 768px)"
            type="image/webp"
            srcSet="/assets/editorial/hero-festive-lamps-1600.webp 1600w, /assets/editorial/hero-festive-lamps-2400.webp 2400w"
            sizes="76vw"
          />
          <source
            media="(min-width: 768px)"
            srcSet="/assets/editorial/hero-festive-lamps-1600.jpg 1600w, /assets/editorial/hero-festive-lamps-2400.jpg 2400w"
            sizes="76vw"
          />
          <source
            type="image/webp"
            srcSet="/assets/editorial/hero-festive-lamps-mobile-600.webp 600w, /assets/editorial/hero-festive-lamps-mobile-900.webp 900w"
            sizes="100vw"
          />
          <img
            src="/assets/editorial/hero-festive-lamps-mobile-900.jpg"
            srcSet="/assets/editorial/hero-festive-lamps-mobile-600.jpg 600w, /assets/editorial/hero-festive-lamps-mobile-900.jpg 900w"
            sizes="100vw"
            width={900}
            height={1125}
            alt="Brass oil lamps glowing beside a tray of marigolds on a dark table"
            loading="eager"
            decoding="sync"
            {...({ fetchpriority: 'high' } as Record<string, string>)}
            className="block aspect-square max-h-[60vh] w-full object-cover object-[50%_72%] md:absolute md:inset-y-0 md:right-0 md:aspect-auto md:h-full md:max-h-none md:w-[76%] md:object-[50%_55%] md:hero-image-fade"
          />
        </picture>

        {/* Mobile: blend the photo into the copy panel */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-umber md:hidden" aria-hidden />
        {/* Desktop: a soft extra shade behind the text column only */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[46%] bg-gradient-to-r from-umber via-umber/70 to-transparent md:block" aria-hidden />

        <div className="relative md:absolute md:inset-0">
          <div className="container-content -mt-6 flex h-full flex-col justify-center pb-10 md:mt-0 md:py-0">
            <div className="max-w-[34rem]">
              <motion.p {...enter(0.05)} className="mb-4 flex md:mb-5 items-center gap-3 font-sans text-label uppercase text-gold-light">
                <span className="h-px w-8 bg-gold" aria-hidden />
                Décor &amp; Gifting
              </motion.p>
              <motion.h1
                {...enter(0.12)}
                id="hero-title"
                className="font-display text-[2.75rem] font-medium leading-[1.02] tracking-[-0.015em] text-ivory sm:text-[3.5rem] lg:text-display-xl"
              >
                Meaningful gifts.
                <br />
                <em className="font-medium not-italic text-gold-light md:italic">Beautiful spaces.</em>
              </motion.h1>
              <motion.p {...enter(0.2)} className="mt-5 max-w-[32rem] text-lg leading-relaxed text-ivory/85 md:text-xl">
                Explore décor and gifting for the moments that matter.
              </motion.p>
              <motion.div {...enter(0.28)} className="mt-7 flex md:mt-8 flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/shop" className="btn-light w-full sm:w-auto">
                  Explore the Collection
                </Link>
                <Link to="/contact?topic=gift" className="btn-ghost-light w-full sm:w-auto">
                  Discuss a Gift
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        <p className="absolute right-4 top-3 text-[0.6875rem] uppercase tracking-[0.14em] text-ivory/60 md:bottom-4 md:right-6 md:top-auto">
          Styling inspiration
        </p>
      </div>
    </section>
  );
};
