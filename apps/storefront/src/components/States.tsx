import React from 'react';
import { Link } from '../lib/router';

export const CollectionSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Loading the collection">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i}>
        <div className="skeleton aspect-product" />
        <div className="skeleton mt-4 h-5 w-3/4" />
        <div className="skeleton mt-2 h-4 w-1/3" />
      </div>
    ))}
  </div>
);

export const LoadError: React.FC<{ onRetry?: () => void; message?: string }> = ({ onRetry, message }) => (
  <div role="alert" className="border-y border-stone-deep py-10 text-center">
    <p className="font-display text-2xl">We couldn’t load this just now.</p>
    <p className="mt-2 text-ink-soft">{message || 'Please check your connection and try again.'}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn-secondary mt-6">
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
}> = ({ title, body, action, secondary }) => (
  <div className="mx-auto max-w-xl py-16 text-center md:py-24">
    <p className="font-display text-[2rem] leading-tight">{title}</p>
    {body && <div className="mt-3 text-ink-soft">{body}</div>}
    {(action || secondary) && (
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {action && (
          <Link to={action.to} className="btn-primary">
            {action.label}
          </Link>
        )}
        {secondary}
      </div>
    )}
  </div>
);

/** Compact page header used by utility pages (cart, account, policies). */
export const PageIntro: React.FC<{ eyebrow?: string; title: string; children?: React.ReactNode }> = ({ eyebrow, title, children }) => (
  <header className="border-b border-stone-deep pb-8 pt-10 md:pb-10 md:pt-14">
    {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
    <h1 className="text-display-sm md:text-display-lg">{title}</h1>
    {children && <div className="mt-3 max-w-2xl text-base text-ink-soft md:text-lg">{children}</div>}
  </header>
);
