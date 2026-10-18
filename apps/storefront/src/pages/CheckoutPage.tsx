import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, ORDER_DISCLAIMER_TEXT, validateOrderSubmission } from '@swayari/shared';
import { ShieldCheck, AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { items, subtotal, clearCart } = useCart();
  const { user, initiateGoogleSignIn } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Generate or retrieve an idempotency key for this session submission
  const [idempotencyKey] = useState(() => 'req-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now());

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Sign In Required</h2>
        <p className="text-xs text-charcoal-muted font-light leading-relaxed">
          Please sign in with your verified Google account to submit an order request and track progress.
        </p>
        <button
          onClick={() => initiateGoogleSignIn()}
          className="w-full py-3.5 rounded-md bg-burgundy text-white text-xs font-semibold hover:bg-burgundy-hover shadow-sm"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal">No Items in Request</h2>
        <p className="text-xs text-charcoal-muted font-light">
          Your request list is currently empty. Please select products from the catalogue.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-md bg-burgundy text-white text-xs font-medium hover:bg-burgundy-hover"
        >
          Browse Catalogue
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const payload = {
      idempotencyKey,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryPincode,
      customerNotes,
      items: items.map(it => ({
        productId: it.productId,
        productSku: it.sku,
        productName: it.name,
        selectedVariant: it.selectedVariant || null,
        quantity: it.quantity,
        customisationNote: it.customisationNote
      }))
    };

    const validation = validateOrderSubmission(payload);
    if (!validation.isValid) {
      const errMap: Record<string, string> = {};
      validation.errors.forEach(err => {
        errMap[err.field] = err.message;
      });
      setFormErrors(errMap);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server rejected order request. Please review details.');
      }

      // Order saved confirmed!
      clearCart();
      navigate(`/order-confirmation/${data.orderId}`);
    } catch (err: any) {
      console.error('Order submission failed:', err);
      // PRESERVE CART and display friendly retry error
      setServerError(err.message || 'Unable to save order request. Your items remain preserved in your bag.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button
        onClick={() => navigate('/cart')}
        className="inline-flex items-center space-x-1.5 text-xs text-charcoal-muted hover:text-burgundy transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Cart Review</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Form: Contact & Delivery Information */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
              Contact &amp; Delivery Information
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 font-light">
              Our studio team will use this information to calculate courier logistics and confirm delivery schedules.
            </p>
          </div>

          {serverError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Submission Could Not Complete</p>
                <p className="mt-0.5">{serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Contact Group */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-ivory-border shadow-subtle space-y-4">
              <h3 className="font-serif text-base font-semibold text-charcoal border-b border-ivory-border/60 pb-2">
                1. Customer Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-charcoal block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full text-xs p-3 rounded-lg border border-ivory-border focus:border-burgundy focus:outline-none bg-ivory-light"
                  />
                  {formErrors.customerName && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-charcoal block mb-1">
                    Mobile Number (for Order Verification) *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-ivory-border bg-ivory-muted text-xs text-charcoal font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full text-xs p-3 rounded-r-lg border border-ivory-border focus:border-burgundy focus:outline-none bg-ivory-light"
                    />
                  </div>
                  {formErrors.customerPhone && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.customerPhone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-charcoal block mb-1">Verified Email</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs p-3 rounded-lg border border-ivory-border bg-ivory-muted text-charcoal-muted cursor-not-allowed"
                />
                <span className="text-[10px] text-charcoal-light mt-1 block">
                  Linked to your active Google account
                </span>
              </div>
            </div>

            {/* Delivery Address Group */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-ivory-border shadow-subtle space-y-4">
              <h3 className="font-serif text-base font-semibold text-charcoal border-b border-ivory-border/60 pb-2">
                2. Shipping &amp; Sanctuary Address
              </h3>

              <div>
                <label className="text-xs font-medium text-charcoal block mb-1">
                  Street Address / Apartment / Landmark *
                </label>
                <textarea
                  required
                  rows={3}
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="House/Flat number, building name, street, nearby landmark"
                  className="w-full text-xs p-3 rounded-lg border border-ivory-border focus:border-burgundy focus:outline-none bg-ivory-light"
                />
                {formErrors.deliveryAddress && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.deliveryAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-charcoal block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={deliveryCity}
                    onChange={e => setDeliveryCity(e.target.value)}
                    placeholder="E.g. Hyderabad"
                    className="w-full text-xs p-3 rounded-lg border border-ivory-border focus:border-burgundy focus:outline-none bg-ivory-light"
                  />
                  {formErrors.deliveryCity && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.deliveryCity}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-charcoal block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={deliveryState}
                    onChange={e => setDeliveryState(e.target.value)}
                    placeholder="E.g. Telangana"
                    className="w-full text-xs p-3 rounded-lg border border-ivory-border focus:border-burgundy focus:outline-none bg-ivory-light"
                  />
                  {formErrors.deliveryState && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.deliveryState}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-charcoal block mb-1">6-Digit PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={deliveryPincode}
                    onChange={e => setDeliveryPincode(e.target.value)}
                    placeholder="E.g. 500034"
                    className="w-full text-xs p-3 rounded-lg border border-ivory-border focus:border-burgundy focus:outline-none bg-ivory-light"
                  />
                  {formErrors.deliveryPincode && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.deliveryPincode}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-charcoal block mb-1">
                  Special Notes, Delivery Timing or Inscription Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={e => setCustomerNotes(e.target.value)}
                  placeholder="E.g. Auspicious delivery date required, housewarming gift wrapping, etc."
                  className="w-full text-xs p-3 rounded-lg border border-ivory-border focus:border-burgundy focus:outline-none bg-ivory-light"
                />
              </div>
            </div>

            {/* MANDATORY DISCLAIMER TEXT BOX (EXACT PHRASING) */}
            <div className="bg-ivory-muted/90 rounded-2xl p-5 border border-ivory-border shadow-subtle space-y-2">
              <div className="flex items-center space-x-2 text-burgundy font-medium text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-serif font-semibold text-sm">Non-Transactional Order Policy</span>
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed font-light pl-6">
                “{ORDER_DISCLAIMER_TEXT}”
              </p>
            </div>

            {/* Submission Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-4 rounded-md bg-burgundy hover:bg-burgundy-hover text-white text-sm font-semibold tracking-wide shadow-card hover:shadow-card-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Order Request Securely...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Order Request</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Sticky Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-ivory-border shadow-card sticky top-28 space-y-4">
            <h3 className="font-serif text-lg font-semibold text-charcoal border-b border-ivory-border pb-3">
              Request Overview ({items.length} piece{items.length > 1 ? 's' : ''})
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map(it => (
                <div key={`${it.productId}-${it.selectedVariant}`} className="flex space-x-3 text-xs">
                  <img
                    src={it.image || '/assets/demo/sample_product_1.jpeg'}
                    alt={it.name}
                    className="w-14 h-18 object-cover rounded bg-ivory-muted flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-charcoal line-clamp-1">{it.name}</p>
                    <p className="text-charcoal-muted text-[11px]">
                      Qty: {it.quantity} {it.selectedVariant ? `• ${it.selectedVariant}` : ''}
                    </p>
                    <p className="font-serif font-semibold text-burgundy mt-1">
                      {it.indicativePrice ? formatPrice(it.indicativePrice * it.quantity) : 'Price on Request'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-ivory-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Indicative Items Subtotal:</span>
                <span className="font-serif font-bold text-burgundy text-base">
                  {subtotal ? formatPrice(subtotal) : 'Price on Request'}
                </span>
              </div>
              <div className="flex justify-between text-charcoal-light">
                <span>Shipping, Insurance &amp; Taxes:</span>
                <span>Calculated manually by studio</span>
              </div>
            </div>

            <div className="pt-2 border-t border-ivory-border/70 text-[11px] text-charcoal-muted space-y-1">
              <p className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span>Zero online card payment processed at this stage.</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span>Our team calls you directly to confirm packaging &amp; delivery.</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
