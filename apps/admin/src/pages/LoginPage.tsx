import React, { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ErrorBanner, Wordmark } from '../components/ui';

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
    <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
      <div className="relative hidden flex-col justify-between bg-burgundy-deep p-12 text-ivory lg:flex">
        <Wordmark tone="light" />
        <div className="max-w-md">
          <p className="font-display text-[2.75rem] leading-[1.05]">Order requests, catalogue and customer follow-up in one place.</p>
          <p className="mt-5 text-ivory/70">Staff portal for SWAYARI — Décor &amp; Gifting. Separate from the customer website.</p>
        </div>
        <p className="text-sm text-ivory/50">© {new Date().getFullYear()} SWAYARI ENTERPRISES</p>
      </div>

      <div className="flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Wordmark />
          </div>
          <div className="mt-10 flex items-center gap-2 text-sm font-medium text-burgundy lg:mt-0">
            <Lock className="h-4 w-4" aria-hidden /> Restricted access
          </div>
          <h1 className="mt-3 font-display text-[2.25rem] font-semibold leading-tight">Staff sign-in</h1>
          <p className="mt-2 text-ink-soft">Sign in with an authorised SWAYARI Google account. Customer accounts cannot access this portal.</p>

          {authError && (
            <div className="mt-6">
              <ErrorBanner message={authError} />
            </div>
          )}

          <div className="mt-8 min-h-[44px]">
            {config.googleClientId ? (
              <>
                <div ref={buttonRef} />
                {gisState === 'loading' && <p className="text-sm text-ink-soft">Loading Google sign-in…</p>}
                {gisState === 'unavailable' && <p className="text-sm text-red-800">Google sign-in could not load. Check your connection and reload.</p>}
              </>
            ) : (
              <p className="rounded-md border border-stone-deep bg-stone px-4 py-3 text-sm text-ink-soft">
                Google sign-in is not configured for this deployment (GOOGLE_ADMIN_CLIENT_ID).
              </p>
            )}
          </div>

          {config.devLoginAvailable && (
            <div className="mt-10 border-t border-dashed border-stone-shade pt-6">
              <p className="text-[0.8125rem] text-ink-soft">Local development only — disabled in production.</p>
              <button type="button" onClick={() => devLoginAdmin()} className="adm-btn-secondary mt-3 w-full">
                Sign in as local test administrator
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
