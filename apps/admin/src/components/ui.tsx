import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';
import { getStatusMeta } from '@swayari/shared';
import { EASE_LUXURY } from './motion';

/* ── Brand ─────────────────────────────────────────────────────────────── */

export const Wordmark: React.FC<{ tone?: 'dark' | 'light'; caption?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  tone = 'dark',
  caption = 'Staff portal',
  size = 'md'
}) => {
  // The real SWAYARI logo artwork: gold on dark surfaces, deeper gold on light ones.
  const src = tone === 'dark' ? '/assets/brand/swayari-logo-light.webp' : '/assets/brand/swayari-logo-gold.webp';
  const height = size === 'lg' ? 'h-20' : size === 'sm' ? 'h-9' : 'h-12';
  return (
    <span className="inline-flex flex-col items-center leading-none">
      <img src={src} alt="SWAYARI — Décor & Gifting" width={825} height={304} className={`${height} w-auto select-none`} draggable={false} />
      {caption && (
        <span className={`mt-1.5 flex items-center gap-2 text-[0.5625rem] font-semibold uppercase tracking-[0.32em] ${tone === 'dark' ? 'text-gold-dark' : 'text-gold-light'}`}>
          <span aria-hidden className="h-px w-3 bg-current opacity-70" />
          {caption}
          <span aria-hidden className="h-px w-3 bg-current opacity-70" />
        </span>
      )}
    </span>
  );
};

/** Small gold diamond flanked by hairlines. */
export const Ornament: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span aria-hidden className={`adm-ornament ${className}`}>
    <svg width="10" height="10" viewBox="0 0 10 10" className="flex-shrink-0">
      <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
    </svg>
  </span>
);

/* ── Status ────────────────────────────────────────────────────────────── */

const STATUS_TONE: Record<string, { chip: string; dot: string }> = {
  new_request: { chip: 'bg-burgundy-soft text-burgundy ring-burgundy/15', dot: 'bg-burgundy-accent' },
  contacted: { chip: 'bg-gold-pale/80 text-gold-dark ring-gold/30', dot: 'bg-gold' },
  quoted: { chip: 'bg-violet-50 text-violet-900 ring-violet-200/80', dot: 'bg-violet-500' },
  confirmed: { chip: 'bg-emerald-50 text-emerald-900 ring-emerald-200/80', dot: 'bg-emerald-600' },
  dispatched: { chip: 'bg-teal-50 text-teal-900 ring-teal-200/80', dot: 'bg-teal-600' },
  completed: { chip: 'bg-stone text-ink-soft ring-stone-shade/70', dot: 'bg-ink-faint' },
  cancelled: { chip: 'bg-red-50 text-red-900 ring-red-200/80', dot: 'bg-red-700' },
  published: { chip: 'bg-emerald-50 text-emerald-900 ring-emerald-200/80', dot: 'bg-emerald-600' },
  draft: { chip: 'bg-gold-pale/80 text-gold-dark ring-gold/30', dot: 'bg-gold' },
  archived: { chip: 'bg-stone text-ink-soft ring-stone-shade/70', dot: 'bg-ink-faint' }
};
const FALLBACK_TONE = { chip: 'bg-stone text-ink ring-stone-shade/70', dot: 'bg-ink-faint' };

export const StatusBadge: React.FC<{ status: string; label?: string }> = ({ status, label }) => {
  const tone = STATUS_TONE[status] || FALLBACK_TONE;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.75rem] font-semibold leading-none ring-1 ring-inset ${tone.chip}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {label || (['published', 'draft', 'archived'].includes(status) ? status.charAt(0).toUpperCase() + status.slice(1) : getStatusMeta(status).label)}
    </span>
  );
};

export const Thumb: React.FC<{ src?: string | null; alt?: string; size?: 'sm' | 'md' | 'lg' }> = ({ src, alt = '', size = 'sm' }) => (
  <span
    className={`block flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-b from-stone to-stone-deep/70 ring-1 ring-inset ring-stone-deep ${
      size === 'sm' ? 'h-12 w-10' : size === 'md' ? 'h-16 w-[52px]' : 'h-20 w-16'
    }`}
  >
    {src ? <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" /> : null}
  </span>
);

/* ── Feedback ──────────────────────────────────────────────────────────── */

export const ErrorBanner: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200/90 bg-red-50/80 px-4 py-3 text-sm text-red-900 shadow-subtle">
    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-700" aria-hidden />
    <span className="flex-1 leading-relaxed">{message}</span>
    {onRetry && (
      <button type="button" onClick={onRetry} className="-my-1 inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-2 font-semibold text-red-900 underline-offset-2 hover:underline">
        <RotateCw className="h-3.5 w-3.5" aria-hidden /> Retry
      </button>
    )}
  </div>
);

/** Inline confirmation (polite live region). */
export const Notice: React.FC<{ children: React.ReactNode; tone?: 'success' | 'warning' }> = ({ children, tone = 'success' }) => {
  const Icon = tone === 'warning' ? AlertCircle : CheckCircle2;
  return (
    <motion.p
      role="status"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_LUXURY }}
      className={`adm-toast ${tone === 'warning' ? 'border-red-200/90' : ''}`}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${tone === 'warning' ? 'text-red-700' : 'text-emerald-700'}`} aria-hidden />
      <span>{children}</span>
    </motion.p>
  );
};

export const EmptyState: React.FC<{ icon: React.ElementType; title: string; children?: React.ReactNode; action?: React.ReactNode }> = ({
  icon: Icon,
  title,
  children,
  action
}) => (
  <div className="px-6 py-14 text-center sm:py-16">
    <span className="adm-empty-icon">
      <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
    </span>
    <p className="mt-6 font-display text-[1.5rem] font-semibold leading-tight text-ink">{title}</p>
    {children && <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">{children}</p>}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

/** Shimmering placeholder rows while a list loads. */
export const SkeletonRows: React.FC<{ rows?: number; thumb?: boolean; label?: string }> = ({ rows = 5, thumb = true, label = 'Loading…' }) => (
  <div role="status" aria-live="polite" className="divide-y divide-stone-deep/60">
    <span className="sr-only">{label}</span>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4 sm:px-6" aria-hidden style={{ opacity: 1 - i * 0.12 }}>
        {thumb && <span className="adm-skeleton h-12 w-10 flex-shrink-0" />}
        <span className="flex-1 space-y-2">
          <span className="adm-skeleton block h-3 w-2/5" />
          <span className="adm-skeleton block h-3 w-1/4" />
        </span>
        <span className="adm-skeleton hidden h-6 w-20 rounded-full sm:block" />
      </div>
    ))}
  </div>
);

/* ── Page chrome ───────────────────────────────────────────────────────── */

export const PageHeader: React.FC<{ title: string; description?: string; actions?: React.ReactNode; eyebrow?: string }> = ({
  title,
  description,
  actions,
  eyebrow
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: EASE_LUXURY }}
    className="flex flex-col gap-5 border-b border-stone-deep/70 pb-6 sm:flex-row sm:items-end sm:justify-between"
  >
    <div className="min-w-0">
      {eyebrow && <p className="adm-eyebrow mb-3">{eyebrow}</p>}
      <h1 className="adm-page-title">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">{description}</p>}
    </div>
    {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </motion.div>
);

/* ── Dialog behaviour ──────────────────────────────────────────────────── */

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Focus trap, Escape to close, body scroll lock and focus restore for an open dialog. */
export function useDialogBehaviour(ref: React.RefObject<HTMLElement>, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previously = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key !== 'Tab' || !ref.current) return;
      const els = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null);
      if (!els.length) return;
      if (e.shiftKey && (document.activeElement === els[0] || document.activeElement === ref.current)) {
        e.preventDefault();
        els[els.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === els[els.length - 1]) {
        e.preventDefault();
        els[0].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previously?.focus?.();
    };
  }, []);
}

/**
 * Dialog panel with focus trap, Escape to close and scroll lock. Centred with a scale + fade on tablet and
 * desktop, a full-height sheet on phones. Wrap the conditional render in <AnimatePresence> for the exit.
 */
export const Drawer: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  width?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, onClose, width = 'max-w-3xl', headerActions, footer, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useDialogBehaviour(ref, onClose);

  // Portalled to <body> so the page-transition transform never becomes the containing block.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        className="absolute inset-0 bg-umber/45 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.45, ease: EASE_LUXURY }}
        className={`relative flex h-[calc(100dvh-0.75rem)] w-full ${width} flex-col overflow-hidden rounded-t-card bg-ivory shadow-dialog outline-none sm:h-auto sm:max-h-[min(92vh,64rem)] sm:min-h-[min(60vh,30rem)] sm:rounded-card`}
      >
        <div aria-hidden className="h-[3px] flex-shrink-0 bg-gradient-to-r from-burgundy-deep via-gold to-burgundy-deep opacity-90" />
        <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-stone-deep/80 bg-white/90 px-5 py-4 backdrop-blur sm:px-7 sm:py-5">
          <div className="min-w-0">
            <div className="truncate font-display text-[1.5rem] font-semibold leading-tight text-ink sm:text-[1.75rem]">{title}</div>
            {subtitle && <div className="mt-1 text-[0.8125rem] leading-relaxed text-ink-soft">{subtitle}</div>}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {headerActions}
            <button type="button" onClick={onClose} className="adm-icon-btn border border-stone-deep bg-white" aria-label="Close">
              <X className="h-[18px] w-[18px]" aria-hidden />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">{children}</div>
        {footer && <div className="pb-safe flex-shrink-0 border-t border-stone-deep/80 bg-white/95 px-5 pt-3 backdrop-blur sm:px-7 sm:pb-3">{footer}</div>}
      </motion.div>
    </div>,
    document.body
  );
};
