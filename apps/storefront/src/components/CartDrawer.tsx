import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { formatPrice } from '@swayari/shared';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../lib/router';
import { productImageSources } from '../lib/media';
import { OrderDisclaimer, Picture, PriceText, QuantityStepper, useDialogBehaviour } from './ui';

export const CartDrawer: React.FC = () => {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, subtotal, hasUnpricedItems, itemCount } = useCart();
  const { user, initiateGoogleSignIn } = useAuth();
  const { navigate } = useRouter();
  const ref = useDialogBehaviour(isDrawerOpen, closeDrawer);

  function proceed() {
    closeDrawer();
    if (user) navigate('/checkout');
    else initiateGoogleSignIn(undefined, 'checkout');
  }

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-umber/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            aria-hidden
          />
          <motion.div
            ref={ref}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="bag-title"
            className="outline-none absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-ivory shadow-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-stone-deep px-5 py-4 sm:px-6">
              <h2 id="bag-title" className="font-display text-[1.75rem]">
                Your bag <span className="font-sans text-base text-ink-soft">({itemCount})</span>
              </h2>
              <button type="button" onClick={closeDrawer} className="-mr-2 inline-flex h-11 w-11 items-center justify-center" aria-label="Close bag">
                <X className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <p className="font-display text-2xl">Your bag is empty</p>
                <p className="mt-2 text-ink-soft">Add the pieces you like and send them to us as one request.</p>
                <Link
                  to="/shop"
                  onClick={closeDrawer}
                  className="btn-primary mt-8"
                >
                  Explore the Collection
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-stone-deep overflow-y-auto px-5 sm:px-6">
                  {items.map(item => {
                    const sources = productImageSources(item.image);
                    return (
                      <li key={`${item.productId}-${item.selectedVariant || ''}`} className="flex gap-4 py-5">
                        <Link to={`/product/${item.slug}`} onClick={closeDrawer} className="block w-[84px] flex-shrink-0 bg-stone" tabIndex={-1}>
                          {sources && (
                            <Picture sources={sources} sizes="84px" width={168} height={210} alt="" className="aspect-product w-full object-cover" />
                          )}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <Link to={`/product/${item.slug}`} onClick={closeDrawer} className="font-display text-lg leading-snug hover:text-burgundy">
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId, item.selectedVariant)}
                              className="text-sm text-ink-soft underline underline-offset-4 hover:text-burgundy"
                              aria-label={`Remove ${item.name} from your bag`}
                            >
                              Remove
                            </button>
                          </div>
                          {item.selectedVariant && <p className="text-sm text-ink-soft">{item.selectedVariant}</p>}
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <QuantityStepper
                              size="sm"
                              value={item.quantity}
                              min={item.minQuantity || 1}
                              onChange={q => updateQuantity(item.productId, item.selectedVariant, q)}
                              label={`Quantity of ${item.name}`}
                            />
                            <PriceText
                              value={item.indicativePrice === null ? null : item.indicativePrice * item.quantity}
                              className="text-sm text-ink-soft"
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="space-y-4 border-t border-stone-deep bg-white px-5 py-5 sm:px-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-ink-soft">Estimated total</span>
                    <span className="font-medium">
                      {subtotal === null ? 'Price on request' : `${formatPrice(subtotal)}${hasUnpricedItems ? ' + items on request' : ''}`}
                    </span>
                  </div>
                  <OrderDisclaimer compact />
                  <div className="grid gap-2.5">
                    <button type="button" onClick={proceed} className="btn-primary w-full">
                      {user ? 'Continue to request details' : 'Sign in to send request'}
                    </button>
                    <Link to="/cart" onClick={closeDrawer} className="btn-secondary w-full">
                      View full bag
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
