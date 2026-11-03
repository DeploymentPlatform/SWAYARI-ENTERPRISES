import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../lib/router';
import { LotusMark, useDialogBehaviour } from './ui';
import { EASE_LUXURY } from './motion';

const COPY = {
  add: { title: 'Sign in to add to your bag', body: 'We save your bag and requests to your account so our team can follow up with you. Your item will be added as soon as you are signed in.' },
  checkout: { title: 'Sign in to send your request', body: 'We use your verified Google email to keep track of your request and its updates.' },
  orders: { title: 'Sign in to see your requests', body: 'View the requests you have sent and any updates from our team.' },
  account: { title: 'Sign in to SWAYARI', body: 'Keep your bag and order requests together in one place.' }
};

/** Waits for the async Google Identity Services script, then renders Google's own button. */
function useGoogleButton(clientId: string | null, open: boolean, onCredential: (credential: string) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');

  useEffect(() => {
    if (!open || !clientId) return;
    let cancelled = false;
    let tries = 0;
    setState('loading');
    const attempt = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id && ref.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential?: string }) => response.credential && onCredential(response.credential),
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup'
        });
        ref.current.innerHTML = '';
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          width: Math.min(340, ref.current.clientWidth || 340)
        });
        setState('ready');
        return;
      }
      if (++tries > 50) {
        setState('unavailable');
        return;
      }
      window.setTimeout(attempt, 100);
    };
    attempt();
    return () => {
      cancelled = true;
    };
  }, [open, clientId]);

  return { ref, state };
}

export const SignInDialog: React.FC = () => {
  const { signInRequest, closeSignIn, hideSignIn, handleGoogleCallback, signInError, config } = useAuth();
  const { navigate } = useRouter();
  const open = Boolean(signInRequest);
  const ref = useDialogBehaviour(open, closeSignIn);
  const { ref: buttonRef, state } = useGoogleButton(config.googleClientId, open, credential => {
    handleGoogleCallback(credential);
  });
  const copy = COPY[signInRequest?.reason || 'account'];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-umber/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={closeSignIn}
            aria-hidden
          />
          <motion.div
            ref={ref}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="signin-title"
            aria-describedby="signin-body"
            className="pb-safe relative w-full max-w-[460px] overflow-hidden rounded-t-[28px] border border-white/60 bg-ivory-light px-6 pt-10 text-center shadow-dialog outline-none sm:rounded-[24px] sm:px-10 sm:pb-9"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: EASE_LUXURY }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-gold-pale/70 to-transparent" />
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-light via-gold to-gold-light" />
            <button
              type="button"
              onClick={closeSignIn}
              className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-300 hover:bg-stone hover:text-burgundy"
              aria-label="Close sign-in"
            >
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </button>
            <div className="relative pb-6 sm:pb-0">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-white/80 shadow-gold">
                <LotusMark className="h-6 w-10 text-gold-dark" />
              </span>
              <h2 id="signin-title" className="mt-5 font-display text-[2rem] font-medium leading-[1.1]">
                {copy.title}
              </h2>
              <div className="ornament mt-4" aria-hidden>
                <span className="block h-1.5 w-1.5 rotate-45 bg-gold" />
              </div>
              <p id="signin-body" className="mx-auto mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-ink-soft">
                {copy.body}
              </p>
              {signInRequest?.pendingItem && (
                <p className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-2 rounded-full border border-stone-deep bg-white/80 px-4 py-2.5 text-sm">
                  <ShoppingBag className="h-4 w-4 flex-shrink-0 text-gold-dark" aria-hidden />
                  <span className="truncate">
                    Adding: <span className="font-medium">{signInRequest.pendingItem.name}</span>
                  </span>
                </p>
              )}

              {config.googleClientId ? (
                <div className="mt-7 flex min-h-[44px] justify-center">
                  <div ref={buttonRef} className="w-full max-w-[340px] [&>div]:mx-auto" />
                  {state === 'loading' && <p className="text-sm text-ink-soft">Loading Google sign-in…</p>}
                </div>
              ) : null}

              {(state === 'unavailable' || !config.googleClientId) && (
                <p className="mx-auto mt-6 max-w-sm rounded-2xl border border-stone-deep bg-white/70 px-4 py-3 text-sm text-ink-soft" role="status">
                  Google sign-in is not available right now. Please try again shortly, or email{' '}
                  <a className="link-underline" href="mailto:swayarienterprises@gmail.com">
                    swayarienterprises@gmail.com
                  </a>
                  .
                </p>
              )}

              {signInError && (
                <p className="mt-4 rounded-2xl border border-red-800/15 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                  {signInError}
                </p>
              )}

              <p className="mt-6 text-[0.8125rem] text-ink-faint">We only use your name and verified email address for your requests.</p>

              {config.devLoginAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    const back = window.location.pathname + window.location.search;
                    // Keep the pending item: the dev page resumes it exactly like Google sign-in would.
                    hideSignIn();
                    navigate(`/dev-login?return=${encodeURIComponent(back)}`);
                  }}
                  className="mt-2 min-h-[44px] text-[0.8125rem] text-ink-faint underline underline-offset-4 transition-colors hover:text-burgundy"
                >
                  Local development sign-in
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
