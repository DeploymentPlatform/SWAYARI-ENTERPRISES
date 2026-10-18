import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, ORDER_DISCLAIMER_TEXT } from '@swayari/shared';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, AlertCircle, ArrowLeft } from 'lucide-react';

interface CartPageProps {
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const { user, initiateGoogleSignIn } = useAuth();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-ivory-muted mx-auto flex items-center justify-center text-charcoal-light">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-charcoal">Your Request List is Empty</h2>
        <p className="text-xs sm:text-sm text-charcoal-muted font-light max-w-md mx-auto">
          Explore our handcrafted devotional collection and add items to request custom pricing and shipping quotes.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-md bg-burgundy text-white text-xs sm:text-sm font-semibold hover:bg-burgundy-hover shadow-card transition-all"
        >
          <span>Explore Devotional Catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-ivory-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">Review Your Order Request</h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 font-light">
            You have selected {itemCount} handcrafted piece{itemCount > 1 ? 's' : ''} for studio enquiry.
          </p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-charcoal-muted hover:text-burgundy"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Browsing</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Items Table */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(item => (
            <div
              key={`${item.productId}-${item.selectedVariant || 'default'}`}
              className="bg-white p-4 sm:p-5 rounded-xl border border-ivory-border shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image || '/assets/demo/sample_product_1.jpeg'}
                  alt={item.name}
                  className="w-20 h-24 object-cover rounded-lg bg-ivory-muted flex-shrink-0"
                />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-charcoal-light font-medium">{item.sku}</p>
                  <h3 className="font-serif text-base font-medium text-charcoal">{item.name}</h3>
                  {item.selectedVariant && (
                    <p className="text-xs text-charcoal-muted mt-0.5">Finish: {item.selectedVariant}</p>
                  )}
                  {item.customisationNote && (
                    <p className="text-xs text-burgundy mt-1 italic font-light">
                      Customisation note: {item.customisationNote}
                    </p>
                  )}
                  <p className="text-xs text-charcoal-muted sm:hidden mt-2 font-serif font-semibold text-burgundy">
                    {item.indicativePrice ? formatPrice(item.indicativePrice * item.quantity) : 'Price on Request'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 pt-3 sm:pt-0 border-t sm:border-0 border-ivory-border/50">
                {/* Quantity controller */}
                <div className="flex items-center border border-ivory-border rounded-lg bg-ivory-light">
                  <button
                    onClick={() => updateQuantity(item.productId, item.selectedVariant, item.quantity - 1)}
                    className="p-1.5 text-charcoal-muted hover:text-burgundy"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-semibold text-charcoal min-w-[28px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.selectedVariant, item.quantity + 1)}
                    className="p-1.5 text-charcoal-muted hover:text-burgundy"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="hidden sm:block text-right min-w-[100px]">
                  <span className="font-serif text-sm font-semibold text-burgundy block">
                    {item.indicativePrice ? formatPrice(item.indicativePrice * item.quantity) : 'Price on Request'}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(item.productId, item.selectedVariant)}
                  className="text-charcoal-light hover:text-red-700 p-1.5 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Summary & Checkout Action */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-ivory-border shadow-card space-y-4">
            <h3 className="font-serif text-lg font-semibold text-charcoal pb-3 border-b border-ivory-border">
              Request Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-charcoal-muted">Selected Pieces:</span>
                <span className="font-semibold text-charcoal">{itemCount} items</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-charcoal-muted">Indicative Items Subtotal:</span>
                <span className="font-serif font-semibold text-burgundy text-sm">
                  {subtotal ? formatPrice(subtotal) : 'Price on Request'}
                </span>
              </div>
              <div className="flex justify-between py-1 text-charcoal-light">
                <span>Shipping &amp; Insurance:</span>
                <span>Calculated by team</span>
              </div>
            </div>

            {/* MANDATORY DISCLAIMER BOX */}
            <div className="bg-ivory-muted/70 rounded-xl p-4 border border-ivory-border flex items-start space-x-2.5 text-xs text-charcoal-muted leading-relaxed">
              <AlertCircle className="w-4 h-4 text-burgundy flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-light">
                {ORDER_DISCLAIMER_TEXT}
              </p>
            </div>

            {user ? (
              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center space-x-2 py-4 rounded-md bg-burgundy hover:bg-burgundy-hover text-white text-sm font-semibold tracking-wide shadow-card transition-all"
              >
                <span>Proceed to Order Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => initiateGoogleSignIn()}
                className="w-full flex items-center justify-center space-x-2 py-4 rounded-md bg-burgundy hover:bg-burgundy-hover text-white text-sm font-semibold tracking-wide shadow-card transition-all"
              >
                <span>Sign in with Google to Submit Request</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
