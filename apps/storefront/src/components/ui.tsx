import React, { useEffect, useRef } from 'react';
import { Minus, Plus, Info } from 'lucide-react';
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

/** Text wordmark — crisp at every size and uses the loaded Cinzel face (an <img> SVG cannot). */
export const Wordmark: React.FC<{ tone?: 'dark' | 'light'; size?: 'sm' | 'md' | 'lg' }> = ({ tone = 'dark', size = 'md' }) => {
  const main = tone === 'dark' ? 'text-burgundy-deep' : 'text-ivory';
  const sub = tone === 'dark' ? 'text-ink-soft' : 'text-gold-light';
  const sizes = {
    sm: ['text-[1.3rem] tracking-[0.2em]', 'text-[0.56rem] tracking-[0.38em]', 'h-3 w-5'],
    md: ['text-[1.6rem] sm:text-[1.95rem] tracking-[0.2em]', 'text-[0.58rem] sm:text-[0.66rem] tracking-[0.42em]', 'h-3.5 w-6'],
    lg: ['text-[2.4rem] tracking-[0.2em]', 'text-[0.75rem] tracking-[0.45em]', 'h-4 w-7']
  }[size];
  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span className={`font-wordmark font-semibold ${sizes[0]} ${main} pl-[0.2em]`}>SWAYARI</span>
      <span className="mt-1.5 flex items-center gap-2">
        <span className={`h-px w-4 sm:w-6 ${tone === 'dark' ? 'bg-gold' : 'bg-gold-light/70'}`} />
        <span className={`font-sans font-medium uppercase ${sizes[1]} ${sub} pl-[0.4em]`}>Décor &amp; Gifting</span>
        <span className={`h-px w-4 sm:w-6 ${tone === 'dark' ? 'bg-gold' : 'bg-gold-light/70'}`} />
      </span>
    </span>
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
  onChange: (value: number) => void;
  label: string;
  size?: 'sm' | 'md';
}> = ({ value, min = 1, onChange, label, size = 'md' }) => {
  const box = size === 'sm' ? 'h-9 w-9' : 'h-12 w-12';
  return (
    <div className="inline-flex items-center border border-stone-shade bg-white" role="group" aria-label={label}>
      <button
        type="button"
        className={`${box} inline-flex items-center justify-center text-ink transition-colors hover:bg-stone disabled:cursor-not-allowed disabled:text-ink-faint/50`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease quantity${min > 1 ? ` (minimum ${min})` : ''}`}
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <span className={`${size === 'sm' ? 'w-8 text-sm' : 'w-12 text-base'} text-center font-medium tabular-nums`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={`${box} inline-flex items-center justify-center text-ink transition-colors hover:bg-stone`}
        onClick={() => onChange(value + 1)}
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
  <div className={`flex gap-3 border-l-2 border-gold bg-stone/70 px-4 py-3 ${className}`}>
    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-burgundy" aria-hidden />
    <p className={`${compact ? 'text-[0.8125rem]' : 'text-sm'} leading-relaxed text-ink-soft`}>{ORDER_DISCLAIMER_TEXT}</p>
  </div>
);

export const PriceText: React.FC<{ value: number | null | undefined; className?: string }> = ({ value, className = '' }) => (
  <span className={className}>{value === null || value === undefined ? 'Price on request' : formatPrice(value)}</span>
);

export const SampleTag: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`inline-flex items-center border border-gold/60 px-1.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-gold-dark ${className}`}>
    Sample
  </span>
);

export const SectionHeading: React.FC<{
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  as?: 'h1' | 'h2';
  id?: string;
}> = ({ eyebrow, title, intro, action, as = 'h2', id }) => {
  const Heading = as;
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <Heading id={id} className="text-display-sm md:text-display-md">
          {title}
        </Heading>
        {intro && <div className="mt-3 text-base text-ink-soft md:text-lg">{intro}</div>}
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
