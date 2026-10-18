import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, ORDER_DISCLAIMER_TEXT } from '@swayari/shared';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExplore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout, onExplore }) => {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { user, initiateGoogleSignIn } = useAuth();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-ivory shadow-2xl flex flex-col border-l border-ivory-border">
          {/* Drawer Header */}
          <div className="p-5 border-b border-ivory-border flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-burgundy" />
              <h2 className="font-serif text-lg font-semibold text-charcoal">Your Order Request</h2>
              <span className="text-xs text-charcoal-light font-normal">({itemCount} items)</span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-charcoal-muted hover:text-burgundy rounded-full hover:bg-ivory transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-ivory-muted mx-auto flex items-center justify-center text-charcoal-light">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-lg font-medium text-charcoal">Your request bag is empty</p>
                  <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
                    Explore our catalogue of handcrafted devotional art and bespoke gifting.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeDrawer();
                    onExplore();
                  }}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-burgundy text-white text-xs font-medium tracking-wide hover:bg-burgundy-hover transition-colors shadow-sm"
                >
                  <span>Browse Catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={`${item.productId}-${item.selectedVariant || 'default'}`}
                  className="bg-white p-3.5 rounded-lg border border-ivory-border shadow-subtle flex space-x-3.5"
                >
                  <img
                    src={item.image || '/assets/demo/sample_product_1.jpeg'}
                    alt={item.name}
                    className="w-18 h-22 object-cover rounded bg-ivory-muted flex-shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-charcoal-light font-medium">{item.sku}</p>
                          <h4 className="font-serif text-sm font-medium text-charcoal leading-snug line-clamp-2">
                            {item.name}
                          </h4>
                          {item.selectedVariant && (
                            <p className="text-[11px] text-charcoal-muted mt-0.5">Option: {item.selectedVariant}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.selectedVariant)}
                          className="text-charcoal-light hover:text-red-700 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-ivory-border/50">
                      <div className="flex items-center border border-ivory-border rounded bg-ivory-light">
                        <button
                          onClick={() => updateQuantity(item.productId, item.selectedVariant, item.quantity - 1)}
                          className="p-1 text-charcoal-muted hover:text-burgundy"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-charcoal min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.selectedVariant, item.quantity + 1)}
                          className="p-1 text-charcoal-muted hover:text-burgundy"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-serif text-xs font-semibold text-burgundy">
                          {item.indicativePrice ? formatPrice(item.indicativePrice * item.quantity) : 'Price on Request'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Mandatory Disclaimer */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-ivory-border space-y-4">
              {/* Indicative Subtotal */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-charcoal-light font-medium">Indicative Subtotal</span>
                  <p className="text-[11px] text-charcoal-muted">Excludes shipping &amp; customisation fees</p>
                </div>
                <span className="font-serif text-lg font-bold text-burgundy">
                  {subtotal ? formatPrice(subtotal) : 'Price on Request'}
                </span>
              </div>

              {/* MANDATORY DISCLAIMER BOX */}
              <div className="bg-ivory-muted/70 rounded-lg p-3 border border-ivory-border flex items-start space-x-2.5 text-xs text-charcoal-muted leading-relaxed">
                <AlertCircle className="w-4 h-4 text-burgundy flex-shrink-0 mt-0.5" />
                <p className="text-[11px] font-light">
                  {ORDER_DISCLAIMER_TEXT}
                </p>
              </div>

              {/* Proceed Action Button */}
              {user ? (
                <button
                  onClick={() => {
                    closeDrawer();
                    onProceedToCheckout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-md bg-burgundy hover:bg-burgundy-hover text-white text-sm font-medium tracking-wide shadow-card transition-all"
                >
                  <span>Review Order Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => initiateGoogleSignIn()}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-md bg-burgundy hover:bg-burgundy-hover text-white text-sm font-medium tracking-wide shadow-card transition-all"
                >
                  <span>Sign In with Google to Submit Request</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
