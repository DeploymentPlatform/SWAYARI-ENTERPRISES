import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { NotFoundPage } from './NotFoundPage';
import { Ornament } from '../components/States';
import { LotusMark, Spinner } from '../components/ui';

/**
 * Local development sign-in (separate from the customer header).
 * Only rendered when the server reports ENVIRONMENT=development; the API itself refuses the
 * request everywhere else, so this page cannot work in production.
 */
export const DevLoginPage: React.FC = () => {
  const { config, devLoginCustomer, user } = useAuth();
  const { search, navigate } = useRouter();
  const [state, setState] = useState<'idle' | 'busy' | 'failed'>('idle');
  usePageMeta('Local sign-in', undefined, { noindex: true });

  if (!config.devLoginAvailable) return <NotFoundPage />;
  const back = search.get('return') || '/';
  const safeBack = back.startsWith('/') && !back.startsWith('//') ? back : '/';

  return (
    <div className="container-content flex justify-center py-16 md:py-24">
      <div className="card-luxe w-full max-w-lg p-7 text-center sm:p-10">
        <LotusMark className="mx-auto h-6 w-10 text-gold" />
        <p className="eyebrow mt-6">Local development only</p>
        <h1 className="mt-3 font-display text-[2.2rem] font-medium leading-tight sm:text-display-sm">
          Test customer <em className="text-burgundy">sign-in</em>
        </h1>
        <Ornament className="mt-5" />
        <p className="mx-auto mt-5 max-w-sm text-ink-soft">
          Signs in as a local preview customer so order flows can be tested without Google. Unavailable in production.
        </p>
        {user ? (
          <p className="mt-7 rounded-2xl border border-gold/30 bg-gold-pale/40 px-4 py-3 text-sm text-ink">Signed in as {user.email}.</p>
        ) : (
          <button
            type="button"
            className="btn-primary mt-8 w-full sm:w-auto"
            disabled={state === 'busy'}
            aria-busy={state === 'busy'}
            onClick={async () => {
              setState('busy');
              const ok = await devLoginCustomer();
              if (ok) navigate(safeBack, { replace: true });
              else setState('failed');
            }}
          >
            {state === 'busy' && <Spinner />}
            Sign in as preview customer
          </button>
        )}
        {state === 'failed' && (
          <p className="field-error" role="alert">
            The local sign-in endpoint refused the request.
          </p>
        )}
      </div>
    </div>
  );
};
