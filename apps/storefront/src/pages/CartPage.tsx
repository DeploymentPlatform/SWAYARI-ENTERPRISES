import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { formatPrice } from '@swayari/shared';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../lib/router';
import { productImageSources } from '../lib/media';
import { usePageMeta } from '../lib/meta';
import { EmptyState, PageIntro, RequestSteps } from '../components/States';
import { EASE_LUXURY } from '../components/motion';
import { OrderDisclaimer, Picture, PriceText, QuantityStepper } from '../components/ui';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, subtotal, hasUnpricedItems, itemCount } = useCart();
  const { user, initiateGoogleSignIn } = useAuth();
  const { navigate } = useRouter();
  usePageMeta('Your bag', undefined, { noindex: true });

  if (items.length === 0) {
    return (
      <div className="container-content">
        <EmptyState
          title="Your bag is empty"
          body={<p>Add the pieces you like and send them to us as one request.</p>}
          action={{ to: '/shop', label: 'Explore the Collection' }}
        />
      </div>
    );
  }

  return (
    <div className="container-content pb-20 md:pb-28">
      <PageIntro eyebrow="Review" title={<>Your <em>bag</em></>} after={<RequestSteps current={1} />}>
        {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}. Nothing is charged — you are preparing a request for our team.
      </PageIntro>

      <div className="grid gap-10 pt-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {items.map((item, i) => {
                const sources = productImageSources(item.image);
                return (
                  <motion.li
                    key={`${item.productId}-${item.selectedVariant || ''}`}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_LUXURY, delay: i * 0.06 } }}
                    exit={{ opacity: 0, x: -24, transition: { duration: 0.3 } }}
                    className="card-luxe grid grid-cols-[88px_1fr] gap-4 p-3.5 sm:grid-cols-[128px_1fr] sm:gap-6 sm:p-5"
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      className="block aspect-square overflow-hidden rounded-2xl border border-stone-deep/60 bg-gradient-to-b from-ivory-light to-stone p-1.5 sm:p-2.5"
                      tabIndex={-1}
                    >
                      {sources && <Picture sources={sources} sizes="128px" width={256} height={256} alt="" className="h-full w-full object-contain" />}
                    </Link>
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={`/product/${item.slug}`}
                            className="font-display text-[1.2rem] font-medium leading-snug text-ink transition-colors hover:text-burgundy sm:text-[1.45rem]"
                          >
                            {item.name}
                          </Link>
                          {item.selectedVariant && <p className="text-sm text-ink-soft">{item.selectedVariant}</p>}
                          {item.customisationNote && <p className="mt-1 text-sm italic text-ink-soft">Note: {item.customisationNote}</p>}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <PriceText
                            value={item.indicativePrice === null ? null : item.indicativePrice * item.quantity}
                            className="whitespace-nowrap font-display text-[1.3rem] font-semibold leading-none text-burgundy lining-nums"
                          />
                          {item.indicativePrice !== null && (
                            <div className="mt-1 text-xs text-ink-faint">
                              <span>₹{item.indicativePrice}/frame</span>
                              {item.basePrice && item.indicativePrice < item.basePrice && (
                                <span className="mt-1 block font-semibold uppercase tracking-[0.1em] text-gold-dark">Bulk discount</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <QuantityStepper
                          size="sm"
                          value={item.quantity}
                          min={item.minQuantity || 1}
                          step={item.orderIncrement || 1}
                          onChange={q => updateQuantity(item.productId, item.selectedVariant, q)}
                          label={`Quantity of ${item.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.selectedVariant)}
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm text-ink-soft transition-colors duration-300 hover:bg-burgundy-soft hover:text-burgundy"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          <Link to="/shop" className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-burgundy">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span className="link-underline">Continue browsing</span>
          </Link>
        </div>

        <aside className="lg:col-span-5" aria-labelledby="summary-title">
          <motion.div
            className="card-luxe relative overflow-hidden p-6 md:p-8 lg:sticky lg:top-28"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_LUXURY, delay: 0.1 }}
          >
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-light via-gold to-gold-light" />
            <h2 id="summary-title" className="font-display text-[2rem] leading-tight">
              Request summary
            </h2>
            <dl className="mt-5 space-y-3.5 text-[0.9375rem]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Pieces</dt>
                <dd className="font-medium tabular-nums">{itemCount}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-stone-deep/70 pt-3.5">
                <dt className="font-medium text-ink">Items subtotal</dt>
                <dd className="text-right font-display text-[1.75rem] font-semibold leading-none text-burgundy lining-nums">
                  {subtotal === null ? 'Price on request' : formatPrice(subtotal)}
                  {subtotal !== null && hasUnpricedItems && <span className="mt-1 block font-sans text-sm font-normal text-ink-soft">+ items priced on request</span>}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Shipping</dt>
                <dd className="text-right font-medium italic text-gold-dark">To be confirmed by our team</dd>
              </div>
            </dl>
            <OrderDisclaimer className="mt-6" compact />
            <button
              type="button"
              className="btn-primary mt-6 w-full"
              onClick={() => (user ? navigate('/checkout') : initiateGoogleSignIn(undefined, 'checkout'))}
            >
              {user ? 'Continue to request details' : 'Sign in to send request'}
            </button>
            <p className="mt-4 text-center text-xs text-ink-faint">No payment is taken online.</p>
          </motion.div>
        </aside>
      </div>
    </div>
  );
};
