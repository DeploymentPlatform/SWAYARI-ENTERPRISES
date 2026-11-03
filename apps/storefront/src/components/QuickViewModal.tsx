import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { Product } from '@swayari/shared';
import { useCart } from '../context/CartContext';
import { Link } from '../lib/router';
import { EASE_LUXURY } from './motion';
import { SampleTag, useDialogBehaviour } from './ui';
import { BuyBox } from './BuyBox';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { openDrawer } = useCart();
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  // Plays the exit animation first; the parent unmounts us via onClose once it has finished.
  const [visible, setVisible] = useState(true);
  const afterExit = React.useRef<() => void>(() => {});
  const requestClose = (then?: () => void) => {
    afterExit.current = then || (() => {});
    setVisible(false);
  };
  const ref = useDialogBehaviour(visible && Boolean(product), () => requestClose());

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : ['/assets/products/gf-venkateswara-studio.webp'];

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
                    className="absolute inset-0 h-full w-full object-cover"
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
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details & request actions */}
            <div className="flex flex-col p-5 sm:p-7 md:w-[54%] md:overflow-y-auto">
              <div className="pr-10">
                <p className="eyebrow">{product.categoryName || 'Devotional gift'}</p>
                <h2 id="qv-title" className="mt-3 font-display text-[1.9rem] font-medium leading-[1.05] text-ink sm:text-[2.2rem]">
                  {product.name}
                </h2>
                <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.12em] text-ink-faint">SKU: {product.sku}</p>
              </div>

              <div className="mt-5">
                <BuyBox product={product} compact onAdded={() => requestClose(openDrawer)} />
              </div>

              <div className="mt-3">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex min-h-[44px] items-center justify-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-burgundy"
                >
                  <span className="link-underline">View Full Product Details</span>
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
