import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles, ArrowRight, MessageSquareQuote } from 'lucide-react';
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

const CONFIRMED_SLIDES: Slide[] = [
  {
    id: 'devotional-99',
    badge: 'Auspicious Celebrations',
    headline: 'Devotional frames',
    emphasis: '₹99 & under',
    supporting: 'Thoughtful return gifts for your special celebrations. Pure devotion, beautifully framed.',
    desktopImage: '/assets/editorial/hero-slide-2-devotional-desktop.webp',
    mobileImage: '/assets/editorial/hero-slide-2-devotional-mobile.jpg',
    alt: 'Devotional sanctum frames for weddings and celebrations'
  },
  {
    id: 'thoughtful-thank-you',
    badge: 'Cherished Keepsakes',
    headline: 'A thoughtful thank-you',
    emphasis: 'for every guest.',
    supporting: 'Blessings of Ganesha, Lakshmi, Balaji & Radha Krishna. Quoted separately for bulk shipping.',
    desktopImage: '/assets/editorial/hero-festive-lamps-1080.webp',
    mobileImage: '/assets/editorial/hero-festive-lamps-mobile-900.webp',
    alt: 'Auspicious wedding return gift frames'
  },
  {
    id: 'bulk-quantity-choice',
    badge: 'Seamless Bulk Requests',
    headline: 'Choose your frames.',
    emphasis: 'Tell us your quantity.',
    supporting: 'Select your preferred designs. Our team contacts you to confirm availability, packing and dispatch.',
    desktopImage: '/assets/editorial/hero-slide-1-moments-desktop.webp',
    mobileImage: '/assets/editorial/hero-slide-1-moments-mobile.webp',
    alt: 'Bulk devotional return gifts'
  }
];

const heroItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
};

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
      aria-label="Devotional frames campaigns"
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
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <picture className="absolute inset-0 block h-full w-full overflow-hidden">
              <source media="(min-width: 768px)" srcSet={slide.desktopImage} />
              <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
              <img
                src={slide.desktopImage}
                alt={slide.alt || 'Devotional frame'}
                loading={current === 0 ? 'eager' : 'lazy'}
                className={`h-full w-full object-cover object-center ${reduceMotion ? '' : 'animate-ken-burns'}`}
              />
            </picture>
          </motion.div>
        </AnimatePresence>

        {/* Legibility veils: warm vignette + bottom fade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-umber/90 via-umber/55 to-umber/5" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-umber/85 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-gold/15 blur-[100px]" aria-hidden />

        {/* Copy */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="container-content w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                className="max-w-[620px] pb-16 sm:pb-10"
                initial="hidden"
                animate="show"
                exit="exit"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
                  exit: { opacity: 0, y: -10, transition: { duration: 0.35 } }
                }}
              >
                <motion.p
                  variants={heroItem}
                  className="inline-flex items-center gap-2 rounded-full border border-gold-light/30 bg-white/5 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold-light backdrop-blur-md"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  {slide.badge}
                </motion.p>
                <motion.h1
                  variants={heroItem}
                  className="mt-5 font-display text-[2.6rem] font-medium leading-[0.98] tracking-[-0.02em] text-ivory-light sm:text-[3.6rem] lg:text-[4.6rem]"
                >
                  {slide.headline}
                  <span className="mt-1 block font-display italic text-gold-light">{slide.emphasis}</span>
                </motion.h1>
                <motion.div variants={heroItem} className="ornament mt-6 justify-start text-gold-light before:hidden" aria-hidden>
                  <span className="block h-1.5 w-1.5 rotate-45 bg-gold-light" />
                </motion.div>
                <motion.p variants={heroItem} className="mt-5 max-w-[480px] text-[0.95rem] leading-relaxed text-ivory-light/85 sm:text-[1.0625rem]">
                  {slide.supporting}
                </motion.p>
                <motion.div variants={heroItem} className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    to={slide.ctaHref || '/shop'}
                    onClick={e => {
                      if (isDragging) e.preventDefault();
                    }}
                    className="btn-gold"
                  >
                    {slide.ctaText || 'Explore frames'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/shop?bulk=1"
                    onClick={e => {
                      if (isDragging) e.preventDefault();
                    }}
                    className="btn-ghost-light"
                  >
                    <MessageSquareQuote className="h-4 w-4 text-gold-light" />
                    Bulk quote
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-0 z-20 pb-6 sm:pb-8">
          <div className="container-content flex items-end justify-between gap-6">
            <div className="flex flex-1 items-center gap-4 sm:max-w-md">
              <span className="font-display text-sm tabular-nums text-gold-light">
                {String(current + 1).padStart(2, '0')}
                <span className="mx-1.5 text-ivory-light/40">/</span>
                <span className="text-ivory-light/60">{String(total).padStart(2, '0')}</span>
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
