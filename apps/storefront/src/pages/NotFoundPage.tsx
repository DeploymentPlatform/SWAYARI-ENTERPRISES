import React from 'react';
import { usePageMeta } from '../lib/meta';
import { EmptyState } from '../components/States';

export const NotFoundPage: React.FC = () => {
  usePageMeta('Page not found', undefined, { noindex: true });
  return (
    <div className="container-content">
      <EmptyState
        title="We couldn’t find that page"
        body={<p>The link may be out of date. The collection is a good place to start.</p>}
        action={{ to: '/shop', label: 'Explore the Collection' }}
      />
    </div>
  );
};
