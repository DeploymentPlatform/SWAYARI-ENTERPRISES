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
    }, 5500);

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

  return (
    <section
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Devotional frames campaigns"
      className="relative overflow-hidden bg-[#1D1311] text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#C49A45] select-none touch-pan-y"
    >
      {/* Carousel Container: Desktop ~310-340px, Mobile ~210-240px */}
      <div 
        className="relative h-[220px] sm:h-[260px] md:h-[310px] lg:h-[330px] w-full overflow-hidden"
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
                    alt={slide.alt || 'Devotional frame'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover object-center"
                  />
                </picture>

                {/* Left Gradient Overlay so text is crisp and readable */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-[#1D1311]/95 via-[#1D1311]/75 to-transparent pointer-events-none"
                  aria-hidden 
                />

                {/* Content Overlay */}
                <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-[560px]">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C49A45]/20 border border-[#C49A45]/40 text-[#E8D29E] text-[11px] sm:text-[12px] font-semibold tracking-wider uppercase mb-1.5 sm:mb-2.5">
                      <Sparkles className="w-3 h-3 text-[#C49A45]" />
                      <span>{slide.badge}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-display text-[1.65rem] sm:text-[2.2rem] md:text-[2.65rem] font-bold leading-[1.08] tracking-[-0.015em] text-white">
                      {slide.headline}{' '}
                      <span className="text-[#E8D29E] italic font-normal">
                        {slide.emphasis}
                      </span>
                    </h1>

                    {/* Supporting Text */}
                    <p className="mt-1.5 sm:mt-2 text-[12.5px] sm:text-[14.5px] text-[#FDFBF7]/90 line-clamp-2 sm:line-clamp-none max-w-[480px] leading-relaxed">
                      {slide.supporting}
                    </p>

                    {/* Primary & Secondary Action Buttons */}
                    <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
                      {/* Primary Button: Explore Frames */}
                      <Link
                        to="/shop"
                        onClick={(e) => {
                          if (isDragging) e.preventDefault();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#5C1D24] text-white text-[12.5px] sm:text-[13.5px] font-semibold hover:bg-[#4A161D] border border-[#C49A45]/30 shadow-md transition-all hover:scale-[1.02]"
                      >
                        <span>Explore Frames</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#E8D29E]" />
                      </Link>

                      {/* Secondary Button: Request a Bulk Quote */}
                      <Link
                        to="/shop?bulk=1"
                        onClick={(e) => {
                          if (isDragging) e.preventDefault();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[12.5px] sm:text-[13.5px] font-semibold border border-white/25 backdrop-blur-sm shadow-xs transition-all"
                      >
                        <MessageSquareQuote className="w-3.5 h-3.5 text-[#E8D29E]" />
                        <span>Request a Bulk Quote</span>
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
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-[#5C1D24] text-white border border-white/20 items-center justify-center backdrop-blur-sm transition-all z-20 shadow-md hover:scale-105"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => { setIsPlaying(false); nextSlide(); }}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-[#5C1D24] text-white border border-white/20 items-center justify-center backdrop-blur-sm transition-all z-20 shadow-md hover:scale-105"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Bottom Bar: Indicators & Pause/Play */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 left-0 right-0 z-20">
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
                      ? 'w-7 bg-[#C49A45] shadow-xs' 
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/10 text-[10px] flex items-center gap-1 backdrop-blur-sm transition-colors"
              aria-label={isPlaying ? 'Pause carousel autoplay' : 'Play carousel autoplay'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="hidden sm:inline text-[9.5px] uppercase tracking-wider">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
