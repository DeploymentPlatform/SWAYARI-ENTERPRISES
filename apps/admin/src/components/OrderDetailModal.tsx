import React, { useEffect, useState } from 'react';
import { Lock, Mail, MapPin, Phone, Plus } from 'lucide-react';
import { formatDate, formatPrice, ORDER_STATUSES, MAX_FRAME_PRICE } from '@swayari/shared';
import { Drawer, ErrorBanner, StatusBadge, Thumb } from './ui';

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
  onOrderUpdated: () => void;
}

interface QuoteLine {
  productId: string;
  productName: string;
  quantity: number;
  agreedUnitPrice: number;
}

/** Order detail drawer. Customer-visible information and staff-only notes are kept apart. */
export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ orderId, onClose, onOrderUpdated }) => {
  const [order, setOrder] = useState<any>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [quoting, setQuoting] = useState(false);
  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [shipping, setShipping] = useState('0');
  const [tax, setTax] = useState('0');
  const [quoteNotes, setQuoteNotes] = useState('');

  async function load() {
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`);
      if (!res.ok) throw new Error();
      const o = (await res.json()).order;
      setOrder(o);
      const latest = o.quotations?.[0];
      setLines(
        latest
          ? latest.items.map((q: QuoteLine) => ({ ...q }))
          : (o.items || []).map((it: any) => ({ productId: it.productId, productName: it.name, quantity: it.quantity, agreedUnitPrice: it.indicativePrice || 0 }))
      );
      setState('ready');
    } catch {
      setState('error');
    }
  }

  useEffect(() => {
    setState('loading');
    load();
  }, [orderId]);

  async function patch(body: object, after?: () => void) {
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || 'The change was not saved.');
      after?.();
      await load();
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message || 'The change was not saved.');
    } finally {
      setBusy(false);
    }
  }

  const quoteSubtotal = lines.reduce((s, l) => s + (Number(l.agreedUnitPrice) || 0) * l.quantity, 0);
  const quoteTotal = quoteSubtotal + (Number(shipping) || 0) + (Number(tax) || 0);

  return (
    <Drawer
      onClose={onClose}
      width="max-w-[860px]"
      title={<span className="font-mono">{orderId}</span>}
      subtitle={order ? `Received ${formatDate(order.createdAt)}` : 'Loading…'}
      headerActions={
        order && (
          <label className="hidden items-center gap-2 text-sm sm:flex">
            <span className="text-ink-soft">Status</span>
            <select className="adm-input h-9 w-auto py-1" value={order.status} disabled={busy} onChange={e => patch({ status: e.target.value })}>
              {ORDER_STATUSES.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )
      }
    >
      {state === 'loading' && <p className="py-12 text-center text-sm text-ink-soft">Loading request…</p>}
      {state === 'error' && <ErrorBanner message="Could not load this request." onRetry={load} />}
      {state === 'ready' && order && (
        <div className="space-y-6">
          {actionError && <ErrorBanner message={actionError} />}

          <label className="flex items-center gap-2 text-sm sm:hidden">
            <span className="text-ink-soft">Status</span>
            <select className="adm-input" value={order.status} disabled={busy} onChange={e => patch({ status: e.target.value })}>
              {ORDER_STATUSES.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          {/* Customer */}
          <section className="adm-card grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <h3 className="adm-section-title">Customer</h3>
              <p className="mt-2 text-base font-medium">{order.customerName}</p>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-ink-faint" aria-hidden />
                <a className="hover:underline" href={`tel:+91${order.customerPhone}`}>
                  +91 {order.customerPhone}
                </a>
              </p>
              <p className="mt-1.5 flex items-center gap-2 break-all text-sm">
                <Mail className="h-4 w-4 flex-shrink-0 text-ink-faint" aria-hidden />
                <a className="hover:underline" href={`mailto:${order.customerEmail}?subject=${encodeURIComponent(`Your SWAYARI request ${order.id}`)}`}>
                  {order.customerEmail}
                </a>
              </p>
            </div>
            <div>
              <h3 className="adm-section-title">Delivery</h3>
              <p className="mt-2 flex gap-2 text-sm leading-relaxed">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-faint" aria-hidden />
                <span>
                  {order.deliveryAddress}
                  <br />
                  {order.deliveryCity}, {order.deliveryState} {order.deliveryPincode}
                </span>
              </p>
              {order.customerNotes && <p className="mt-3 rounded bg-stone px-3 py-2 text-sm">“{order.customerNotes}”</p>}
            </div>
          </section>

          {/* Bulk & Occasion info if present */}
          {(order.isBulkRequest || order.occasion || order.requiredDate) && (
            <section className="adm-card border-l-4 border-burgundy bg-[#FAF8F5] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="adm-section-title text-burgundy">
                  {order.isBulkRequest ? 'Bulk / Return Gifting Request' : 'Event & Occasion Details'}
                </h3>
                {order.isBulkRequest && (
                  <span className="rounded bg-burgundy px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-white">
                    Bulk Request
                  </span>
                )}
              </div>
              <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                {order.occasion && (
                  <div>
                    <span className="text-ink-soft">Occasion:</span>{' '}
                    <strong className="text-ink">{order.occasion}</strong>
                  </div>
                )}
                {order.requiredDate && (
                  <div>
                    <span className="text-ink-soft">Required by:</span>{' '}
                    <strong className="text-ink">{order.requiredDate}</strong>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Requested items (immutable snapshot) */}
          <section className="adm-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-deep px-5 py-3">
              <h3 className="adm-section-title">Requested — original, read-only</h3>
              <span className="text-sm text-ink-soft">
                Estimate: {order.initialIndicativeSubtotal === null ? 'on request' : formatPrice(order.initialIndicativeSubtotal)}
              </span>
            </div>
            <ul className="divide-y divide-stone-deep">
              {(order.items || []).map((it: any) => (
                <li key={it.id} className="flex items-center gap-4 px-5 py-3">
                  <Thumb src={it.imageUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{it.name}</p>
                    <p className="text-[0.8125rem] text-ink-soft">
                      {it.productSku || it.sku} · Qty {it.quantity}
                      {it.variant ? ` · ${it.variant}` : ''}
                    </p>
                    {it.customisationNote && <p className="mt-1 text-[0.8125rem]">Customer note: {it.customisationNote}</p>}
                  </div>
                  <span className="whitespace-nowrap text-sm text-ink-soft">{it.indicativePrice ? formatPrice(it.indicativePrice * it.quantity) : 'On request'}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Quotations (customer-visible) */}
          <section className="adm-card">
            <div className="flex items-center justify-between border-b border-stone-deep px-5 py-3">
              <h3 className="adm-section-title">Quotations — visible to the customer</h3>
              {!quoting && (
                <button type="button" className="adm-btn-secondary h-9" onClick={() => setQuoting(true)}>
                  <Plus className="h-4 w-4" aria-hidden /> New revision
                </button>
              )}
            </div>

            {quoting && (
              <form
                className="space-y-4 border-b border-stone-deep bg-[#FAF8F5] px-5 py-4"
                onSubmit={e => {
                  e.preventDefault();
                  const invalidLine = lines.find(l => (Number(l.agreedUnitPrice) || 0) > MAX_FRAME_PRICE);
                  if (invalidLine) {
                    setActionError(`Agreed unit price for "${invalidLine.productName}" cannot exceed ₹${MAX_FRAME_PRICE} per frame.`);
                    return;
                  }
                  patch(
                    {
                      status: 'quoted',
                      quotation: {
                        items: lines.map(l => ({ ...l, agreedUnitPrice: Number(l.agreedUnitPrice) || 0 })),
                        shippingCharge: Number(shipping) || 0,
                        taxAmount: Number(tax) || 0,
                        quotationNotes: quoteNotes.trim() || null
                      }
                    },
                    () => {
                      setQuoting(false);
                      setQuoteNotes('');
                    }
                  );
                }}
              >
                <p className="text-sm text-ink-soft">
                  Publishing adds a new revision. Earlier revisions and the original request stay unchanged. Price ceiling is ₹{MAX_FRAME_PRICE} per frame.
                </p>
                <div className="space-y-2">
                  {lines.map((l, i) => (
                    <div key={`${l.productId}-${i}`} className="grid grid-cols-[1fr_auto_9rem] items-center gap-3">
                      <span className="truncate text-sm font-medium">{l.productName}</span>
                      <span className="text-sm text-ink-soft">× {l.quantity}</span>
                      <label className="relative">
                        <span className="sr-only">Agreed unit price for {l.productName}</span>
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">₹</span>
                        <input
                          type="number"
                          min={0}
                          max={MAX_FRAME_PRICE}
                          required
                          className="adm-input pl-7 text-right"
                          value={l.agreedUnitPrice}
                          onChange={e => setLines(prev => prev.map((x, j) => (j === i ? { ...x, agreedUnitPrice: e.target.value as any } : x)))}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="adm-label">Shipping (₹)</span>
                    <input type="number" min={0} className="adm-input" value={shipping} onChange={e => setShipping(e.target.value)} />
                  </label>
                  <label>
                    <span className="adm-label">Taxes (₹)</span>
                    <input type="number" min={0} className="adm-input" value={tax} onChange={e => setTax(e.target.value)} />
                  </label>
                </div>
                <label className="block">
                  <span className="adm-label">Note to the customer (optional)</span>
                  <input className="adm-input" value={quoteNotes} onChange={e => setQuoteNotes(e.target.value)} placeholder="Shown in the customer's account with this revision" />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm">
                    Total <span className="font-semibold tabular-nums">{formatPrice(quoteTotal)}</span>
                  </p>
                  <div className="flex gap-2">
                    <button type="button" className="adm-btn-quiet" onClick={() => setQuoting(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="adm-btn-primary" disabled={busy}>
                      Publish revision
                    </button>
                  </div>
                </div>
              </form>
            )}

            {order.quotations?.length ? (
              <ul className="divide-y divide-stone-deep">
                {order.quotations.map((q: any) => (
                  <li key={q.id} className="px-5 py-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Revision {q.revisionNumber}</span>
                      <span className="text-ink-soft">{formatDate(q.createdAt)}</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                      {q.items.map((it: QuoteLine, i: number) => (
                        <li key={i} className="flex justify-between gap-4">
                          <span>
                            {it.productName} × {it.quantity}
                          </span>
                          <span className="tabular-nums">{formatPrice(it.agreedUnitPrice * it.quantity)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between gap-4">
                        <span>Shipping{q.taxAmount ? ' & taxes' : ''}</span>
                        <span className="tabular-nums">{formatPrice((q.shippingCharge || 0) + (q.taxAmount || 0))}</span>
                      </li>
                    </ul>
                    <p className="mt-2 flex justify-between border-t border-stone-deep pt-2 text-sm font-semibold">
                      <span>Total</span>
                      <span className="tabular-nums">{formatPrice(q.totalQuotedAmount)}</span>
                    </p>
                    {q.notes && <p className="mt-2 text-sm text-ink-soft">Note: {q.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              !quoting && <p className="px-5 py-4 text-sm text-ink-soft">No quotation published yet.</p>
            )}
          </section>

          {/* Staff-only internal notes */}
          <section className="rounded-md border border-amber-300 bg-amber-50/70" aria-labelledby="staff-notes">
            <div className="flex items-center gap-2 border-b border-amber-200 px-5 py-3 text-amber-900">
              <Lock className="h-4 w-4" aria-hidden />
              <h3 id="staff-notes" className="text-[0.75rem] font-semibold uppercase tracking-[0.12em]">
                Staff only — never shown to the customer
              </h3>
            </div>
            <div className="space-y-3 px-5 py-4">
              {order.internalNotes?.length ? (
                <ul className="space-y-2">
                  {order.internalNotes.map((n: any) => (
                    <li key={n.id} className="rounded border border-amber-200 bg-white px-3 py-2 text-sm">
                      <p className="flex justify-between gap-4 text-[0.8125rem] text-ink-soft">
                        <span className="font-medium text-ink">{n.adminName}</span>
                        <span>{formatDate(n.createdAt)}</span>
                      </p>
                      <p className="mt-1">{n.note}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-amber-900/80">No internal notes yet.</p>
              )}
              <form
                className="flex gap-2"
                onSubmit={e => {
                  e.preventDefault();
                  if (note.trim()) patch({ internalNote: note.trim() }, () => setNote(''));
                }}
              >
                <label htmlFor="internal-note" className="sr-only">
                  Add an internal note
                </label>
                <input id="internal-note" className="adm-input" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Called customer, will confirm size tomorrow" />
                <button type="submit" className="adm-btn-secondary" disabled={busy || !note.trim()}>
                  Add note
                </button>
              </form>
            </div>
          </section>

          <p className="flex items-center gap-2 text-sm text-ink-soft">
            Current status: <StatusBadge status={order.status} />
          </p>
        </div>
      )}
    </Drawer>
  );
};
