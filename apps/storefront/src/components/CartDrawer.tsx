import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { formatPrice } from '@swayari/shared';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../lib/router';
import { productImageSources } from '../lib/media';
import { EASE_LUXURY } from './motion';
import { LotusMark, OrderDisclaimer, Picture, PriceText, QuantityStepper, useDialogBehaviour } from './ui';

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
            className="absolute inset-0 bg-umber/50 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeDrawer}
            aria-hidden
          />
          <motion.div
            ref={ref}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="bag-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-ivory-light shadow-drawer outline-none sm:rounded-l-[28px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: EASE_LUXURY }}
          >
            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-stone-deep/80 px-5 pb-4 pt-5 sm:px-7">
              <div>
                <p className="eyebrow text-[0.625rem]">Your request</p>
                <h2 id="bag-title" className="mt-1 flex items-baseline gap-2 font-display text-[2rem] leading-none">
                  Your bag
                  <span className="inline-flex h-6 min-w-[1.5rem] translate-y-[-3px] items-center justify-center rounded-full bg-burgundy px-2 font-sans text-[0.75rem] font-semibold text-ivory-light">
                    <span className="sr-only">(</span>
                    {itemCount}
                    <span className="sr-only">)</span>
                  </span>
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-300 hover:bg-stone hover:text-burgundy"
                aria-label="Close bag"
              >
                <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-b from-gold-pale/80 to-ivory-light shadow-gold">
                  <ShoppingBag className="h-7 w-7 text-gold-dark" strokeWidth={1.5} aria-hidden />
                </div>
                <p className="mt-7 font-display text-[2rem] leading-tight">Your bag is empty</p>
                <div className="ornament mt-4" aria-hidden>
                  <span className="block h-1.5 w-1.5 rotate-45 bg-gold" />
                </div>
                <p className="mt-4 max-w-xs text-ink-soft">Add the pieces you like and send them to us as one request.</p>
                <Link to="/shop" onClick={closeDrawer} className="btn-primary mt-8">
                  Explore the Collection
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto overscroll-contain px-5 py-2 sm:px-7">
                  <AnimatePresence initial={false}>
                    {items.map((item, i) => {
                      const sources = productImageSources(item.image);
                      return (
                        <motion.li
                          key={`${item.productId}-${item.selectedVariant || ''}`}
                          layout
                          initial={{ opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_LUXURY, delay: 0.12 + i * 0.05 } }}
                          exit={{ opacity: 0, x: 24, transition: { duration: 0.3 } }}
                          className="flex gap-4 border-b border-stone-deep/70 py-5 last:border-b-0"
                        >
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={closeDrawer}
                            className="block h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-2xl border border-stone-deep/70 bg-gradient-to-b from-ivory-light to-stone p-1.5"
                            tabIndex={-1}
                          >
                            {sources && <Picture sources={sources} sizes="88px" width={176} height={176} alt="" className="h-full w-full object-contain" />}
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                to={`/product/${item.slug}`}
                                onClick={closeDrawer}
                                className="font-display text-[1.15rem] font-medium leading-snug text-ink transition-colors hover:text-burgundy"
                              >
                                {item.name}
                              </Link>
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId, item.selectedVariant)}
                                className="-mr-2 -mt-2 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors duration-300 hover:bg-burgundy-soft hover:text-burgundy"
                                aria-label={`Remove ${item.name} from your bag`}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </button>
                            </div>
                            {item.selectedVariant && <p className="text-sm text-ink-soft">{item.selectedVariant}</p>}
                            <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                              <QuantityStepper
                                size="sm"
                                value={item.quantity}
                                min={item.minQuantity || 1}
                                step={item.orderIncrement || 1}
                                onChange={q => updateQuantity(item.productId, item.selectedVariant, q)}
                                label={`Quantity of ${item.name}`}
                              />
                              <div className="text-right">
                                <PriceText
                                  value={item.indicativePrice === null ? null : item.indicativePrice * item.quantity}
                                  className="font-display text-[1.2rem] font-semibold leading-none text-burgundy lining-nums"
                                />
                                {item.indicativePrice !== null && <span className="mt-1 block text-[0.6875rem] text-ink-faint">₹{item.indicativePrice}/frame</span>}
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>

                {/* Summary */}
                <div className="pb-safe space-y-3 border-t border-stone-deep/80 bg-white/80 px-5 pt-5 backdrop-blur sm:px-7">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-ink">Items subtotal</span>
                    <span className="text-right font-display text-[1.6rem] font-semibold leading-none text-burgundy lining-nums">
                      {subtotal === null ? 'Price on request' : formatPrice(subtotal)}
                      {subtotal !== null && hasUnpricedItems && <span className="block font-sans text-xs font-normal text-ink-soft">+ items on request</span>}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-ink-soft">
                    <span>Shipping</span>
                    <span className="font-medium italic text-gold-dark">To be confirmed by our team</span>
                  </div>
                  <OrderDisclaimer compact />
                  <div className="grid gap-2.5 pb-2 pt-1">
                    <button type="button" onClick={proceed} className="btn-primary w-full">
                      {user ? 'Continue to request details' : 'Sign in to send request'}
                    </button>
                    <Link to="/cart" onClick={closeDrawer} className="btn-secondary btn-sm w-full">
                      View full bag
                    </Link>
                  </div>
                  <p className="flex items-center justify-center gap-2 pb-1 text-[0.6875rem] uppercase tracking-[0.14em] text-ink-faint">
                    <LotusMark className="h-2.5 w-4 text-gold" /> No payment is taken online
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
