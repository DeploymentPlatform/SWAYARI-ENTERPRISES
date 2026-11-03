import React from 'react';
import { motion } from 'framer-motion';
import { usePageMeta } from '../lib/meta';
import { EmptyState } from '../components/States';
import { EASE_LUXURY } from '../components/motion';
import { Link } from '../lib/router';

export const NotFoundPage: React.FC = () => {
  usePageMeta('Page not found', undefined, { noindex: true });
  return (
    <div className="container-content">
      <EmptyState
        eyebrow="Page not found"
        title="We couldn’t find that page"
        body={<p>The link may be out of date. The collection is a good place to start.</p>}
        action={{ to: '/shop', label: 'Explore the Collection' }}
        secondary={
          <Link to="/" className="btn-secondary">
            Return home
          </Link>
        }
        art={
          <motion.p
            aria-hidden
            className="text-gold-gradient px-3 font-display text-[6.5rem] font-semibold italic leading-none sm:text-[8.5rem]"
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.02em' }}
            transition={{ duration: 1.2, ease: EASE_LUXURY }}
          >
            404
          </motion.p>
        }
      />
    </div>
  );
};
