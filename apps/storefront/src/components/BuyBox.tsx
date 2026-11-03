import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, MessageCircle, ShoppingBag, Truck } from 'lucide-react';
import { BRAND_TAGLINES, Product, describeSlabs, formatPrice, slabKey } from '@swayari/shared';
import { useCart, MAX_LINE_QTY } from '../context/CartContext';
import { useAddToBag } from '../lib/products';
import { Link } from '../lib/router';
import { productPricing, slabPrice, SlabTable } from './Price';
import { QuantityStepper } from './ui';

/**
 * Size, quantity, live price and Add to cart — shared by the product page and quick view.
 * The per-piece price follows the slab for this product + size, counting pieces of other
 * designs of the same product already in the cart.
 */
export const BuyBox: React.FC<{
  product: Product;
  compact?: boolean;
  /** Called after a successful add (e.g. to close a dialog). */
  onAdded?: () => void;
  customisationNote?: string;
  /** Extra fields shown just above the Add to cart button (e.g. an event note). */
  beforeAdd?: React.ReactNode;
}> = ({ product, compact, onAdded, customisationNote, beforeAdd }) => {
  const { items } = useCart();
  const { add, canRequest } = useAddToBag();
  const sizes = product.variants || [];
  const [size, setSize] = useState<string | null>(sizes[0]?.name ?? null);
  const [quantity, setQuantity] = useState(Math.max(1, product.minQuantity || 1));
  const [added, setAdded] = useState(false);

  const { basePrice, mrp, tiers } = productPricing(product, size);
  const key = slabKey({ productId: product.id, priceGroup: product.priceGroup, selectedVariant: size });
  const inCart = items.filter(it => slabKey(it) === key).reduce((n, it) => n + it.quantity, 0);
  const groupQty = inCart + quantity;
  const unit = slabPrice(basePrice, tiers, groupQty);
  const rows = describeSlabs(basePrice, tiers);
  const lastSlab = rows[rows.length - 1];
  const nextSlab = rows.find(r => r.from > groupQty);
  const atBest = lastSlab && groupQty >= lastSlab.from;

  function handleAdd() {
    if (!canRequest(product)) return;
    add(product, quantity, { selectedVariant: size, customisationNote: customisationNote || undefined });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onAdded?.();
    }, 650);
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      {/* Price */}
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-[2.4rem] font-semibold leading-none text-burgundy lining-nums">{formatPrice(unit)}</span>
          <span className="text-sm font-medium text-ink-soft">per piece</span>
          {mrp != null && basePrice != null && mrp > (unit ?? basePrice) && (
            <span className="text-sm text-ink-soft">
              MRP <s>{formatPrice(mrp)}</s>
              <span className="ml-1.5 font-semibold text-emerald-800">{Math.round(((mrp - (unit ?? basePrice)) / mrp) * 100)}% off</span>
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[0.8125rem] text-ink-soft">{BRAND_TAGLINES.priceNote}</p>
      </div>

      {/* Sizes */}
      {sizes.length > 1 && (
        <fieldset>
          <legend className="text-sm font-semibold text-ink">Size</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map(v => (
              <button
                key={v.name}
                type="button"
                onClick={() => setSize(v.name)}
                aria-pressed={size === v.name}
                className={`min-h-[44px] rounded-full border px-4 text-[0.8125rem] font-semibold transition-colors ${
                  size === v.name
                    ? 'border-burgundy bg-burgundy text-ivory-light'
                    : 'border-stone-deep bg-white text-ink hover:border-burgundy hover:text-burgundy'
                }`}
              >
                {v.name}
                {v.indicativePrice != null && <span className="ml-1.5 font-normal opacity-90">· {formatPrice(v.indicativePrice)}</span>}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[0.75rem] text-ink-soft">Each size has its own bulk price; designs of the same size count together.</p>
        </fieldset>
      )}

      {/* Quantity + live total */}
      <div className="rounded-2xl border border-stone-deep bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink">Quantity</p>
          <QuantityStepper
            value={quantity}
            min={1}
            onChange={v => setQuantity(Math.min(MAX_LINE_QTY, Math.max(1, v)))}
            label="Quantity"
            size={compact ? 'sm' : 'md'}
          />
        </div>
        <dl className="mt-3 space-y-1.5 border-t border-stone-deep/70 pt-3 text-[0.875rem]">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">
              {formatPrice(unit)} × {quantity}
            </dt>
            <dd className="font-display text-[1.35rem] font-semibold leading-none text-burgundy lining-nums">
              {unit != null ? formatPrice(unit * quantity) : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-3 text-[0.8125rem]">
            <dt className="text-ink-soft">Delivery</dt>
            <dd className="font-medium text-ink">Extra, at actual cost</dd>
          </div>
        </dl>
        {inCart > 0 && (
          <p className="mt-2 text-[0.75rem] font-medium text-emerald-800">
            {inCart} {inCart === 1 ? 'piece' : 'pieces'} of this {sizes.length > 1 ? 'size' : 'range'} already in your cart count toward the slab.
          </p>
        )}
        {nextSlab && (
          <p className="mt-2 text-[0.75rem] text-ink-soft">
            Add {nextSlab.from - groupQty} more (any design) for {formatPrice(nextSlab.price)} per piece.
          </p>
        )}
        {atBest && (
          <p className="mt-2 text-[0.75rem] text-ink-soft">
            You have the best price.{' '}
            <Link to={`/contact?topic=gift&product=${encodeURIComponent(product.name)}`} className="font-semibold text-burgundy underline underline-offset-2">
              Ask for a special quote
            </Link>{' '}
            for much larger orders.
          </p>
        )}
      </div>

      {beforeAdd}

      <button
        type="button"
        onClick={handleAdd}
        disabled={added || !canRequest(product)}
        className={`w-full ${added ? 'btn bg-emerald-700 text-white' : 'btn-primary'}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={added ? 'added' : 'add'}
            className="inline-flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {added ? <Check className="h-4 w-4" aria-hidden /> : <ShoppingBag className="h-4 w-4" aria-hidden />}
            {added ? 'Added to cart' : 'Add to cart'}
          </motion.span>
        </AnimatePresence>
      </button>
      <p className="-mt-2 flex items-center justify-center gap-1.5 text-center text-[0.75rem] text-ink-soft">
        <MessageCircle className="h-3.5 w-3.5 text-gold-dark" aria-hidden />
        No payment now — send your cart as a request and we confirm the final quote.
      </p>

      <SlabTable basePrice={basePrice} tiers={tiers} activeQty={groupQty} compact={compact} />

      {!compact && (
        <p className="flex items-center gap-1.5 text-[0.8125rem] text-ink-soft">
          <Truck className="h-4 w-4 flex-shrink-0 text-gold-dark" aria-hidden />
          {BRAND_TAGLINES.shippingNote}
        </p>
      )}
    </div>
  );
};
