// SWAYARI ENTERPRISES - Cart & Request List Management

const CART_STORAGE_KEY = 'swayari_request_cart_v1';

export const Cart = {
  getItems() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (_) {
      return [];
    }
  },

  saveItems(items) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
    this.notifyUpdate();
  },

  addItem(product, quantity = 1, variant = null, note = '') {
    const items = this.getItems();
    const qty = parseInt(quantity, 10) || 1;
    const variantId = variant?.id || null;
    const variantName = variant?.name || null;
    const unitPrice = variant?.indicative_price !== undefined ? variant.indicative_price : product.indicativePrice;

    const existingIndex = items.findIndex(it => 
      it.productId === product.id && it.variantId === variantId
    );

    if (existingIndex > -1) {
      items[existingIndex].quantity += qty;
      if (note) items[existingIndex].customisationNote = note;
    } else {
      items.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        imageUrl: product.primaryImage || (product.images && product.images[0]) || null,
        variantId: variantId,
        variantName: variantName,
        indicativePrice: unitPrice, // Can be null for "Price on Request"
        minQuantity: product.minQuantity || 1,
        quantity: qty,
        customisationNote: note || ''
      });
    }

    this.saveItems(items);
    return items;
  },

  updateQuantity(productId, variantId, quantity) {
    const items = this.getItems();
    const qty = parseInt(quantity, 10);
    const item = items.find(it => it.productId === productId && (it.variantId || null) === (variantId || null));
    
    if (item) {
      if (qty <= 0) {
        return this.removeItem(productId, variantId);
      }
      item.quantity = qty;
      this.saveItems(items);
    }
    return items;
  },

  updateItemNote(productId, variantId, note) {
    const items = this.getItems();
    const item = items.find(it => it.productId === productId && (it.variantId || null) === (variantId || null));
    if (item) {
      item.customisationNote = note;
      this.saveItems(items);
    }
  },

  removeItem(productId, variantId) {
    let items = this.getItems();
    items = items.filter(it => !(it.productId === productId && (it.variantId || null) === (variantId || null)));
    this.saveItems(items);
    return items;
  },

  clear() {
    localStorage.removeItem(CART_STORAGE_KEY);
    this.notifyUpdate();
  },

  getTotalCount() {
    const items = this.getItems();
    return items.reduce((sum, it) => sum + (it.quantity || 1), 0);
  },

  getIndicativeSubtotal() {
    const items = this.getItems();
    let total = 0;
    let hasPriceOnRequest = false;

    for (const it of items) {
      if (it.indicativePrice != null) {
        total += (it.indicativePrice * it.quantity);
      } else {
        hasPriceOnRequest = true;
      }
    }

    return {
      subtotal: total,
      hasPriceOnRequest
    };
  },

  notifyUpdate() {
    window.dispatchEvent(new CustomEvent('swayari:cart-updated', {
      detail: {
        count: this.getTotalCount(),
        items: this.getItems()
      }
    }));
  }
};
