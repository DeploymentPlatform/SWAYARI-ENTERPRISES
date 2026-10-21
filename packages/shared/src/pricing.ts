import { BulkPriceTier, CartItem, Product } from './types.js';
import { MAX_FRAME_PRICE, MAX_FRAME_PRICE_PAISE } from './constants.js';

/**
 * Calculates the effective unit price for a devotional frame based on quantity and bulk tiers.
 * If quantity reaches or exceeds a bulk tier's min_qty, that tier's unit_price is applied.
 * Otherwise, the base indicative price is returned.
 *
 * Example:
 * Base price ₹65, 100-pc tier ₹42:
 * calculateEffectiveUnitPrice(65, [{ min_qty: 100, unit_price: 42 }], 100) -> 42
 */
export function calculateEffectiveUnitPrice(
  basePrice: number | null | undefined,
  bulkTiers?: BulkPriceTier[] | null,
  quantity: number = 1
): number | null {
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
export function calculateLineSubtotal(unitPrice: number | null | undefined, quantity: number): number {
  if (unitPrice === null || unitPrice === undefined) {
    return 0;
  }
  const validQty = Math.max(0, Number(quantity) || 0);
  return unitPrice * validQty;
}

/**
 * Combines duplicate cart items sharing the same productId and selectedVariant.
 * Quantities are summed, and effective unit prices are updated according to bulk tiers.
 */
export function aggregateCartItems(items: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();

  for (const item of items) {
    const key = `${item.productId}:::${item.selectedVariant || ''}`;
    const existing = map.get(key);
    if (existing) {
      const combinedQty = existing.quantity + item.quantity;
      const basePrice = existing.basePrice ?? existing.indicativePrice;
      const effectivePrice = calculateEffectiveUnitPrice(basePrice, existing.bulkTiers, combinedQty);
      existing.quantity = combinedQty;
      existing.indicativePrice = effectivePrice;
      if (item.customisationNote && item.customisationNote !== existing.customisationNote) {
        existing.customisationNote = existing.customisationNote
          ? `${existing.customisationNote}; ${item.customisationNote}`
          : item.customisationNote;
      }
    } else {
      const basePrice = item.basePrice ?? item.indicativePrice;
      const effectivePrice = calculateEffectiveUnitPrice(basePrice, item.bulkTiers, item.quantity);
      map.set(key, {
        ...item,
        basePrice,
        indicativePrice: effectivePrice
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Calculates cart totals including itemsSubtotal, totalQuantity, and unpriced status.
 */
export function calculateCartTotals(items: CartItem[]): {
  subtotal: number | null;
  totalQuantity: number;
  itemCount: number;
  hasUnpricedItems: boolean;
} {
  const aggregated = aggregateCartItems(items);
  let subtotal = 0;
  let totalQuantity = 0;
  let pricedCount = 0;

  for (const item of aggregated) {
    totalQuantity += item.quantity;
    const basePrice = item.basePrice ?? item.indicativePrice;
    const effectivePrice = calculateEffectiveUnitPrice(basePrice, item.bulkTiers, item.quantity);
    if (effectivePrice !== null && effectivePrice !== undefined) {
      subtotal += effectivePrice * item.quantity;
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

/**
 * Validates quantity against positive integer, MOQ and increment rules.
 */
export function validateQuantityRules(
  quantity: unknown,
  minQuantity: number = 1,
  orderIncrement: number = 1
): { isValid: boolean; error?: string; validatedQuantity?: number } {
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
 * Strictly verifies <= 9,900 paise (₹99) for devotional frames.
 */
export function validatePricePaise(
  priceInRupees: unknown,
  maxPricePaise: number = MAX_FRAME_PRICE_PAISE
): { isValid: boolean; error?: string; paise?: number } {
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
      error: `Price ₹${num} exceeds maximum devotional frame limit of ₹${maxPricePaise / 100}`
    };
  }

  return { isValid: true, paise: rounded };
}
