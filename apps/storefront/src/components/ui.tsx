import React, { useEffect, useRef } from 'react';
import { Minus, Plus, Info, PackageCheck } from 'lucide-react';
import { ORDER_DISCLAIMER_TEXT, formatPrice } from '@swayari/shared';
import { ImageSources } from '../lib/media';

/* ------------------------------------------------------------------ Brand */

export const LotusMark: React.FC<{ className?: string; title?: string }> = ({ className = 'h-4 w-6', title }) => (
  <svg viewBox="0 0 48 30" className={className} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} fill="none">
    {title && <title>{title}</title>}
    <g stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M24 2c-3 5-4 10 0 16 4-6 3-11 0-16Z" fill="currentColor" fillOpacity="0.18" />
      <path d="M21 14c-5-6-12-5-13 0 2 4 8 5 14 4" />
      <path d="M27 14c5-6 12-5 13 0-2 4-8 5-14 4" />
      <path d="M17 18c-6-1-11 1-12 4 5 2 11 1 16-2" />
      <path d="M31 18c6-1 11 1 12 4-5 2-11 1-16-2" />
      <path d="M24 22l2 3-2 3-2-3 2-3Z" fill="currentColor" />
    </g>
  </svg>
);

/**
 * The SWAYARI logo, redrawn as vector (scripts/brand/make-logo-svg.py): bright gold with a glow for dark
 * backgrounds, deeper gold with a soft shadow for light ones. The compact lockup drops the lotus rule.
 */
export const LOGO_ON_LIGHT = '/assets/brand/swayari-logo-light.svg';
export const LOGO_ON_DARK = '/assets/brand/swayari-logo-gold.svg';
export const LOGO_COMPACT_ON_LIGHT = '/assets/brand/swayari-logo-light-compact.svg';
export const LOGO_SIZE = { width: 1000, height: 360 };
export const LOGO_COMPACT_SIZE = { width: 1000, height: 270 };

export const Wordmark: React.FC<{ tone?: 'dark' | 'light'; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  tone = 'dark',
  size = 'md',
  className = ''
}) => {
  const height = { sm: 'h-9', md: 'h-12 sm:h-14', lg: 'h-20 sm:h-24' }[size];
  return (
    <img
      src={tone === 'dark' ? LOGO_ON_LIGHT : LOGO_ON_DARK}
      alt="SWAYARI — Décor & Gifting"
      {...LOGO_SIZE}
      decoding="async"
      className={`${height} w-auto select-none ${className}`}
      draggable={false}
    />
  );
};

/* ------------------------------------------------------------------ Images */

interface PictureProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  sources: ImageSources;
  sizes: string;
  width: number;
  height: number;
  priority?: boolean;
}

export const Picture: React.FC<PictureProps> = ({ sources, sizes, width, height, priority, alt, className, ...rest }) => (
  <picture>
    {sources.webpSrcSet && <source type="image/webp" srcSet={sources.webpSrcSet} sizes={sizes} />}
    <img
      src={sources.src}
      srcSet={sources.srcSet}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      {...({ fetchpriority: priority ? 'high' : undefined } as Record<string, string | undefined>)}
      className={className}
      {...rest}
    />
  </picture>
);

/* ------------------------------------------------------------------ Controls */

export const QuantityStepper: React.FC<{
  value: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  size?: 'sm' | 'md';
}> = ({ value, min = 1, step = 1, onChange, label, size = 'md' }) => {
  const box = size === 'sm' ? 'h-9 w-9' : 'h-12 w-12';
  return (
    <div className="inline-flex items-center overflow-hidden rounded-full border border-stone-deep bg-white shadow-subtle" role="group" aria-label={label}>
      <button
        type="button"
        className={`${box} inline-flex items-center justify-center text-ink transition-colors duration-300 hover:bg-gold-pale hover:text-burgundy disabled:cursor-not-allowed disabled:text-ink-faint/70 disabled:hover:bg-transparent`}
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={`Decrease quantity${min > 1 ? ` (minimum ${min})` : ''}`}
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={e => {
          const parsed = parseInt(e.target.value, 10);
          onChange(isNaN(parsed) ? min : Math.max(min, parsed));
        }}
        className={`${size === 'sm' ? 'w-12 text-sm' : 'w-16 text-base'} bg-transparent text-center font-semibold tabular-nums text-ink focus:bg-ivory-light focus:outline-none`}
        aria-label={label}
      />
      <button
        type="button"
        className={`${box} inline-flex items-center justify-center text-ink transition-colors duration-300 hover:bg-gold-pale hover:text-burgundy`}
        onClick={() => onChange(value + step)}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ Content */

/** The mandatory order-request notice (exact wording from @swayari/shared). */
export const OrderDisclaimer: React.FC<{ className?: string; compact?: boolean }> = ({ className = '', compact }) => (
  <div className={`flex gap-3 rounded-2xl border border-gold/30 bg-gold-pale/40 px-4 py-3.5 ${className}`}>
    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-dark" aria-hidden />
    <p className={`${compact ? 'text-[0.8125rem]' : 'text-sm'} leading-relaxed text-ink-soft`}>{ORDER_DISCLAIMER_TEXT}</p>
  </div>
);

/** Progress towards the order-wide minimum (frames of any design count together). */
export const PriceText: React.FC<{ value: number | null | undefined; className?: string }> = ({ value, className = '' }) => (
  <span className={className}>{value === null || value === undefined ? 'Price on request' : formatPrice(value)}</span>
);

export const SampleTag: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`inline-flex items-center rounded-full border border-gold/50 bg-white/85 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold-dark backdrop-blur ${className}`}>
    Sample
  </span>
);

export const SectionHeading: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  as?: 'h1' | 'h2';
  id?: string;
  align?: 'left' | 'center';
}> = ({ eyebrow, title, intro, action, as = 'h2', id, align = 'left' }) => {
  const Heading = as;
  if (align === 'center') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <Heading id={id} className="display-title">
          {title}
        </Heading>
        <div className="ornament mt-5" aria-hidden>
          <span className="block h-1.5 w-1.5 rotate-45 bg-gold" />
        </div>
        {intro && <div className="lede mt-5">{intro}</div>}
        {action && <div className="mt-7">{action}</div>}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <Heading id={id} className="display-title">
          {title}
        </Heading>
        {intro && <div className="lede mt-4">{intro}</div>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export const Spinner: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/* ------------------------------------------------------------------ Accessibility */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Traps focus inside a dialog, closes on Escape, restores focus and locks page scroll. */
export function useDialogBehaviour(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusFirst = () => {
      // Focus an explicit target (e.g. a search field) or the dialog itself, so screen readers
      // announce it without putting a heavy focus ring on the close button.
      const target = node?.querySelector<HTMLElement>('[data-autofocus]') || node;
      target?.focus();
    };
    const t = window.setTimeout(focusFirst, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);
  return ref;
}
