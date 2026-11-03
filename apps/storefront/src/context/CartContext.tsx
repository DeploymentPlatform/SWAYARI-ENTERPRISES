import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, calculateCartTotals, priceCartItems, resolveVariantPricing } from '@swayari/shared';
import { useAuth } from './AuthContext';
import { withPreview } from '../lib/preview';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  /** Sum of known indicative prices; null when no item has a price. */
  subtotal: number | null;
  hasUnpricedItems: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: string | null) => void;
  updateQuantity: (productId: string, variant: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  lastAddedName: string | null;
}

const STORAGE_KEY = 'swayari_cart';
/** Per line; bigger orders are a special quote. */
export const MAX_LINE_QTY = 5000;
const CartContext = createContext<CartContextType | undefined>(undefined);

const sameLine = (a: CartItem, productId: string, variant?: string | null) =>
  a.productId === productId && (a.selectedVariant || null) === (variant || null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, consumePendingAddToCart } = useAuth();
  // Stored lines keep their 1-piece price and slabs; the per-piece price is worked out from the
  // total quantity of each product + size across the whole cart (see priceCartItems).
  const [rawItems, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((it: CartItem) => ({ ...it, basePrice: it.basePrice ?? it.indicativePrice }));
    } catch {
      return [];
    }
  });
  const items = priceCartItems(rawItems);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawItems));
    } catch {
      /* storage unavailable — cart still works for this visit */
    }
  }, [rawItems]);

  // A saved cart can outlive a price change or a retired design: refresh it from the live catalogue once per visit.
  useEffect(() => {
    if (rawItems.length === 0) return;
    let cancelled = false;
    fetch(withPreview('/api/products'))
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        const live: Product[] | undefined = data?.products;
        if (cancelled || !Array.isArray(live) || live.length === 0) return;
        const byId = new Map(live.map(p => [p.id, p]));
        setItems(prev =>
          prev
            .filter(it => {
              const p = byId.get(it.productId);
              // A size that no longer exists can't be priced: drop the line
              return !!p && (!it.selectedVariant || !p.variants?.length || p.variants.some(v => v.name === it.selectedVariant));
            })
            .map(it => {
              const p = byId.get(it.productId)!;
              const pricing = resolveVariantPricing(p, it.selectedVariant);
              return {
                ...it,
                name: p.name,
                slug: p.slug,
                image: p.images?.[0] || it.image,
                basePrice: pricing.basePrice,
                indicativePrice: pricing.basePrice,
                bulkTiers: pricing.tiers,
                mrp: pricing.mrp,
                priceGroup: p.priceGroup ?? null
              };
            })
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Resume the add the visitor intended before signing in — exactly once.
  useEffect(() => {
    if (!user) return;
    const pending = consumePendingAddToCart();
    if (pending) addItem(pending);
  }, [user]);

  function addItem(newItem: CartItem) {
    setItems(prev => {
      const base = newItem.basePrice ?? newItem.indicativePrice;
      const index = prev.findIndex(it => sameLine(it, newItem.productId, newItem.selectedVariant));
      if (index === -1) return [...prev, { ...newItem, basePrice: base }];
      return prev.map((it, i) =>
        i === index ? { ...it, quantity: Math.min(MAX_LINE_QTY, it.quantity + newItem.quantity) } : it
      );
    });
    setLastAddedName(newItem.name);
    setIsDrawerOpen(true);
  }

  function removeItem(productId: string, variant?: string | null) {
    setItems(prev => prev.filter(it => !sameLine(it, productId, variant)));
  }

  function updateQuantity(productId: string, variant: string | null | undefined, quantity: number) {
    setItems(prev =>
      prev.map(it => {
        if (!sameLine(it, productId, variant)) return it;
        const min = it.minQuantity || 1;
        const inc = it.orderIncrement || 1;
        const raw = Math.max(min, Math.min(MAX_LINE_QTY, Math.round(quantity)));
        // Align to increment
        const rem = (raw - min) % inc;
        const cleanQty = rem === 0 ? raw : raw + (inc - rem);
        return { ...it, quantity: cleanQty };
      })
    );
  }

  const totals = calculateCartTotals(items);
  const itemCount = totals.itemCount;
  const subtotal = totals.subtotal;
  const hasUnpricedItems = totals.hasUnpricedItems;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        hasUnpricedItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart: () => setItems([]),
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        lastAddedName
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
