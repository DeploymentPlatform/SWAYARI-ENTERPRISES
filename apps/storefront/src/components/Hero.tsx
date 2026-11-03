import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight, Gift } from 'lucide-react';
import { Link } from '../lib/router';

interface Slide {
  id: string;
  badge: string;
  headline: string;
  emphasis: string;
  supporting: string;
  ctaText?: string;
  ctaHref?: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
}

// Shown until /api/banners answers (and if it can't); matches migration 0014.
const CONFIRMED_SLIDES: Slide[] = [
  {
    id: 'banner-devotional-99',
    badge: 'Silver foil god frames',
    headline: 'Blessings, beautifully',
    emphasis: 'framed.',
    supporting: 'Balaji, Lakshmi, Ganesh, Sai Baba and more in carved frames — from ₹329, bulk prices from ₹249.',
    ctaText: 'Shop god frames',
    ctaHref: '/shop?category=god-frames',
    desktopImage: '/assets/editorial/hero-signature-desktop.webp',
    mobileImage: '/assets/editorial/hero-signature-mobile.webp',
    alt: 'A stotram book in a gold box, a framed Ganesh and a Ganesh stand in silver foil on maroon silk with a brass diya'
  },
  {
    id: 'banner-wedding-guest',
    badge: 'Wedding return gifts',
    headline: 'A blessing in every',
    emphasis: "guest's hands.",
    supporting: 'Silver foil stotram cards from ₹39 and god stands from ₹49 in bulk. Mix designs to reach a slab.',
    ctaText: 'Shop return gifts',
    ctaHref: '/shop?occasion=wedding-return-gifts',
    desktopImage: '/assets/editorial/hero-wedding-desktop.webp',
    mobileImage: '/assets/editorial/hero-wedding-mobile.webp',
    alt: 'God stands and stotram cards in red envelopes among marigolds, jasmine and brass lamps'
  },
  {
    id: 'banner-bulk-process',
    badge: 'Order from 1 piece',
    headline: 'Fill your cart.',
    emphasis: 'We confirm the rest.',
    supporting: 'Send your cart as a request — no payment online. We call to confirm stock, packing and delivery at actual cost.',
    ctaText: 'How ordering works',
    ctaHref: '/ordering-policy',
    desktopImage: '/assets/editorial/hero-corporate-desktop.webp',
    mobileImage: '/assets/editorial/hero-corporate-mobile.webp',
    alt: 'Maroon velvet gift boxes tied with a cream satin ribbon'
  }
];

const EASE = [0.22, 1, 0.36, 1] as const;
const heroItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } }
};

// The collection promise stays put while the slides change. It renders immediately (no entrance
// animation) so the first thing a visitor sees is the full message, not text fading in.
const GOLD_TEXT =
  'bg-[linear-gradient(110deg,#C9A45C_10%,#F7EBCB_36%,#E8CF98_52%,#C9A45C_74%)] bg-[length:200%_100%] bg-clip-text text-transparent motion-safe:animate-shimmer [animation-duration:9s]';

const PricePromise: React.FC = () => (
  <div>
    <p className="flex items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-gold-light">
      <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold-light" aria-hidden />
      Devotional gifting
    </p>
    <h1 className="mt-3 font-display font-medium text-ivory-light sm:mt-4">
      <span className="block text-[1.9rem] leading-none tracking-[-0.01em] sm:text-[2.5rem] lg:text-[3rem]">Gifting under</span>
      <span
        className={`-ml-1 block pb-1 text-[4.6rem] font-semibold leading-[0.95] tracking-[-0.035em] [filter:drop-shadow(0_8px_28px_rgba(227,204,154,0.3))] sm:text-[6rem] lg:text-[7.25rem] ${GOLD_TEXT}`}
      >
        ₹2,999
      </span>
    </h1>
    <p className="mt-3 text-[0.8125rem] font-medium tracking-[0.04em] text-ivory-light sm:text-[0.9375rem]">
      Return gifts from ₹39 <span className="mx-1.5 text-gold-light" aria-hidden>·</span> Order from 1 piece
      <span className="mx-1.5 text-gold-light" aria-hidden>·</span> Bulk prices as you add more
    </p>
  </div>
);

export const Hero: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>(CONFIRMED_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    fetch('/api/banners')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.banners && data.banners.length > 0) {
          setSlides(data.banners);
        }
      })
      .catch(() => {});
  }, []);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay timer with pause on hover
  useEffect(() => {
    if (!isPlaying || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, nextSlide]);

  // Keyboard navigation when hero has focus
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      setIsPlaying(false);
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      setIsPlaying(false);
      prevSlide();
    }
  }

  // Mouse / Touch drag handlers
  function handleTouchStart(e: React.TouchEvent) {
    setDragStartX(e.touches[0].clientX);
    setIsDragging(false);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (dragStartX === null) return;
    const diff = dragStartX - e.touches[0].clientX;
    if (Math.abs(diff) > 10) {
      setIsDragging(true);
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (dragStartX === null) return;
    const diff = dragStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      setIsPlaying(false);
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setDragStartX(null);
    setTimeout(() => setIsDragging(false), 50);
  }

  const slide = slides[current] || slides[0];
  const AUTOPLAY_MS = 6500;

  return (
    <section
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="SWAYARI collections"
      className="relative select-none overflow-hidden bg-umber text-ivory-light touch-pan-y focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div
        className="relative h-[min(82svh,640px)] min-h-[500px] w-full overflow-hidden sm:min-h-[540px] lg:h-[min(80vh,720px)]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${current + 1} of ${total}: ${slide.headline} ${slide.emphasis}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="absolute inset-0"
          >
            <picture className="absolute inset-0 block h-full w-full overflow-hidden">
              <source media="(min-width: 768px)" srcSet={slide.desktopImage} />
              <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
              <img
                src={slide.desktopImage}
                alt={slide.alt || 'SWAYARI devotional gifts'}
                loading={current === 0 ? 'eager' : 'lazy'}
                className={`h-full w-full object-cover object-[72%_50%] ${reduceMotion ? '' : 'animate-ken-burns'}`}
              />
            </picture>
          </motion.div>
        </AnimatePresence>

        {/* Legibility veils: warm vignette + bottom fade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-umber/90 via-umber/60 to-umber/10" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-umber/85 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-gold/15 blur-[100px]" aria-hidden />

        {/* Copy */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="container-content w-full">
            <div className="max-w-[640px] pb-16 sm:pb-10">
              <PricePromise />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={slide.id}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
                    exit: { opacity: 0, transition: { duration: 0.18 } }
                  }}
                >
                  <motion.div variants={heroItem} className="mt-6 flex items-center gap-3 sm:mt-7" aria-hidden>
                    <span className="block h-1.5 w-1.5 rotate-45 bg-gold-light" />
                    <span className="h-px w-16 bg-gradient-to-r from-gold-light/70 to-transparent" />
                  </motion.div>
                  <motion.p variants={heroItem} className="mt-4 text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-gold-light">
                    {slide.badge}
                  </motion.p>
                  <motion.h2
                    variants={heroItem}
                    className="mt-2 font-display text-[1.6rem] font-medium leading-[1.08] tracking-[-0.01em] text-ivory-light sm:text-[2rem] lg:text-[2.35rem]"
                  >
                    {slide.headline} <span className="italic text-gold-light">{slide.emphasis}</span>
                  </motion.h2>
                  <motion.p variants={heroItem} className="mt-3 max-w-[480px] text-[0.9375rem] leading-relaxed text-ivory-light/90 sm:text-[1.0625rem]">
                    {slide.supporting}
                  </motion.p>
                  <motion.div variants={heroItem} className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      to={slide.ctaHref || '/shop'}
                      onClick={e => {
                        if (isDragging) e.preventDefault();
                      }}
                      className="btn-gold"
                    >
                      {slide.ctaText || 'Explore the collection'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/shop?budget=under-2999"
                      onClick={e => {
                        if (isDragging) e.preventDefault();
                      }}
                      className="btn-ghost-light"
                    >
                      <Gift className="h-4 w-4 text-gold-light" />
                      Gifts under ₹2,999
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-0 z-20 pb-6 sm:pb-8">
          <div className="container-content flex items-end justify-between gap-6">
            <div className="flex flex-1 items-center gap-4 sm:max-w-md">
              <span className="font-display text-sm tabular-nums text-gold-light">
                {String(current + 1).padStart(2, '0')}
                <span className="mx-1.5 text-ivory-light/75">/</span>
                <span className="text-ivory-light/75">{String(total).padStart(2, '0')}</span>
              </span>
              <div className="flex flex-1 items-center gap-2" role="tablist" aria-label="Slide selectors">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === current}
                    aria-label={`Go to slide ${idx + 1}: ${s.headline}`}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrent(idx);
                    }}
                    className="group relative h-6 flex-1"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full bg-ivory-light/25 transition-colors group-hover:bg-ivory-light/40">
                      {idx === current && (
                        <motion.span
                          key={`${s.id}-${isPlaying && !isHovered}`}
                          className="absolute inset-y-0 left-0 block bg-gold-light"
                          initial={{ width: isPlaying && !isHovered && !reduceMotion ? '0%' : '100%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: isPlaying && !isHovered && !reduceMotion ? AUTOPLAY_MS / 1000 : 0, ease: 'linear' }}
                        />
                      )}
                      {idx < current && <span className="absolute inset-0 block bg-gold-light/60" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="grid h-11 w-11 place-items-center rounded-full border border-ivory-light/25 text-ivory-light/80 backdrop-blur-md transition-all hover:border-gold-light hover:text-gold-light"
                aria-label={isPlaying ? 'Pause carousel autoplay' : 'Play carousel autoplay'}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  prevSlide();
                }}
                className="hidden h-11 w-11 place-items-center rounded-full border border-ivory-light/25 text-ivory-light backdrop-blur-md transition-all hover:-translate-x-0.5 hover:border-gold-light hover:bg-gold-light hover:text-umber sm:grid"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  nextSlide();
                }}
                className="hidden h-11 w-11 place-items-center rounded-full border border-ivory-light/25 text-ivory-light backdrop-blur-md transition-all hover:translate-x-0.5 hover:border-gold-light hover:bg-gold-light hover:text-umber sm:grid"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
