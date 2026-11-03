import { MAX_FRAME_PRICE_PAISE } from './constants.js';
/**
 * Unit price for a quantity: the highest slab whose min_qty the quantity reaches.
 * Slabs normally start at 1 piece; below the first slab the base (1-piece) price applies.
 *
 * Example: slabs 1→₹549, 10→₹469, 50→₹429, 100→₹399
 * calculateEffectiveUnitPrice(549, slabs, 60) -> 429
 */
export function calculateEffectiveUnitPrice(basePrice, bulkTiers, quantity = 1) {
    if (basePrice === null || basePrice === undefined) {
        return null;
    }
    const validQty = Math.max(1, Number(quantity) || 1);
    if (!bulkTiers || !Array.isArray(bulkTiers) || bulkTiers.length === 0) {
        return basePrice;
    }
    // Sort tiers in descending order of min_qty to find highest qualified tier
    const sortedTiers = [...bulkTiers].sort((a, b) => b.min_qty - a.min_qty);
    for (const tier of sortedTiers) {
        if (validQty >= tier.min_qty && typeof tier.unit_price === 'number' && tier.unit_price > 0) {
            return tier.unit_price;
        }
    }
    return basePrice;
}
/**
 * Calculates line subtotal in rupees given effective unit price and quantity.
 */
export function calculateLineSubtotal(unitPrice, quantity) {
    if (unitPrice === null || unitPrice === undefined) {
        return 0;
    }
    const validQty = Math.max(0, Number(quantity) || 0);
    return unitPrice * validQty;
}
/**
 * Which quantity count a line belongs to. Designs of the same product (price group) and the
 * same size share one count, so a buyer can mix designs to reach a cheaper slab.
 */
export function slabKey(item) {
    return `${item.priceGroup || item.productId}::${item.selectedVariant || ''}`;
}
/** Total pieces per slab key across the whole cart. */
export function slabQuantities(items) {
    const totals = new Map();
    for (const item of items) {
        const key = slabKey(item);
        totals.set(key, (totals.get(key) || 0) + Math.max(0, Number(item.quantity) || 0));
    }
    return totals;
}
/** Re-prices every line with the slab reached by its whole group (product + size). */
export function priceCartItems(items) {
    const totals = slabQuantities(items);
    return items.map(item => {
        const basePrice = item.basePrice ?? item.indicativePrice;
        const groupQty = totals.get(slabKey(item)) || item.quantity;
        return { ...item, basePrice, indicativePrice: calculateEffectiveUnitPrice(basePrice, item.bulkTiers, groupQty) };
    });
}
/**
 * Combines duplicate cart items sharing the same productId and selectedVariant, then prices
 * every line with its group slab.
 */
export function aggregateCartItems(items) {
    const map = new Map();
    for (const item of items) {
        const key = `${item.productId}:::${item.selectedVariant || ''}`;
        const existing = map.get(key);
        if (existing) {
            existing.quantity += item.quantity;
            if (item.customisationNote && item.customisationNote !== existing.customisationNote) {
                existing.customisationNote = existing.customisationNote
                    ? `${existing.customisationNote}; ${item.customisationNote}`
                    : item.customisationNote;
            }
        }
        else {
            map.set(key, { ...item, basePrice: item.basePrice ?? item.indicativePrice });
        }
    }
    return priceCartItems(Array.from(map.values()));
}
/**
 * Calculates cart totals including itemsSubtotal, totalQuantity, and unpriced status.
 */
export function calculateCartTotals(items) {
    const aggregated = aggregateCartItems(items);
    let subtotal = 0;
    let totalQuantity = 0;
    let pricedCount = 0;
    for (const item of aggregated) {
        totalQuantity += item.quantity;
        if (item.indicativePrice !== null && item.indicativePrice !== undefined) {
            subtotal += item.indicativePrice * item.quantity;
            pricedCount++;
        }
    }
    const hasUnpricedItems = pricedCount !== aggregated.length;
    return {
        subtotal: pricedCount > 0 ? subtotal : null,
        totalQuantity,
        itemCount: totalQuantity,
        hasUnpricedItems
    };
}
/** Pricing for one size of a product (falls back to the product-level price). */
export function resolveVariantPricing(product, variantName) {
    const variant = (variantName && product.variants?.find(v => v.name === variantName)) || null;
    if (variant && variant.indicativePrice != null) {
        return { variant, basePrice: variant.indicativePrice, mrp: variant.mrp ?? null, tiers: variant.tiers || [] };
    }
    return { variant, basePrice: product.indicativePrice, mrp: product.mrp ?? null, tiers: product.bulkTiers || [] };
}
/** Lowest per-piece price across the slabs (the "Best price"). */
export function bestSlabPrice(basePrice, tiers) {
    const prices = (tiers || []).map(t => t.unit_price).filter(p => typeof p === 'number' && p > 0);
    if (basePrice != null)
        prices.push(basePrice);
    return prices.length ? Math.min(...prices) : null;
}
/** "Save up to N%": from the 1-piece price down to the best slab price. */
export function savingsPercent(basePrice, best) {
    if (!basePrice || !best || best >= basePrice)
        return 0;
    return Math.round(((basePrice - best) / basePrice) * 100);
}
/** Slab rows with readable ranges, e.g. [{ from: 1, to: 9, price: 549 }, …, { from: 100, to: null, price: 399 }]. */
export function describeSlabs(basePrice, tiers) {
    const sorted = [...(tiers || [])].filter(t => t.unit_price > 0).sort((a, b) => a.min_qty - b.min_qty);
    if (basePrice != null && (sorted.length === 0 || sorted[0].min_qty > 1))
        sorted.unshift({ min_qty: 1, unit_price: basePrice });
    return sorted.map((t, i) => ({ from: t.min_qty, to: i < sorted.length - 1 ? sorted[i + 1].min_qty - 1 : null, price: t.unit_price }));
}
/**
 * Validates quantity against positive integer, MOQ and increment rules.
 */
export function validateQuantityRules(quantity, minQuantity = 1, orderIncrement = 1) {
    const num = Number(quantity);
    if (typeof quantity === 'boolean' || quantity === null || quantity === undefined) {
        return { isValid: false, error: 'Quantity is required' };
    }
    if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0) {
        return { isValid: false, error: 'Quantity must be a positive whole number (no fractions or negatives)' };
    }
    const min = Math.max(1, minQuantity || 1);
    const inc = Math.max(1, orderIncrement || 1);
    if (num < min) {
        return { isValid: false, error: `Minimum order quantity is ${min} pieces` };
    }
    if ((num - min) % inc !== 0) {
        return {
            isValid: false,
            error: `Quantity must increase in multiples of ${inc} after minimum quantity of ${min}`
        };
    }
    return { isValid: true, validatedQuantity: num };
}
/**
 * Validates monetary amount in rupees and converts to integer paise.
 * Rejects anything above MAX_FRAME_PRICE (a sanity cap, not a range promise).
 */
export function validatePricePaise(priceInRupees, maxPricePaise = MAX_FRAME_PRICE_PAISE) {
    if (priceInRupees === null || priceInRupees === undefined || priceInRupees === '') {
        return { isValid: false, error: 'Price is required' };
    }
    const num = Number(priceInRupees);
    if (!Number.isFinite(num) || num <= 0) {
        return { isValid: false, error: 'Price must be a positive finite number' };
    }
    // Prevent fractions of paise (more than 2 decimal places)
    const rounded = Math.round(num * 100);
    if (Math.abs(num * 100 - rounded) > 0.0001) {
        return { isValid: false, error: 'Price cannot exceed 2 decimal places' };
    }
    if (rounded > maxPricePaise) {
        return {
            isValid: false,
            error: `Price ₹${num} is above the ₹${maxPricePaise / 100} limit`
        };
    }
    return { isValid: true, paise: rounded };
}
