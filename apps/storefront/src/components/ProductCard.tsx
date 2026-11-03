import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, ShoppingBag, Check, ArrowUpRight } from 'lucide-react';
import { MIN_ORDER_FRAMES, Product, formatPrice } from '@swayari/shared';
import { Link } from '../lib/router';
import { toCartItem } from '../lib/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { QuickViewModal } from './QuickViewModal';
import { PRODUCT_CARD_SIZES, productCardImage, uniqueProductImages } from '../lib/media';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  sizes?: string;
}

const FALLBACK_IMAGE = '/assets/products/gf-venkateswara-studio.webp';

export const ProductImage: React.FC<{ product: Product; sizes?: string; priority?: boolean; className?: string }> = ({
  product,
  sizes,
  priority,
  className = ''
}) => {
  const primaryImg = uniqueProductImages(product.images)[0] || FALLBACK_IMAGE;

  return (
    <div className={`relative flex aspect-square w-full items-center justify-center overflow-hidden bg-gradient-to-b from-ivory-light to-stone ${className}`}>
      <img
        {...productCardImage(primaryImg)}
        alt={product.name}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes || PRODUCT_CARD_SIZES}
        className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.06]"
      />
    </div>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority, sizes }) => {
  const { addItem, openDrawer, itemCount } = useCart();
  const { user, initiateGoogleSignIn } = useAuth();

  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const images = uniqueProductImages(product.images);
  const primaryImg = images[0] || FALLBACK_IMAGE;
  // The hover photo is only fetched once a mouse actually hovers the card (never on touch screens).
  const [hovered, setHovered] = useState(false);
  const secondaryImg = hovered ? images[1] : undefined;
  const [secondaryReady, setSecondaryReady] = useState(false);
  const href = `/product/${product.slug}`;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Fill what the order-wide minimum still needs; once met, add a modest default.
    const item = toCartItem(product, itemCount < MIN_ORDER_FRAMES ? MIN_ORDER_FRAMES - itemCount : 10);
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
      <article
        onPointerEnter={e => e.pointerType === 'mouse' && setHovered(true)}
        className="group relative flex h-full flex-col overflow-hidden rounded-card border border-stone-deep/80 bg-white shadow-card transition-all duration-500 ease-luxury hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-card-hover">
        {/* Image stage */}
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-ivory-light via-ivory to-stone">
          <Link to={href} className="absolute inset-0 block" tabIndex={-1} aria-hidden>
            <img
              {...productCardImage(primaryImg)}
              sizes={sizes || PRODUCT_CARD_SIZES}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className={`h-full w-full object-cover transition-all duration-700 ease-luxury group-hover:scale-[1.06] ${
                secondaryReady ? 'group-hover:opacity-0' : ''
              }`}
            />
            {secondaryImg && (
              <img
                {...productCardImage(secondaryImg)}
                sizes={sizes || PRODUCT_CARD_SIZES}
                onLoad={() => setSecondaryReady(true)}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-0 transition-all duration-700 ease-luxury group-hover:scale-100 group-hover:opacity-100"
              />
            )}
          </Link>

          {/* Badges */}
          <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-3.75rem)] flex-col items-start gap-1.5 sm:max-w-[calc(100%-1.5rem)]">
            {product.deity && (
              <span className="max-w-full truncate rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-burgundy shadow-subtle backdrop-blur">
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
          <h3 className="mt-1.5 line-clamp-2 min-h-[2.5em] font-display text-[1.05rem] font-medium leading-[1.15] text-ink transition-colors duration-300 group-hover:text-burgundy sm:text-[1.3rem]">
            <Link to={href} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
              {product.name}
            </Link>
          </h3>

          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
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
            className={`relative z-10 mt-4 flex h-11 w-full items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full text-[0.625rem] font-semibold uppercase tracking-[0.08em] transition-all duration-500 ease-luxury sm:text-[0.75rem] sm:tracking-[0.14em] ${
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
