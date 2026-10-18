import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '@swayari/shared';
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
      return Array.isArray(parsed) ? parsed : [];
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
      if (index === -1) return [...prev, newItem];
      return prev.map((it, i) => (i === index ? { ...it, quantity: it.quantity + newItem.quantity } : it));
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
        return { ...it, quantity: Math.max(min, Math.min(999, Math.round(quantity))) };
      })
    );
  }

  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
  const priced = items.filter(it => it.indicativePrice !== null && it.indicativePrice !== undefined);
  const subtotal = priced.length ? priced.reduce((sum, it) => sum + (it.indicativePrice as number) * it.quantity, 0) : null;
  const hasUnpricedItems = priced.length !== items.length;

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
