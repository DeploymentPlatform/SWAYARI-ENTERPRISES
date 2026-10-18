import React, { useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { getStatusMeta } from '@swayari/shared';

export const Wordmark: React.FC<{ tone?: 'dark' | 'light'; caption?: string }> = ({ tone = 'dark', caption = 'Staff portal' }) => (
  <span className="inline-flex flex-col leading-none">
    <span className={`font-wordmark text-[1.35rem] font-semibold tracking-[0.2em] ${tone === 'dark' ? 'text-burgundy-deep' : 'text-ivory'}`}>SWAYARI</span>
    <span className={`mt-1.5 text-[0.625rem] font-medium uppercase tracking-[0.3em] ${tone === 'dark' ? 'text-ink-soft' : 'text-gold-light'}`}>{caption}</span>
  </span>
);

const STATUS_TONE: Record<string, string> = {
  new_request: 'bg-sky-50 text-sky-900 ring-sky-200',
  contacted: 'bg-amber-50 text-amber-900 ring-amber-200',
  quoted: 'bg-violet-50 text-violet-900 ring-violet-200',
  confirmed: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  dispatched: 'bg-teal-50 text-teal-900 ring-teal-200',
  completed: 'bg-stone text-ink ring-stone-shade',
  cancelled: 'bg-red-50 text-red-900 ring-red-200',
  published: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  draft: 'bg-amber-50 text-amber-900 ring-amber-200',
  archived: 'bg-stone text-ink-soft ring-stone-shade'
};

export const StatusBadge: React.FC<{ status: string; label?: string }> = ({ status, label }) => (
  <span className={`inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 text-[0.75rem] font-medium ring-1 ring-inset ${STATUS_TONE[status] || 'bg-stone text-ink ring-stone-shade'}`}>
    {label || (['published', 'draft', 'archived'].includes(status) ? status.charAt(0).toUpperCase() + status.slice(1) : getStatusMeta(status).label)}
  </span>
);

export const Thumb: React.FC<{ src?: string | null; alt?: string; size?: 'sm' | 'md' }> = ({ src, alt = '', size = 'sm' }) => (
  <span className={`block flex-shrink-0 overflow-hidden rounded bg-stone ${size === 'sm' ? 'h-12 w-10' : 'h-16 w-[52px]'}`}>
    {src ? <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" /> : null}
  </span>
);

export const ErrorBanner: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div role="alert" className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">
        Retry
      </button>
    )}
  </div>
);

export const PageHeader: React.FC<{ title: string; description?: string; actions?: React.ReactNode }> = ({ title, description, actions }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="adm-page-title">{title}</h1>
      {description && <p className="mt-1 text-ink-soft">{description}</p>}
    </div>
    {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

/** Right-hand drawer with focus trap, Escape to close and scroll lock. */
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
  useEffect(() => {
    const previously = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !ref.current) return;
      const els = Array.from(
        ref.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
      ).filter(el => el.offsetParent !== null);
      if (!els.length) return;
      if (e.shiftKey && document.activeElement === els[0]) {
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

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-umber/40" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={`absolute inset-y-0 right-0 flex w-full ${width} flex-col bg-[#FAF8F5] shadow-drawer outline-none`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-deep bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="text-lg font-semibold">{title}</div>
            {subtitle && <div className="mt-0.5 text-sm text-ink-soft">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            <button type="button" onClick={onClose} className="adm-btn-quiet h-9 w-9 px-0" aria-label="Close">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="border-t border-stone-deep bg-white px-5 py-3 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
};
