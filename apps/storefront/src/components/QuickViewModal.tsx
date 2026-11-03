import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShoppingBag, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
import { Product, formatPrice, calculateEffectiveUnitPrice } from '@swayari/shared';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toCartItem } from '../lib/products';
import { Link } from '../lib/router';
import { EASE_LUXURY } from './motion';
import { QuantityStepper, SampleTag, useDialogBehaviour } from './ui';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addItem, openDrawer } = useCart();
  const { user, initiateGoogleSignIn } = useAuth();

  const minQty = product?.minQuantity || 1;
  const incQty = product?.orderIncrement || 1;
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(minQty);
  const [added, setAdded] = useState(false);
  const [customNote, setCustomNote] = useState('');
  // Plays the exit animation first; the parent unmounts us via onClose once it has finished.
  const [visible, setVisible] = useState(true);
  const afterExit = React.useRef<() => void>(() => {});
  const requestClose = (then?: () => void) => {
    afterExit.current = then || (() => {});
    setVisible(false);
  };
  const ref = useDialogBehaviour(visible && Boolean(product), () => requestClose());

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : ['/assets/products/venkateswara-frame-960.webp'];

  // Calculate current applicable unit price based on quantity and bulk tiers
  const currentUnitPrice = calculateEffectiveUnitPrice(product.indicativePrice, product.bulkTiers, quantity);
  const itemsSubtotal = currentUnitPrice !== null ? currentUnitPrice * quantity : null;

  function handleQuantityChange(rawVal: number) {
    const raw = isNaN(rawVal) ? minQty : Math.max(minQty, rawVal);
    const rem = (raw - minQty) % incQty;
    const validVal = rem === 0 ? raw : raw + (incQty - rem);
    setQuantity(validVal);
  }

  function handleAdd() {
    const item = toCartItem(product, quantity, { customisationNote: customNote || undefined });
    if (!user) {
      // Close first so the sign-in dialog is the only modal on screen; the add resumes after sign-in.
      requestClose(() => initiateGoogleSignIn(item, 'add'));
      return;
    }

    addItem(item);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      requestClose(openDrawer);
    }, 600);
  }

  return (
    <AnimatePresence
      onExitComplete={() => {
        onClose();
        afterExit.current();
      }}
    >
      {visible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => requestClose()}
            className="absolute inset-0 bg-umber/55 backdrop-blur-[3px]"
            aria-hidden
          />

          {/* Dialog */}
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qv-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.5, ease: EASE_LUXURY }}
            className="relative z-10 flex max-h-[94vh] w-full max-w-4xl flex-col overflow-y-auto rounded-t-[28px] border border-white/60 bg-ivory-light shadow-dialog outline-none sm:max-h-[90vh] sm:rounded-[24px] md:flex-row md:overflow-hidden"
          >
            <button
              type="button"
              onClick={() => requestClose()}
              className="absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-deep bg-white/85 text-ink backdrop-blur transition-colors duration-300 hover:border-gold hover:text-burgundy"
              aria-label="Close quick view"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            {/* Gallery */}
            <div className="flex flex-col gap-4 border-b border-stone-deep/70 bg-gradient-to-b from-ivory-light to-stone p-5 sm:p-7 md:w-[46%] md:border-b-0 md:border-r">
              <div className="relative mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-[18px] border border-stone-deep/70 bg-white shadow-card md:max-w-none">
                <AnimatePresence initial={false}>
                  <motion.img
                    key={images[selectedImgIdx]}
                    src={images[selectedImgIdx]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE_LUXURY }}
                    className="absolute inset-0 h-full w-full object-contain p-4"
                  />
                </AnimatePresence>
                <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                  {product.deity && (
                    <span className="rounded-full border border-stone-deep bg-white/95 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-burgundy">
                      {product.deity}
                    </span>
                  )}
                  {product.isDemo && <SampleTag />}
                </div>
                {product.minQuantity > 1 && (
                  <span className="absolute bottom-3 left-3 rounded-full border border-gold/40 bg-gold-pale/90 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-gold-dark">
                    Min. {product.minQuantity} frames
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex justify-center gap-2 overflow-x-auto pb-1 scrollbar-none md:justify-start">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImgIdx(idx)}
                      aria-pressed={selectedImgIdx === idx}
                      aria-label={`Show photograph ${idx + 1}`}
                      className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border bg-white p-1 transition-all duration-300 ${
                        selectedImgIdx === idx ? 'border-burgundy shadow-[0_0_0_3px_rgba(94,26,40,0.12)]' : 'border-stone-deep opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details & request actions */}
            <div className="flex flex-col p-5 sm:p-7 md:w-[54%] md:overflow-y-auto">
              <div className="pr-10">
                <p className="eyebrow">
                  {product.dimensions || product.frameSize || 'Devotional Frame'}
                  {product.orientation && <span className="capitalize"> · {product.orientation} format</span>}
                </p>
                <h2 id="qv-title" className="mt-3 font-display text-[1.9rem] font-medium leading-[1.05] text-ink sm:text-[2.2rem]">
                  {product.name}
                </h2>
                <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.12em] text-ink-faint">SKU: {product.sku}</p>
              </div>

              {/* Pricing: strict <= 99 */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-[2.2rem] font-semibold leading-none text-burgundy lining-nums">{formatPrice(currentUnitPrice)}</span>
                <span className="text-sm text-ink-soft">per frame</span>
              </div>

              {itemsSubtotal !== null && (
                <dl className="mt-4 space-y-1.5 rounded-2xl border border-stone-deep bg-white/80 p-3.5 text-[0.8125rem]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Unit price × quantity:</dt>
                    <dd className="font-medium tabular-nums text-ink">
                      {formatPrice(currentUnitPrice)} × {quantity}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-t border-stone-deep/70 pt-1.5">
                    <dt className="font-semibold text-ink">Items subtotal:</dt>
                    <dd className="font-display text-[1.25rem] font-semibold leading-none text-burgundy lining-nums">{formatPrice(itemsSubtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 text-xs">
                    <dt className="text-ink-soft">Shipping:</dt>
                    <dd className="font-medium italic text-gold-dark">to be confirmed by our team</dd>
                  </div>
                </dl>
              )}
              <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink-faint">
                Items subtotal is indicative. Submitting this request does not confirm a purchase or charge payment online.
              </p>

              {/* Bulk tiers */}
              {product.bulkTiers && product.bulkTiers.length > 0 && (
                <div className="mt-4">
                  <p className="font-sans text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold-dark">Volume pricing tiers</p>
                  <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                    {product.bulkTiers.map(tier => (
                      <div
                        key={tier.min_qty}
                        className={`rounded-xl border px-2 py-2 transition-all duration-300 ${
                          quantity >= tier.min_qty
                            ? 'border-burgundy bg-gradient-to-b from-burgundy-accent to-burgundy text-ivory-light'
                            : 'border-stone-deep bg-white text-ink'
                        }`}
                      >
                        <div className="font-display text-[1.1rem] font-semibold leading-none lining-nums">{formatPrice(tier.unit_price)}</div>
                        <div className="mt-1 text-[0.625rem] uppercase tracking-[0.08em] opacity-80">{tier.min_qty}+ frames</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              <dl className="mt-4 divide-y divide-stone-deep/60 border-y border-stone-deep/70 text-[0.8125rem]">
                {product.dimensions && (
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-ink-soft">Dimensions:</dt>
                    <dd className="text-right font-medium text-ink">{product.dimensions}</dd>
                  </div>
                )}
                {product.borderFinish && (
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-ink-soft">Border Finish:</dt>
                    <dd className="text-right font-medium text-ink">{product.borderFinish}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-ink-soft">Mixed Designs:</dt>
                  <dd className="text-right font-medium text-burgundy">Allowed across order</dd>
                </div>
              </dl>
              <p className="mt-2 flex items-center gap-1.5 text-[0.75rem] text-ink-soft">
                <Truck className="h-3.5 w-3.5 flex-shrink-0 text-gold" aria-hidden />
                Shipping charged separately &amp; confirmed before dispatch
              </p>

              {/* Quantity & add */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Quantity</p>
                    <p className="text-[0.6875rem] text-ink-faint">
                      {product.minQuantity > 1 ? `Min. ${product.minQuantity} pcs` : 'Bulk or single'}
                      {incQty > 1 ? ` · Step ${incQty}` : ''}
                    </p>
                  </div>
                  <QuantityStepper value={quantity} min={minQty} step={incQty} onChange={handleQuantityChange} label="Frame quantity" size="sm" />
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={added}
                  className={`w-full ${added ? 'btn bg-emerald-700 text-white' : 'btn-primary'}`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={added ? 'added' : 'add'}
                      className="inline-flex items-center gap-2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                    >
                      {added ? <Check className="h-4 w-4" aria-hidden /> : <ShoppingBag className="h-4 w-4" aria-hidden />}
                      {added ? 'Added to Request!' : 'Add to Order Request'}
                    </motion.span>
                  </AnimatePresence>
                </button>

                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex min-h-[44px] items-center justify-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-burgundy"
                >
                  <span className="link-underline">View Full Product Details</span>
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              {/* Assurance */}
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-deep/70 pt-3 text-[0.6875rem] text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-gold" aria-hidden />
                  Authentic Frames
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-gold" aria-hidden />
                  Insured Event Transit
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
