import { useCallback, useEffect, useState } from 'react';
import { CartItem, Category, Product } from '@swayari/shared';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { previewCountOverride, withPreview } from './preview';

type Status = 'loading' | 'ready' | 'error';

export function useProducts(params: { category?: string; search?: string } = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    fetch(withPreview(`/api/products${qs ? `?${qs}` : ''}`))
      .then(res => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        let list: Product[] = data.products || [];
        const limit = previewCountOverride();
        if (limit) list = list.slice(0, limit);
        setProducts(list);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [params.category, params.search, attempt]);

  const retry = useCallback(() => setAttempt(a => a + 1), []);
  return { products, status, retry };
}

export function useCategories() {
  const [categories, setCategories] = useState<(Category & { productCount?: number })[]>([]);
  useEffect(() => {
    fetch(withPreview('/api/categories'))
      .then(res => (res.ok ? res.json() : { categories: [] }))
      .then(data => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);
  return categories;
}

export function toCartItem(product: Product, quantity?: number, extra: Partial<CartItem> = {}): CartItem {
  return {
    productId: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    image: product.images?.[0] || '',
    indicativePrice: product.indicativePrice,
    minQuantity: product.minQuantity || 1,
    quantity: Math.max(product.minQuantity || 1, quantity || product.minQuantity || 1),
    ...extra
  };
}

/**
 * Shared Add-to-bag behaviour: signed-out visitors are asked to sign in with Google and the
 * intended add is resumed once afterwards. Preview samples can only be added where the server
 * runs in local development (the order API rejects them everywhere else).
 */
export function useAddToBag() {
  const { user, initiateGoogleSignIn, config } = useAuth();
  const { addItem } = useCart();

  const canRequest = (product: Product) => !product.isDemo || config.devLoginAvailable;

  const add = (product: Product, quantity?: number, extra?: Partial<CartItem>) => {
    if (!canRequest(product)) return;
    const item = toCartItem(product, quantity, extra);
    if (!user) initiateGoogleSignIn(item, 'add');
    else addItem(item);
  };

  return { add, canRequest };
}
