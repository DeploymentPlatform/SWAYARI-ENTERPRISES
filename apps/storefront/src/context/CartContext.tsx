import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@swayari/shared';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: string | null) => void;
  updateQuantity: (productId: string, variant: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, consumePendingAddToCart } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('swayari_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('swayari_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [items]);

  // Handle post-login add-to-cart resumption (EXACTLY ONCE)
  useEffect(() => {
    if (user) {
      const pending = consumePendingAddToCart();
      if (pending) {
        addItem(pending);
        setIsDrawerOpen(true);
      }
    }
  }, [user]);

  function addItem(newItem: CartItem) {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        it => it.productId === newItem.productId && it.selectedVariant === newItem.selectedVariant
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
    setIsDrawerOpen(true);
  }

  function removeItem(productId: string, variant?: string | null) {
    setItems(prev => prev.filter(it => !(it.productId === productId && it.selectedVariant === variant)));
  }

  function updateQuantity(productId: string, variant: string | null | undefined, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId, variant);
      return;
    }
    setItems(prev =>
      prev.map(it => {
        if (it.productId === productId && it.selectedVariant === variant) {
          return { ...it, quantity };
        }
        return it;
      })
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

  // Compute indicative subtotal; if any item is "Price on request" (null), subtotal is informative
  const subtotal = items.reduce((sum, it) => {
    if (it.indicativePrice !== null && it.indicativePrice !== undefined) {
      return (sum || 0) + it.indicativePrice * it.quantity;
    }
    return sum;
  }, 0 as number | null);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
