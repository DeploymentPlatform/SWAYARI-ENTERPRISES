import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, ShieldAlert, FileText, CheckCircle2, Clock, Send, Plus, Trash2 } from 'lucide-react';
import { Order, formatPrice, formatDate, getStatusMeta, ORDER_STATUSES } from '@swayari/shared';

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ orderId, onClose, onOrderUpdated }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<string>('');
  const [internalNoteText, setInternalNoteText] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Quotation Editor State
  const [isCreatingQuotation, setIsCreatingQuotation] = useState(false);
  const [quotationItems, setQuotationItems] = useState<Array<{ productId: string; productName: string; quantity: number; agreedUnitPrice: number }>>([]);
  const [shippingCharge, setShippingCharge] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [quotationNotes, setQuotationNotes] = useState<string>('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  async function fetchOrderDetails() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const data = await res.json();
        const o: Order = data.order;
        setOrder(o);
        setNewStatus(o.status);

        // Pre-populate quotation items with initial requested items
        if (o.items) {
          setQuotationItems(
            o.items.map(it => ({
              productId: it.productId,
              productName: it.name,
              quantity: it.quantity,
              agreedUnitPrice: it.indicativePrice || 0
            }))
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(status: string) {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setNewStatus(status);
        await fetchOrderDetails();
        onOrderUpdated();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleAddInternalNote(e: React.FormEvent) {
    e.preventDefault();
    if (!internalNoteText.trim()) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNote: internalNoteText.trim() })
      });
      if (res.ok) {
        setInternalNoteText('');
        await fetchOrderDetails();
      }
    } catch (err) {
      console.error('Failed to add internal note:', err);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleIssueQuotation(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'quoted',
          quotation: {
            items: quotationItems,
            shippingCharge,
            taxAmount,
            quotationNotes: quotationNotes.trim() || null
          }
        })
      });
      if (res.ok) {
        setIsCreatingQuotation(false);
        await fetchOrderDetails();
        onOrderUpdated();
      }
    } catch (err) {
      console.error('Failed to issue quotation:', err);
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center text-xs text-charcoal-muted">
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-ivory-border shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-ivory-border flex items-center justify-between bg-ivory/40">
          <div>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-base font-bold text-burgundy">{order.id}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ivory-muted text-charcoal border border-ivory-border">
                {getStatusMeta(order.status).label}
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Submitted on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Workflow Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-charcoal-muted">Update Status:</span>
              <select
                value={newStatus}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className="text-xs font-medium py-1.5 px-3 rounded-lg border border-ivory-border bg-white text-charcoal focus:border-burgundy focus:outline-none"
              >
                {ORDER_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-charcoal-muted hover:text-burgundy rounded-full hover:bg-ivory"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          
          {/* Customer Details Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-ivory/60 p-4 sm:p-5 rounded-2xl border border-ivory-border">
            <div className="space-y-2">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-charcoal">
                Customer Information
              </h4>
              <p className="text-sm font-semibold text-charcoal">{order.customerName}</p>
              <p className="flex items-center space-x-1.5 text-charcoal-muted">
                <Phone className="w-3.5 h-3.5 text-burgundy" />
                <a href={`tel:+91${order.customerPhone}`} className="hover:underline font-mono">
                  +91 {order.customerPhone}
                </a>
              </p>
              <p className="flex items-center space-x-1.5 text-charcoal-muted">
                <Mail className="w-3.5 h-3.5 text-burgundy" />
                <span>{order.customerEmail}</span>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-charcoal">
                Delivery Address
              </h4>
              <p className="flex items-start space-x-1.5 text-charcoal-muted font-light leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-burgundy flex-shrink-0 mt-0.5" />
                <span>
                  {order.deliveryAddress}, {order.deliveryCity}, {order.deliveryState} — <span className="font-mono">{order.deliveryPincode}</span>
                </span>
              </p>
              {order.customerNotes && (
                <div className="p-2.5 rounded bg-white border border-ivory-border text-charcoal-muted italic">
                  <strong>Customer Note:</strong> {order.customerNotes}
                </div>
              )}
            </div>
          </div>

          {/* Requested Items Snapshot (IMMUTABLE) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-ivory-border pb-2">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-charcoal">
                Initial Requested Items (Immutable Snapshot)
              </h4>
              <span className="text-[11px] text-charcoal-light">
                Indicative Subtotal: <strong className="text-burgundy">{order.initialIndicativeSubtotal ? formatPrice(order.initialIndicativeSubtotal) : 'Price on Request'}</strong>
              </span>
            </div>

            <div className="space-y-2">
              {order.items?.map(it => (
                <div key={it.id} className="p-3 bg-white rounded-xl border border-ivory-border flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={it.imageUrl || '/assets/demo/sample_product_1.jpeg'}
                      alt={it.name}
                      className="w-12 h-14 object-cover rounded bg-ivory-muted"
                    />
                    <div>
                      <p className="font-semibold text-charcoal">{it.name}</p>
                      <p className="text-charcoal-muted text-[11px]">
                        SKU: {it.sku} • Qty: {it.quantity} {it.variant ? `• Option: ${it.variant}` : ''}
                      </p>
                      {it.customisationNote && (
                        <p className="text-burgundy italic text-[11px]">Note: {it.customisationNote}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-burgundy">
                      {it.indicativePrice ? formatPrice(it.indicativePrice * it.quantity) : 'Price on Request'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Quotation History & Creator */}
          <div className="space-y-3 pt-3 border-t border-ivory-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-burgundy" />
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-charcoal">
                  Studio Quotation Revisions
                </h4>
              </div>
              {!isCreatingQuotation && (
                <button
                  onClick={() => setIsCreatingQuotation(true)}
                  className="px-3 py-1.5 rounded-lg bg-burgundy text-white text-xs font-medium hover:bg-burgundy-hover flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue Quotation Revision</span>
                </button>
              )}
            </div>

            {/* Quotation Editor Form */}
            {isCreatingQuotation && (
              <form onSubmit={handleIssueQuotation} className="bg-ivory/70 p-4 rounded-2xl border border-burgundy/20 space-y-4">
                <h5 className="font-semibold text-charcoal">Create Official Quotation Revision</h5>

                <div className="space-y-2">
                  {quotationItems.map((qIt, qIdx) => (
                    <div key={qIdx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-ivory-border">
                      <div className="col-span-6 font-medium text-charcoal truncate">{qIt.productName}</div>
                      <div className="col-span-2 text-center text-charcoal-muted">x{qIt.quantity}</div>
                      <div className="col-span-4 flex items-center space-x-1">
                        <span className="text-charcoal-light">₹</span>
                        <input
                          type="number"
                          required
                          value={qIt.agreedUnitPrice}
                          onChange={e => {
                            const val = Number(e.target.value) || 0;
                            const updated = [...quotationItems];
                            updated[qIdx].agreedUnitPrice = val;
                            setQuotationItems(updated);
                          }}
                          className="w-full text-xs p-1.5 border border-ivory-border rounded focus:border-burgundy focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-charcoal block mb-1">Shipping &amp; Insurance Charge (₹)</label>
                    <input
                      type="number"
                      value={shippingCharge}
                      onChange={e => setShippingCharge(Number(e.target.value) || 0)}
                      className="w-full text-xs p-2 border border-ivory-border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-charcoal block mb-1">Tax Amount (₹)</label>
                    <input
                      type="number"
                      value={taxAmount}
                      onChange={e => setTaxAmount(Number(e.target.value) || 0)}
                      className="w-full text-xs p-2 border border-ivory-border rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-charcoal block mb-1">Quotation Notes for Customer</label>
                  <input
                    type="text"
                    value={quotationNotes}
                    onChange={e => setQuotationNotes(e.target.value)}
                    placeholder="E.g. Express courier included; delivery promised by Oct 24th."
                    className="w-full text-xs p-2 border border-ivory-border rounded-lg bg-white"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingQuotation(false)}
                    className="px-4 py-2 rounded-lg border border-ivory-border text-charcoal hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-lg bg-burgundy text-white font-medium hover:bg-burgundy-hover"
                  >
                    Publish Revision to Client Account
                  </button>
                </div>
              </form>
            )}

            {/* List of Previous Quotations */}
            {order.quotations && order.quotations.length > 0 ? (
              <div className="space-y-3">
                {order.quotations.map(q => (
                  <div key={q.id} className="p-4 rounded-xl bg-white border border-ivory-border space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-ivory-border/60">
                      <span className="font-semibold text-charcoal">Revision #{q.revisionNumber}</span>
                      <span className="text-charcoal-light">Issued on {formatDate(q.createdAt)}</span>
                    </div>
                    <div className="space-y-1">
                      {q.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-charcoal-muted">
                          <span>{it.productName} (x{it.quantity})</span>
                          <span>{formatPrice(it.agreedUnitPrice * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-ivory-border flex justify-between font-bold text-burgundy text-sm">
                      <span>Total (incl. ₹{q.shippingCharge} shipping):</span>
                      <span>{formatPrice(q.totalQuotedAmount)}</span>
                    </div>
                    {q.notes && (
                      <p className="text-[11px] text-charcoal-muted italic pt-1">
                        Note: {q.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-charcoal-muted italic">No official quotation published yet.</p>
            )}
          </div>

          {/* CONFIDENTIAL INTERNAL STAFF NOTES */}
          <div className="space-y-3 pt-3 border-t border-ivory-border">
            <div className="flex items-center space-x-2 text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider">
                Confidential Staff Internal Notes (Never Visible to Customers)
              </h4>
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddInternalNote} className="flex space-x-2">
              <input
                type="text"
                value={internalNoteText}
                onChange={e => setInternalNoteText(e.target.value)}
                placeholder="Log internal note (e.g. Called customer, agreed to 5% discount, warehouse checking stock)..."
                className="flex-1 text-xs p-2.5 rounded-lg border border-ivory-border bg-ivory-light focus:outline-none focus:border-burgundy"
              />
              <button
                type="submit"
                disabled={isUpdating || !internalNoteText.trim()}
                className="px-4 py-2.5 rounded-lg bg-charcoal hover:bg-black text-white text-xs font-medium flex items-center space-x-1"
              >
                <Send className="w-3 h-3" />
                <span>Log Note</span>
              </button>
            </form>

            {/* Internal Notes History Thread */}
            {order.internalNotes && order.internalNotes.length > 0 ? (
              <div className="space-y-2 bg-amber-50/50 p-4 rounded-xl border border-amber-200/50">
                {order.internalNotes.map(n => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-white border border-ivory-border space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-charcoal">{n.adminName}</span>
                      <span className="text-charcoal-light font-mono">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="text-charcoal leading-relaxed">{n.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-charcoal-light text-[11px] italic">No internal staff notes recorded yet.</p>
            )}
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-ivory-border bg-ivory/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-charcoal hover:bg-black text-white text-xs font-medium"
          >
            Close Order
          </button>
        </div>

      </div>
    </div>
  );
};
