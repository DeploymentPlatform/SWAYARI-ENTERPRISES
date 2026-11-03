import React from 'react';
import { motion } from 'framer-motion';
import { Check, RefreshCw } from 'lucide-react';
import { Link } from '../lib/router';
import { EASE_LUXURY } from './motion';
import { LotusMark } from './ui';

/** Gold line — diamond — line divider. */
export const Ornament: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`ornament ${className}`} aria-hidden>
    <span className="block h-1.5 w-1.5 rotate-45 bg-gold" />
  </div>
);

export const CollectionSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div
    className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-12"
    aria-busy="true"
    aria-label="Loading the collection"
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-card border border-stone-deep/70 bg-white/70 p-2.5 sm:p-3">
        <div className="skeleton aspect-square rounded-[14px]" />
        <div className="skeleton mt-4 h-3 w-1/3" />
        <div className="skeleton mt-2.5 h-4 w-4/5" />
        <div className="skeleton mt-4 h-5 w-1/2" />
        <div className="skeleton mt-4 h-10 w-full rounded-full" />
      </div>
    ))}
  </div>
);

export const LoadError: React.FC<{ onRetry?: () => void; message?: string }> = ({ onRetry, message }) => (
  <div role="alert" className="card-luxe mx-auto max-w-xl px-6 py-12 text-center sm:px-10">
    <LotusMark className="mx-auto h-6 w-10 text-gold" />
    <p className="mt-5 font-display text-[1.9rem] leading-tight text-ink">We couldn’t load this just now.</p>
    <Ornament className="mt-4" />
    <p className="mx-auto mt-4 max-w-sm text-ink-soft">{message || 'Please check your connection and try again.'}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn-secondary mt-7">
        <RefreshCw className="h-4 w-4" aria-hidden />
        Try again
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  body?: React.ReactNode;
  action?: { to: string; label: string };
  secondary?: React.ReactNode;
  eyebrow?: string;
  /** Optional artwork shown above the title (defaults to the lotus mark). */
  art?: React.ReactNode;
}> = ({ title, body, action, secondary, eyebrow, art }) => (
  <motion.div
    className="mx-auto max-w-xl py-16 text-center sm:py-20 md:py-28"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: EASE_LUXURY }}
  >
    {art ?? (
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-b from-gold-pale/80 to-ivory-light shadow-gold">
        <LotusMark className="h-7 w-11 text-gold-dark" />
      </div>
    )}
    {eyebrow && <p className="eyebrow mt-8">{eyebrow}</p>}
    <p className={`${eyebrow ? 'mt-3' : 'mt-8'} font-display text-[2rem] font-medium leading-[1.08] text-ink sm:text-[2.5rem]`}>{title}</p>
    <Ornament className="mt-5" />
    {body && <div className="lede mx-auto mt-5 max-w-md">{body}</div>}
    {(action || secondary) && (
      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {action && (
          <Link to={action.to} className="btn-primary">
            {action.label}
          </Link>
        )}
        {secondary}
      </div>
    )}
  </motion.div>
);

/** Page header used by utility pages (cart, account, policies). */
export const PageIntro: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  align?: 'left' | 'center';
  /** Extra content under the intro (e.g. a step indicator). */
  after?: React.ReactNode;
}> = ({ eyebrow, title, children, align = 'left', after }) => {
  const centered = align === 'center';
  return (
    <motion.header
      className={`pb-8 pt-10 md:pb-12 md:pt-16 ${centered ? 'text-center' : 'border-b border-stone-deep/80'}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_LUXURY }}
    >
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h1 className="display-title">{title}</h1>
      {centered && <Ornament className="mt-6" />}
      {children && <div className={`lede mt-4 max-w-2xl ${centered ? 'mx-auto mt-6' : ''}`}>{children}</div>}
      {after && <div className={centered ? 'mt-8 flex justify-center' : 'mt-8'}>{after}</div>}
    </motion.header>
  );
};

const REQUEST_STEPS = ['Your cart', 'Request details', 'Request sent'];

/** Three-step indicator for the request journey: cart → details → sent. `current` is 1-based. */
export const RequestSteps: React.FC<{ current: 1 | 2 | 3; complete?: boolean; className?: string }> = ({
  current,
  complete,
  className = ''
}) => (
  <nav aria-label="Request progress" className={`w-full max-w-md ${className}`}>
    <ol className="flex w-full items-center">
      {REQUEST_STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current || (complete && step === current);
        const active = step === current && !complete;
        return (
          <li key={label} className={`flex items-center ${i < REQUEST_STEPS.length - 1 ? 'flex-1' : ''}`} aria-current={active ? 'step' : undefined}>
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-[0.8125rem] font-semibold transition-all duration-500 ease-luxury ${
                  done
                    ? 'border-gold bg-gradient-to-b from-gold-light to-gold text-burgundy-deep shadow-gold'
                    : active
                      ? 'border-burgundy bg-burgundy text-ivory-light shadow-[0_8px_18px_-10px_rgba(94,26,40,0.8)]'
                      : 'border-stone-deep bg-white/80 text-ink-faint'
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden /> : step}
              </span>
              <span
                className={`whitespace-nowrap text-[0.625rem] font-semibold uppercase tracking-[0.1em] sm:text-[0.6875rem] sm:tracking-[0.12em] ${
                  active ? 'text-burgundy' : done ? 'text-gold-dark' : 'text-ink-faint'
                }`}
              >
                {label}
                <span className="sr-only">{done ? ' (done)' : active ? ' (current step)' : ''}</span>
              </span>
            </div>
            {i < REQUEST_STEPS.length - 1 && (
              <span aria-hidden className="relative mx-2 mb-6 h-px flex-1 bg-stone-deep sm:mx-3">
                <span
                  className={`absolute inset-y-0 left-0 bg-gold transition-[width] duration-700 ease-luxury ${
                    step < current || (complete && step + 1 === current) ? 'w-full' : 'w-0'
                  }`}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

/** Numbered, editorial reading layout used by the policy pages. */
export const EditorialSections: React.FC<{ sections: { title: string; body: string }[]; idPrefix: string }> = ({ sections, idPrefix }) => (
  <div className="mt-10 md:mt-14">
    {sections.map((s, i) => (
      <motion.section
        key={s.title}
        aria-labelledby={`${idPrefix}-${i}`}
        className="grid gap-3 border-t border-stone-deep/80 py-8 first:border-t-0 first:pt-0 sm:grid-cols-[4.5rem_1fr] sm:gap-6 md:py-10"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -60px 0px' }}
        transition={{ duration: 0.4, ease: EASE_LUXURY }}
      >
        <span aria-hidden className="font-display text-[2.4rem] font-medium italic leading-none text-gold">
          {String(i + 1).padStart(2, '0')}
        </span>
        <div>
          <h2 id={`${idPrefix}-${i}`} className="font-display text-[1.75rem] font-medium leading-tight sm:text-[2rem]">
            {s.title}
          </h2>
          <p className="mt-3 max-w-prose text-[1.0625rem] leading-[1.8] text-ink-soft">{s.body}</p>
        </div>
      </motion.section>
    ))}
  </div>
);
