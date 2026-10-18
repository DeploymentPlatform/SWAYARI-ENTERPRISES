import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { NotFoundPage } from './NotFoundPage';

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
    <div className="container-content max-w-lg py-20">
      <p className="eyebrow">Local development only</p>
      <h1 className="mt-3 text-display-sm">Test customer sign-in</h1>
      <p className="mt-3 text-ink-soft">
        Signs in as a local preview customer so order flows can be tested without Google. Unavailable in production.
      </p>
      {user ? (
        <p className="mt-6">Signed in as {user.email}.</p>
      ) : (
        <button
          type="button"
          className="btn-primary mt-8"
          disabled={state === 'busy'}
          onClick={async () => {
            setState('busy');
            const ok = await devLoginCustomer();
            if (ok) navigate(safeBack, { replace: true });
            else setState('failed');
          }}
        >
          Sign in as preview customer
        </button>
      )}
      {state === 'failed' && <p className="field-error">The local sign-in endpoint refused the request.</p>}
    </div>
  );
};
