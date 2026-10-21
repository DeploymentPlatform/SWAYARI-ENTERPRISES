import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, calculateEffectiveUnitPrice, calculateCartTotals } from '@swayari/shared';
import { useAuth } from './AuthContext';

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
const CartContext = createContext<CartContextType | undefined>(undefined);

const sameLine = (a: CartItem, productId: string, variant?: string | null) =>
  a.productId === productId && (a.selectedVariant || null) === (variant || null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, consumePendingAddToCart } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];
      // Re-normalize loaded items with bulk tiers
      return parsed.map((it: CartItem) => {
        const base = it.basePrice ?? it.indicativePrice;
        const effective = calculateEffectiveUnitPrice(base, it.bulkTiers, it.quantity);
        return { ...it, basePrice: base, indicativePrice: effective };
      });
    } catch {
      return [];
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — bag still works for this visit */
    }
  }, [items]);

  // Resume the add the visitor intended before signing in — exactly once.
  useEffect(() => {
    if (!user) return;
    const pending = consumePendingAddToCart();
    if (pending) addItem(pending);
  }, [user]);

  function addItem(newItem: CartItem) {
    setItems(prev => {
      const index = prev.findIndex(it => sameLine(it, newItem.productId, newItem.selectedVariant));
      if (index === -1) {
        const base = newItem.basePrice ?? newItem.indicativePrice;
        const effective = calculateEffectiveUnitPrice(base, newItem.bulkTiers, newItem.quantity);
        return [...prev, { ...newItem, basePrice: base, indicativePrice: effective }];
      }
      return prev.map((it, i) => {
        if (i !== index) return it;
        const newQty = it.quantity + newItem.quantity;
        const base = it.basePrice ?? it.indicativePrice ?? newItem.basePrice ?? newItem.indicativePrice;
        const tiers = it.bulkTiers || newItem.bulkTiers;
        const effective = calculateEffectiveUnitPrice(base, tiers, newQty);
        return {
          ...it,
          quantity: newQty,
          basePrice: base,
          bulkTiers: tiers,
          indicativePrice: effective
        };
      });
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
        const raw = Math.max(min, Math.min(999, Math.round(quantity)));
        // Align to increment
        const rem = (raw - min) % inc;
        const cleanQty = rem === 0 ? raw : raw + (inc - rem);
        const base = it.basePrice ?? it.indicativePrice;
        const effective = calculateEffectiveUnitPrice(base, it.bulkTiers, cleanQty);
        return { ...it, quantity: cleanQty, basePrice: base, indicativePrice: effective };
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
