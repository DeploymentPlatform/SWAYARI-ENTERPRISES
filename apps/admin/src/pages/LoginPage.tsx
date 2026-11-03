import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ErrorBanner, Ornament, Wordmark } from '../components/ui';
import { EASE_LUXURY } from '../components/motion';

export const LoginPage: React.FC = () => {
  const { handleGoogleCallback, authError, config, devLoginAdmin } = useAdminAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [gisState, setGisState] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');

  // Wait for the async Google Identity Services script, then render Google's button with the
  // admin portal's own OAuth client (separate from the storefront client).
  useEffect(() => {
    if (!config.googleClientId) return;
    let cancelled = false;
    let tries = 0;
    setGisState('loading');
    const attempt = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: (response: { credential?: string }) => response.credential && handleGoogleCallback(response.credential),
          auto_select: false,
          ux_mode: 'popup'
        });
        buttonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', text: 'signin_with', width: 320 });
        setGisState('ready');
        return;
      }
      if (++tries > 50) return setGisState('unavailable');
      window.setTimeout(attempt, 100);
    };
    attempt();
    return () => {
      cancelled = true;
    };
  }, [config.googleClientId]);

  return (
    <div className="grid min-h-screen bg-ivory lg:grid-cols-[minmax(0,1.1fr)_minmax(480px,560px)]">
      {/* Brand panel — full height on desktop, a compact band on phones and tablets */}
      <div className="relative isolate flex flex-col justify-between overflow-hidden bg-gradient-to-br from-burgundy-deep via-burgundy-deep to-umber px-6 pb-16 pt-10 text-ivory sm:px-10 lg:min-h-screen lg:p-14">
        <LoginBackdrop />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE_LUXURY }}>
          <Wordmark tone="light" size="lg" />
        </motion.div>

        <motion.div
          className="mt-10 max-w-lg lg:mt-0"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE_LUXURY, delay: 0.15 }}
        >
          <Ornament className="mb-6 hidden text-gold-light lg:flex [&::before]:w-0" />
          <p className="font-display text-[2rem] font-medium leading-[1.05] text-ivory-light sm:text-[2.5rem] lg:text-[3.25rem]">
            Order requests, catalogue and customer follow-up, <em className="text-gold-light">in one place.</em>
          </p>
          <p className="mt-5 hidden max-w-md text-[0.95rem] leading-relaxed text-ivory/65 sm:block">
            Staff portal for SWAYARI — Décor &amp; Gifting. Separate from the customer website.
          </p>
        </motion.div>

        <p className="hidden text-[0.75rem] uppercase tracking-[0.24em] text-ivory/40 lg:block">© {new Date().getFullYear()} SWAYARI ENTERPRISES</p>
      </div>

      {/* Sign-in */}
      <div className="relative flex items-start justify-center px-4 pb-16 sm:px-6 lg:items-center lg:py-16">
        <motion.div
          className="adm-card relative -mt-8 w-full max-w-[440px] p-7 sm:p-10 lg:mt-0 lg:border-transparent lg:bg-transparent lg:shadow-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_LUXURY, delay: 0.25 }}
        >
          <span className="adm-badge-gold">
            <Lock className="h-3 w-3" aria-hidden /> Restricted access
          </span>
          <h1 className="mt-5 font-display text-[2.4rem] font-semibold leading-[1.02] text-ink sm:text-[2.75rem]">Staff sign-in</h1>
          <p className="mt-3 leading-relaxed text-ink-soft">Sign in with an authorised SWAYARI Google account. Customer accounts cannot access this portal.</p>

          {authError && (
            <div className="mt-6">
              <ErrorBanner message={authError} />
            </div>
          )}

          <div className="mt-8 min-h-[44px]">
            {config.googleClientId ? (
              <>
                <div ref={buttonRef} className="flex justify-center lg:justify-start" />
                {gisState === 'loading' && (
                  <div className="space-y-2">
                    <span className="adm-skeleton block h-11 w-full max-w-[320px] rounded-full" aria-hidden />
                    <p className="text-sm text-ink-soft">Loading Google sign-in…</p>
                  </div>
                )}
                {gisState === 'unavailable' && <p className="text-sm text-red-800">Google sign-in could not load. Check your connection and reload.</p>}
              </>
            ) : (
              <p className="adm-panel-muted px-4 py-3 text-sm leading-relaxed text-ink-soft">
                Google sign-in is not configured for this deployment (GOOGLE_ADMIN_CLIENT_ID).
              </p>
            )}
          </div>

          {config.devLoginAvailable && (
            <div className="mt-10">
              <div className="flex items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                <span className="h-px flex-1 bg-stone-deep" />
                Development
                <span className="h-px flex-1 bg-stone-deep" />
              </div>
              <p className="mt-4 text-[0.8125rem] text-ink-soft">Local development only — disabled in production.</p>
              <button type="button" onClick={() => devLoginAdmin()} className="adm-btn-secondary mt-3 w-full">
                Sign in as local test administrator
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

/** Slow-turning mandala, gold glow and fine lattice behind the brand panel. */
const LoginBackdrop: React.FC = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
    <motion.span
      className="absolute -right-24 top-1/3 h-[420px] w-[420px] rounded-full bg-gold/20 blur-[90px] lg:h-[560px] lg:w-[560px]"
      animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.06, 1] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    />
    <span className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-burgundy-accent/50 blur-[80px]" />
    <span
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 34 34'%3E%3Cpath d='M17 2 32 17 17 32 2 17Z' fill='none' stroke='%23E3CC9A' stroke-width='0.6'/%3E%3Ccircle cx='17' cy='17' r='1.2' fill='%23E3CC9A'/%3E%3C/svg%3E\")"
      }}
    />
    <svg
      viewBox="0 0 200 200"
      className="absolute -bottom-40 -right-40 h-[520px] w-[520px] animate-spin-slow text-gold-light opacity-[0.14] lg:-bottom-48 lg:-right-48 lg:h-[680px] lg:w-[680px]"
      style={{ animationDuration: '120s' }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="0.4">
        <circle cx="100" cy="100" r="96" />
        <circle cx="100" cy="100" r="80" />
        <circle cx="100" cy="100" r="44" />
        <circle cx="100" cy="100" r="20" />
        {Array.from({ length: 16 }).map((_, i) => (
          <ellipse key={i} cx="100" cy="58" rx="12" ry="34" transform={`rotate(${i * 22.5} 100 100)`} />
        ))}
        {Array.from({ length: 32 }).map((_, i) => (
          <line key={`l${i}`} x1="100" y1="4" x2="100" y2="20" transform={`rotate(${i * 11.25} 100 100)`} />
        ))}
      </g>
    </svg>
    <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-px lg:bg-gradient-to-b" />
  </div>
);
