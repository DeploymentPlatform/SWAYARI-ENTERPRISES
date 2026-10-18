import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, PhoneCall, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Order, formatPrice, formatDate, getStatusMeta } from '@swayari/shared';

interface OrderConfirmationPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderId, navigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  async function fetchOrderDetails() {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Failed to load order confirmation:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="bg-white rounded-3xl border border-ivory-border shadow-card p-6 sm:p-10 space-y-8 text-center sm:text-left">
        
        {/* Success Icon & Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs uppercase tracking-widest text-burgundy font-semibold">
            Order Request Received
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
            Thank You for Entrusting SWAYARI
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-lg mx-auto font-light leading-relaxed">
            Your request has been securely recorded. Our studio team will review stock, packaging, and courier availability and contact you shortly.
          </p>
        </div>

        {/* Reference Banner */}
        <div className="bg-ivory p-4 sm:p-6 rounded-2xl border border-ivory-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-charcoal-light font-medium block">
              Order Request Reference:
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-burgundy tracking-wide">
              {orderId}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-charcoal-light font-medium block">
              Current Status:
            </span>
            <span className="inline-block mt-0.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              New Request Received
            </span>
          </div>
        </div>

        {/* Order Details Preview */}
        {order && (
          <div className="space-y-4 text-xs text-left">
            <h3 className="font-serif text-base font-semibold text-charcoal border-b border-ivory-border pb-2">
              Requested Items Snapshot
            </h3>

            <div className="space-y-3">
              {order.items?.map(it => (
                <div key={it.id} className="flex items-center justify-between p-3 rounded-xl bg-ivory-light border border-ivory-border">
                  <div className="flex items-center space-x-3">
                    <img
                      src={it.imageUrl || '/assets/demo/sample_product_1.jpeg'}
                      alt={it.name}
                      className="w-12 h-14 object-cover rounded bg-ivory-muted"
                    />
                    <div>
                      <p className="font-medium text-charcoal">{it.name}</p>
                      <p className="text-charcoal-muted text-[11px]">
                        Qty: {it.quantity} {it.variant ? `• Option: ${it.variant}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-serif font-semibold text-burgundy">
                    {it.indicativePrice ? formatPrice(it.indicativePrice * it.quantity) : 'Price on Request'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between text-xs font-medium text-charcoal">
              <span>Indicative Subtotal:</span>
              <span className="font-serif text-sm font-bold text-burgundy">
                {order.indicativeSubtotal ? formatPrice(order.indicativeSubtotal) : 'Price on Request'}
              </span>
            </div>
          </div>
        )}

        {/* Next Steps Card */}
        <div className="bg-ivory-muted/70 p-5 rounded-2xl border border-ivory-border text-left space-y-3">
          <h4 className="font-serif text-sm font-semibold text-charcoal flex items-center space-x-2">
            <PhoneCall className="w-4 h-4 text-burgundy" />
            <span>What happens next?</span>
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-charcoal-muted font-light leading-relaxed">
            <li>Our studio curator reviews your selected dimensions, alloy finishes, and delivery pin code.</li>
            <li>We will call or message your registered phone number to confirm final pricing, festive gift packaging, and express courier logistics.</li>
            <li>Once mutually confirmed, an official quotation revision will be published to your client account.</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate('/orders')}
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold tracking-wide shadow-sm"
          >
            Track in My Order History
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto px-6 py-3 rounded-md border border-ivory-border bg-white hover:bg-ivory-muted text-charcoal text-xs font-medium"
          >
            Browse More Pieces
          </button>
        </div>

      </div>
    </div>
  );
};
