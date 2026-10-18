import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';
import { Link } from '../lib/router';

interface Slide {
  id: string;
  badge: string;
  headline: string;
  emphasis: string;
  supporting: string;
  ctaText: string;
  ctaHref: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
}

const SLIDES: Slide[] = [
  {
    id: 'moments',
    badge: 'Artisanal Festive Collection',
    headline: 'Gifts for Meaningful',
    emphasis: 'Moments.',
    supporting: 'Handcrafted bell-metal brass lamps, ritual centerpieces, and celebratory keepsakes.',
    ctaText: 'Explore Gifting Sets',
    ctaHref: '/shop?category=gift-sets',
    desktopImage: '/assets/editorial/hero-slide-1-moments-desktop.webp',
    mobileImage: '/assets/editorial/hero-slide-1-moments-mobile.webp',
    alt: 'Festive brass lamps illuminated beside marigolds and celebration offerings'
  },
  {
    id: 'devotional',
    badge: 'Sanctum & Prayer Room',
    headline: 'Devotional Frames',
    emphasis: 'Collection.',
    supporting: 'Gold and silver embossed deity plaques framed in solid hardwood with archival preservation.',
    ctaText: 'View Sanctum Frames',
    ctaHref: '/shop?category=devotional-frames',
    desktopImage: '/assets/editorial/hero-slide-2-devotional-desktop.webp',
    mobileImage: '/assets/editorial/hero-slide-2-devotional-mobile.webp',
    alt: 'Ornate gold framed devotional sanctum relief panel'
  },
  {
    id: 'lighting',
    badge: 'Heirloom Brassware',
    headline: 'Artisanal Brass &',
    emphasis: 'Temple Lighting.',
    supporting: 'Traditional Kuthu pillar lamps, tiered deepams, and resonant bell-metal temple bells.',
    ctaText: 'Discover Lighting',
    ctaHref: '/shop?category=decorative-lamps',
    desktopImage: '/assets/editorial/hero-slide-3-decor-desktop.webp',
    mobileImage: '/assets/editorial/hero-slide-3-decor-mobile.webp',
    alt: 'Traditional ornate brass kuthu pillar lamp with multi-tiered flame wells'
  },
  {
    id: 'uruli',
    badge: 'Traditional Living',
    headline: 'Festive Urulis &',
    emphasis: 'Home Accents.',
    supporting: 'Hand-hammered brass vessels, floating blossom arrangements, and sacred altar sculptures.',
    ctaText: 'Explore Festive Décor',
    ctaHref: '/shop?category=festive-decor',
    desktopImage: '/assets/editorial/hero-slide-4-gifting-desktop.webp',
    mobileImage: '/assets/editorial/hero-slide-4-gifting-mobile.webp',
    alt: 'Handcrafted celebratory gift box and traditional pooja vessel'
  }
];

export const Hero: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>(SLIDES);
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

  // Autoplay management: 6 seconds, pauses on hover, focus, or tab hidden
  useEffect(() => {
    if (!isPlaying || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, nextSlide]);

  // Pause autoplay when document is hidden (user switched tabs)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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

  return (
    <section
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Highlighted Campaigns"
      className="relative overflow-hidden bg-[#1B1310] text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#B49155] select-none touch-pan-y"
    >
      {/* Carousel Container: Compact height ~340px desktop, ~260px mobile */}
      <div 
        className="relative h-[260px] sm:h-[300px] md:h-[350px] lg:h-[380px] w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} mode="wait">
          {slides.map((slide, index) => {
            if (index !== current) return null;

            return (
              <motion.div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${total}: ${slide.headline} ${slide.emphasis}`}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center"
              >
                {/* Background Image: Desktop & Mobile art-directed crops */}
                <picture className="absolute inset-0 w-full h-full">
                  <source media="(min-width: 768px)" srcSet={slide.desktopImage} type="image/webp" />
                  <source media="(max-width: 767px)" srcSet={slide.mobileImage} type="image/webp" />
                  <img
                    src={slide.desktopImage}
                    alt={slide.alt}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover object-center"
                  />
                </picture>

                {/* Left Gradient Overlay so text is crisp and readable */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-[#1B1310]/95 via-[#1B1310]/75 to-transparent pointer-events-none"
                  aria-hidden 
                />

                {/* Content Overlay */}
                <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-[540px]">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B49155]/20 border border-[#B49155]/40 text-[#D8C29D] text-[11px] sm:text-[12px] font-semibold tracking-wider uppercase mb-2 sm:mb-3">
                      <Sparkles className="w-3 h-3 text-[#B49155]" />
                      <span>{slide.badge}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-display text-[1.75rem] sm:text-[2.25rem] md:text-[2.75rem] font-bold leading-[1.08] tracking-[-0.015em] text-white">
                      {slide.headline}{' '}
                      <span className="text-[#D8C29D] italic font-normal">
                        {slide.emphasis}
                      </span>
                    </h1>

                    {/* Supporting Text */}
                    <p className="mt-2 sm:mt-2.5 text-[13px] sm:text-[15px] text-[#F7F4EF]/90 line-clamp-2 sm:line-clamp-none max-w-[460px] leading-relaxed">
                      {slide.supporting}
                    </p>

                    {/* CTA Button */}
                    <div className="mt-4 sm:mt-5">
                      <Link
                        to={slide.ctaHref}
                        onClick={(e) => {
                          if (isDragging) e.preventDefault();
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-[#571C2A] text-white text-[13px] sm:text-[14px] font-semibold hover:bg-[#441420] border border-[#B49155]/30 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <span>{slide.ctaText}</span>
                        <ChevronRight className="w-4 h-4 text-[#D8C29D]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Carousel Prev/Next Buttons (Desktop) */}
        <button
          type="button"
          onClick={() => { setIsPlaying(false); prevSlide(); }}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-[#571C2A] text-white border border-white/20 items-center justify-center backdrop-blur-sm transition-all z-20 shadow-md hover:scale-105"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => { setIsPlaying(false); nextSlide(); }}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-[#571C2A] text-white border border-white/20 items-center justify-center backdrop-blur-sm transition-all z-20 shadow-md hover:scale-105"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Bottom Bar: Indicators & Pause/Play */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Pill Dots */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Slide selectors">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === current}
                  aria-label={`Go to slide ${idx + 1}: ${s.headline}`}
                  onClick={() => { setIsPlaying(false); setCurrent(idx); }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === current 
                      ? 'w-7 bg-[#B49155] shadow-sm' 
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/10 text-[11px] flex items-center gap-1 backdrop-blur-sm transition-colors"
              aria-label={isPlaying ? 'Pause carousel autoplay' : 'Play carousel autoplay'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
