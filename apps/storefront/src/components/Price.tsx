import React from 'react';
import {
  BRAND_TAGLINES,
  BulkPriceTier,
  Product,
  bestSlabPrice,
  calculateEffectiveUnitPrice,
  describeSlabs,
  formatPrice,
  resolveVariantPricing,
  savingsPercent
} from '@swayari/shared';

/** Pricing of the size shown on a card or page (the first size when none is chosen). */
export function productPricing(product: Product, size?: string | null) {
  const chosen = size ?? product.variants?.[0]?.name ?? null;
  const { basePrice, mrp, tiers } = resolveVariantPricing(product, chosen);
  const best = bestSlabPrice(basePrice, tiers);
  return { size: chosen, basePrice, mrp, tiers, best, save: savingsPercent(basePrice, best) };
}

/** Price from the slab for a total quantity (designs of one product + size added together). */
export const slabPrice = (basePrice: number | null, tiers: BulkPriceTier[], totalQty: number) =>
  calculateEffectiveUnitPrice(basePrice, tiers, Math.max(1, totalQty));

/** Card price: MRP struck through, 1-piece price, then "Bulk price from ₹X". */
export const CardPrice: React.FC<{ product: Product }> = ({ product }) => {
  const { basePrice, mrp, best, save } = productPricing(product);
  const manySizes = (product.variants?.length || 0) > 1;
  if (basePrice == null) {
    return <p className="text-[0.9375rem] font-bold text-burgundy">Price on request</p>;
  }
  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        {manySizes && <span className="text-[0.6875rem] font-medium text-ink-soft">from</span>}
        <span className="text-[1.0625rem] font-bold text-burgundy sm:text-[1.2rem]">{formatPrice(basePrice)}</span>
        {mrp != null && mrp > basePrice && (
          <s className="text-[0.75rem] text-ink-faint" aria-label={`MRP ${formatPrice(mrp)}`}>
            {formatPrice(mrp)}
          </s>
        )}
      </p>
      {best != null && best < basePrice && (
        <p className="mt-0.5 text-[0.6875rem] font-semibold text-emerald-800 sm:text-[0.75rem]">
          Bulk price from {formatPrice(best)}
          <span className="hidden font-medium text-ink-soft sm:inline"> · save up to {save}%</span>
        </p>
      )}
    </div>
  );
};

/** The four quantity slabs, with the last one marked "Best price". */
export const SlabTable: React.FC<{
  basePrice: number | null;
  tiers: BulkPriceTier[];
  /** Total quantity counted toward the slab, to highlight the active row. */
  activeQty?: number;
  compact?: boolean;
}> = ({ basePrice, tiers, activeQty, compact }) => {
  const rows = describeSlabs(basePrice, tiers);
  if (rows.length === 0) return null;
  const best = rows[rows.length - 1];
  const save = savingsPercent(basePrice, best.price);
  return (
    <div className="overflow-hidden rounded-2xl border border-gold/30 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gold/20 bg-gold-pale/50 px-4 py-2.5">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-ink">Bulk price per piece</p>
        {save > 0 && (
          <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-[0.6875rem] font-bold text-white">
            Save up to {save}%
          </span>
        )}
      </div>
      <table className="w-full text-left">
        <caption className="sr-only">Price per piece by total quantity</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Quantity</th>
            <th scope="col">Price per piece</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const active = activeQty != null && activeQty >= r.from && (r.to == null || activeQty <= r.to);
            const isBest = i === rows.length - 1 && rows.length > 1;
            return (
              <tr
                key={r.from}
                className={`border-t border-stone-deep/60 first:border-t-0 ${active ? 'bg-burgundy-soft' : ''}`}
              >
                <td className={`px-4 ${compact ? 'py-2' : 'py-2.5'} text-[0.875rem] text-ink`}>
                  {r.to == null ? `${r.from}+ pcs` : r.from === r.to ? `${r.from} pc` : `${r.from}–${r.to} pcs`}
                  {active && <span className="ml-2 text-[0.6875rem] font-semibold text-burgundy">your price</span>}
                </td>
                <td className={`px-4 ${compact ? 'py-2' : 'py-2.5'} text-right`}>
                  {isBest && (
                    <span className="mr-2 rounded-full bg-gold px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-white">
                      Best price
                    </span>
                  )}
                  <span className="text-[0.9375rem] font-bold text-burgundy">{formatPrice(r.price)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-stone-deep/60 bg-ivory-light px-4 py-2 text-[0.75rem] leading-snug text-ink-soft">
        {BRAND_TAGLINES.priceNote} Ordering well beyond {best.from}+ pieces? Ask for a special quote.
      </p>
    </div>
  );
};
