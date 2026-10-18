import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../lib/router';
import { LotusMark, useDialogBehaviour } from './ui';

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
          <motion.div className="absolute inset-0 bg-umber/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeSignIn} aria-hidden />
          <motion.div
            ref={ref}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="signin-title"
            aria-describedby="signin-body"
            className="outline-none relative w-full max-w-[460px] bg-ivory px-6 pb-8 pt-10 text-center shadow-dialog sm:px-10"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button type="button" onClick={closeSignIn} className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center" aria-label="Close sign-in">
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </button>
            <LotusMark className="mx-auto h-6 w-10 text-gold" />
            <h2 id="signin-title" className="mt-4 text-[2rem] leading-tight">
              {copy.title}
            </h2>
            <p id="signin-body" className="mx-auto mt-3 max-w-sm text-ink-soft">
              {copy.body}
            </p>
            {signInRequest?.pendingItem && (
              <p className="mt-4 border-y border-stone-deep py-3 text-sm">
                Adding: <span className="font-medium">{signInRequest.pendingItem.name}</span>
              </p>
            )}

            <div className="mt-7 flex min-h-[44px] justify-center">
              {config.googleClientId ? (
                <>
                  <div ref={buttonRef} className="w-full max-w-[340px] [&>div]:mx-auto" />
                  {state === 'loading' && <p className="text-sm text-ink-soft">Loading Google sign-in…</p>}
                </>
              ) : null}
            </div>

            {(state === 'unavailable' || !config.googleClientId) && (
              <p className="mt-2 text-sm text-ink-soft" role="status">
                Google sign-in is not available right now. Please try again shortly, or email{' '}
                <a className="link-underline" href="mailto:swayarienterprises@gmail.com">
                  swayarienterprises@gmail.com
                </a>
                .
              </p>
            )}

            {signInError && (
              <p className="mt-4 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
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
                className="mt-4 text-[0.8125rem] text-ink-faint underline underline-offset-4"
              >
                Local development sign-in
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
