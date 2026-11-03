import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, ShoppingBag, Check, ArrowUpRight } from 'lucide-react';
import { Product, formatPrice } from '@swayari/shared';
import { Link } from '../lib/router';
import { toCartItem } from '../lib/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  sizes?: string;
}

const FALLBACK_IMAGE = '/assets/products/venkateswara-frame-960.webp';

export const ProductImage: React.FC<{ product: Product; sizes?: string; priority?: boolean; className?: string }> = ({
  product,
  sizes,
  priority,
  className = ''
}) => {
  const primaryImg = product.images && product.images.length > 0 ? product.images[0] : FALLBACK_IMAGE;

  return (
    <div className={`relative flex aspect-square w-full items-center justify-center overflow-hidden bg-gradient-to-b from-ivory-light to-stone p-4 ${className}`}>
      <img
        src={primaryImg}
        alt={product.name}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
        className="h-full w-full object-contain drop-shadow-[0_14px_18px_rgba(46,12,20,0.18)] transition-transform duration-700 ease-luxury group-hover:scale-[1.06]"
      />
    </div>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority }) => {
  const { addItem, openDrawer } = useCart();
  const { user, initiateGoogleSignIn } = useAuth();

  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : [FALLBACK_IMAGE];
  const primaryImg = images[0];
  const secondaryImg = images[1];
  const href = `/product/${product.slug}`;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const minQ = product.minQuantity || 1;
    const item = toCartItem(product, minQ);
    if (!user) {
      initiateGoogleSignIn(item, 'add');
      return;
    }

    addItem(item);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openDrawer();
    }, 700);
  }

  function handleOpenQuickView(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  }

  return (
    <>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-stone-deep/80 bg-white shadow-card transition-all duration-500 ease-luxury hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-card-hover">
        {/* Image stage */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-ivory-light via-ivory to-stone sm:aspect-square">
          <div className="pointer-events-none absolute inset-x-6 bottom-3 h-6 rounded-[50%] bg-burgundy-deep/10 blur-xl transition-all duration-700 group-hover:inset-x-10 group-hover:bg-burgundy-deep/15" />
          <Link to={href} className="absolute inset-0 block p-4 sm:p-6" tabIndex={-1} aria-hidden>
            <img
              src={primaryImg}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              className={`h-full w-full object-contain drop-shadow-[0_16px_20px_rgba(46,12,20,0.2)] transition-all duration-700 ease-luxury group-hover:scale-[1.06] ${
                secondaryImg ? 'group-hover:opacity-0' : ''
              }`}
            />
            {secondaryImg && (
              <img
                src={secondaryImg}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-[1.02] object-contain p-4 opacity-0 transition-all duration-700 ease-luxury group-hover:scale-100 group-hover:opacity-100 sm:p-6"
              />
            )}
          </Link>

          {/* Badges */}
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {product.deity && (
              <span className="rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-burgundy shadow-subtle backdrop-blur">
                {product.deity}
              </span>
            )}
            {product.isDemo && (
              <span className="rounded-full border border-gold/40 bg-gold-pale/90 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-gold-dark backdrop-blur">
                Sample
              </span>
            )}
          </div>

          {/* Quick view (desktop hover) */}
          <div className="absolute inset-x-3 bottom-3 z-10 hidden translate-y-3 opacity-0 transition-all duration-500 ease-luxury group-hover:translate-y-0 group-hover:opacity-100 sm:block">
            <button
              type="button"
              onClick={handleOpenQuickView}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/70 bg-white/90 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink shadow-soft backdrop-blur-md transition-colors hover:text-burgundy"
            >
              <Eye className="h-3.5 w-3.5 text-gold-dark" />
              Quick view
            </button>
          </div>

          {/* Mobile details shortcut */}
          <button
            type="button"
            onClick={handleOpenQuickView}
            className="absolute right-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/85 text-ink shadow-subtle backdrop-blur sm:hidden"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-4 sm:px-5 sm:pb-5">
          <p className="truncate text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold-dark sm:text-[0.6875rem]">
            {product.dimensions || product.frameSize || 'Devotional frame'}
            {product.orientation ? <span className="text-ink-faint"> · {product.orientation}</span> : null}
          </p>
          <h3 className="mt-1.5 line-clamp-2 min-h-[2.5em] font-display text-[1.125rem] font-medium leading-[1.15] text-ink transition-colors duration-300 group-hover:text-burgundy sm:text-[1.3rem]">
            <Link to={href} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
              {product.name}
            </Link>
          </h3>

          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <p className="flex items-baseline gap-1">
                {product.indicativePrice === null ? (
                  <span className="font-sans text-[0.9375rem] font-bold text-burgundy sm:text-[1.0625rem]">Price on request</span>
                ) : (
                  <>
                    <span className="font-sans text-[1.0625rem] font-bold text-burgundy sm:text-[1.2rem]">{formatPrice(product.indicativePrice)}</span>
                    <span className="text-[0.6875rem] text-ink-faint">/ frame</span>
                  </>
                )}
              </p>
              <p className="mt-0.5 text-[0.6875rem] text-ink-faint">
                {product.minQuantity > 1 ? `Min. ${product.minQuantity} pcs` : 'Bulk available'}
              </p>
            </div>
            <ArrowUpRight className="hidden h-5 w-5 flex-shrink-0 text-gold opacity-0 transition-all duration-500 ease-luxury group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 sm:block" />
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={added}
            className={`relative z-10 mt-4 flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.14em] transition-all duration-500 ease-luxury sm:text-[0.75rem] ${
              added
                ? 'bg-emerald-700 text-white'
                : 'border border-burgundy/15 bg-burgundy-soft text-burgundy hover:border-burgundy hover:bg-burgundy hover:text-ivory-light hover:shadow-[0_10px_24px_-12px_rgba(94,26,40,0.7)]'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span key="added" className="flex items-center gap-2" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                  <Check className="h-4 w-4" /> Added
                </motion.span>
              ) : (
                <motion.span key="add" className="flex items-center gap-2" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                  <ShoppingBag className="h-3.5 w-3.5" /> Add to request
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </article>

      {quickViewOpen && <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />}
    </>
  );
};
