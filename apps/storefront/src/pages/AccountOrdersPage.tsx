import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order, formatPrice, formatDate, getStatusMeta } from '@swayari/shared';
import { Package, ArrowRight, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface AccountOrdersPageProps {
  navigate: (path: string) => void;
}

export const AccountOrdersPage: React.FC<AccountOrdersPageProps> = ({ navigate }) => {
  const { user, initiateGoogleSignIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, Order>>({});

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/my');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleOrder(orderId: string) {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);
    if (!expandedDetails[orderId]) {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          setExpandedDetails(prev => ({ ...prev, [orderId]: data.order }));
        }
      } catch (err) {
        console.error('Failed to load order details:', err);
      }
    }
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-gold mx-auto stroke-[1.5]" />
        <h2 className="font-serif text-2xl font-bold text-charcoal">Sign In to View Your Requests</h2>
        <p className="text-xs text-charcoal-muted font-light leading-relaxed">
          Sign in with your verified Google account to view your past enquiries, studio quotation revisions, and dispatch statuses.
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 pb-4 border-b border-ivory-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
            My Order Requests
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 font-light">
            Account: {user.name} ({user.email})
          </p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-white border border-ivory-border text-xs text-charcoal hover:bg-ivory transition-colors"
        >
          <span>Explore New Pieces</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-28 bg-white rounded-xl border border-ivory-border p-4" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ivory-border p-12 text-center max-w-lg mx-auto shadow-subtle space-y-4">
          <Package className="w-12 h-12 text-charcoal-light mx-auto stroke-[1.5]" />
          <h3 className="font-serif text-lg font-semibold text-charcoal">No Order Requests Yet</h3>
          <p className="text-xs text-charcoal-muted font-light leading-relaxed">
            You haven't submitted any bespoke order requests yet. Browse our catalogue to enquire about sanctified brassware and gifting.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-md bg-burgundy text-white text-xs font-medium hover:bg-burgundy-hover"
          >
            <span>Browse Catalogue</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const statusMeta = getStatusMeta(order.status);
            const isExpanded = expandedOrderId === order.id;
            const details = expandedDetails[order.id];

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-ivory-border shadow-subtle overflow-hidden transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleOrder(order.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-ivory-light/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs sm:text-sm font-bold text-burgundy">
                        {order.id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-ivory-muted text-charcoal border border-ivory-border">
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-charcoal-light font-light pt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Submitted on {formatDate(order.createdAt)}</span>
                      </span>
                      <span>•</span>
                      <span>Delivery: {order.deliveryCity}, {order.deliveryState}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-charcoal-light uppercase block">Indicative Subtotal:</span>
                      <span className="font-serif text-sm sm:text-base font-semibold text-charcoal">
                        {order.initialIndicativeSubtotal ? formatPrice(order.initialIndicativeSubtotal) : 'Price on Request'}
                      </span>
                    </div>

                    <button
                      className="p-1 text-charcoal-muted hover:text-burgundy"
                      aria-label={isExpanded ? 'Collapse order' : 'Expand order'}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-ivory-border/70 p-5 sm:p-6 bg-ivory/40 space-y-6 animate-fadeIn">
                    
                    {/* Items Snapshot */}
                    <div className="space-y-3">
                      <h4 className="font-serif text-xs font-semibold uppercase tracking-wider text-charcoal">
                        Requested Pieces
                      </h4>
                      {details?.items ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {details.items.map(it => (
                            <div
                              key={it.id}
                              className="p-3 bg-white rounded-xl border border-ivory-border flex items-center space-x-3"
                            >
                              <img
                                src={it.imageUrl || '/assets/demo/sample_product_1.jpeg'}
                                alt={it.name}
                                className="w-12 h-14 object-cover rounded bg-ivory-muted"
                              />
                              <div className="flex-1 text-xs">
                                <p className="font-medium text-charcoal leading-snug">{it.name}</p>
                                <p className="text-[11px] text-charcoal-muted mt-0.5">
                                  Qty: {it.quantity} {it.variant ? `• ${it.variant}` : ''}
                                </p>
                                <p className="font-serif text-burgundy font-semibold mt-1">
                                  {it.indicativePrice ? formatPrice(it.indicativePrice * it.quantity) : 'Price on Request'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-charcoal-muted">Loading items details...</p>
                      )}
                    </div>

                    {/* Official Quotation Revisions if published by Studio */}
                    {details?.quotations && details.quotations.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-ivory-border/60">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-burgundy" />
                          <h4 className="font-serif text-xs font-semibold uppercase tracking-wider text-charcoal">
                            Official Studio Quotation (Revision #{details.quotations[0].revisionNumber})
                          </h4>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-ivory-border space-y-3 text-xs">
                          <div className="space-y-1.5">
                            {details.quotations[0].items.map((qItem, qIdx) => (
                              <div key={qIdx} className="flex justify-between py-1 border-b border-ivory-border/40">
                                <span className="text-charcoal">{qItem.productName} (x{qItem.quantity})</span>
                                <span className="font-serif font-medium text-charcoal">
                                  {formatPrice(qItem.agreedUnitPrice * qItem.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 space-y-1 text-charcoal-muted">
                            <div className="flex justify-between">
                              <span>Shipping &amp; Insurance:</span>
                              <span className="font-medium text-charcoal">
                                {details.quotations[0].shippingCharge ? formatPrice(details.quotations[0].shippingCharge) : 'Included'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-burgundy pt-1 border-t border-ivory-border">
                              <span>Total Confirmed Amount:</span>
                              <span>{formatPrice(details.quotations[0].totalQuotedAmount)}</span>
                            </div>
                          </div>

                          {details.quotations[0].notes && (
                            <p className="text-[11px] text-charcoal-muted italic pt-1 border-t border-ivory-border/40">
                              Studio Note: {details.quotations[0].notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Delivery Information */}
                    <div className="pt-3 border-t border-ivory-border/60 text-xs text-charcoal-muted">
                      <span className="font-semibold text-charcoal block mb-0.5">Delivery Address:</span>
                      <p className="font-light">
                        {order.deliveryAddress}, {order.deliveryCity}, {order.deliveryState} - {order.deliveryPincode}
                      </p>
                      {order.customerNotes && (
                        <p className="mt-1 font-light italic">
                          Special Note: {order.customerNotes}
                        </p>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
