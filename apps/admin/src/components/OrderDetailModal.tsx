import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Mail, MapPin, Phone, Plus, Sparkles } from 'lucide-react';
import { formatDate, formatPrice, ORDER_STATUSES, MAX_FRAME_PRICE } from '@swayari/shared';
import { Drawer, ErrorBanner, StatusBadge, Thumb } from './ui';
import { EASE_LUXURY } from './motion';

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

  const statusSelect = (className: string) => (
    <select className={className} value={order.status} disabled={busy} onChange={e => patch({ status: e.target.value })}>
      {ORDER_STATUSES.map(s => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );

  return (
    <Drawer
      onClose={onClose}
      width="max-w-[880px]"
      title={
        <span className="flex items-center gap-3">
          <span className="font-mono text-[1.15rem] font-semibold tracking-tight text-burgundy sm:text-[1.3rem]">{orderId}</span>
          {order && (
            <span className="hidden sm:inline-flex">
              <StatusBadge status={order.status} />
            </span>
          )}
        </span>
      }
      subtitle={order ? `Received ${formatDate(order.createdAt)}` : 'Loading…'}
      headerActions={
        order && (
          <label className="hidden items-center gap-2 text-sm sm:flex">
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">Status</span>
            {statusSelect('adm-input h-10 min-h-0 w-auto rounded-full py-1.5 pl-4 text-sm')}
          </label>
        )
      }
    >
      {state === 'loading' && (
        <div className="space-y-4" role="status">
          <span className="sr-only">Loading request…</span>
          <span className="adm-skeleton block h-36 rounded-card" aria-hidden />
          <span className="adm-skeleton block h-48 rounded-card" aria-hidden />
          <span className="adm-skeleton block h-28 rounded-card" aria-hidden />
        </div>
      )}
      {state === 'error' && <ErrorBanner message="Could not load this request." onRetry={load} />}
      {state === 'ready' && order && (
        <motion.div className="space-y-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_LUXURY }}>
          {actionError && <ErrorBanner message={actionError} />}

          <label className="adm-card flex items-center gap-3 px-4 py-3 text-sm sm:hidden">
            <span className="flex-shrink-0 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">Status</span>
            {statusSelect('adm-input')}
          </label>

          {/* Customer */}
          <section className="adm-card grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <h3 className="adm-section-title">Customer</h3>
              <p className="mt-2.5 font-display text-[1.4rem] font-semibold leading-tight">{order.customerName}</p>
              <p className="mt-3 flex items-center gap-2.5 text-sm">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold-pale/70 text-gold-dark">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                </span>
                <a className="font-medium underline-offset-4 hover:text-burgundy hover:underline" href={`tel:+91${order.customerPhone}`}>
                  +91 {order.customerPhone}
                </a>
              </p>
              <p className="mt-2 flex items-center gap-2.5 break-all text-sm">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold-pale/70 text-gold-dark">
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                </span>
                <a className="font-medium underline-offset-4 hover:text-burgundy hover:underline" href={`mailto:${order.customerEmail}?subject=${encodeURIComponent(`Your SWAYARI request ${order.id}`)}`}>
                  {order.customerEmail}
                </a>
              </p>
            </div>
            <div className="sm:border-l sm:border-stone-deep/70 sm:pl-6">
              <h3 className="adm-section-title">Delivery</h3>
              <p className="mt-2.5 flex gap-2.5 text-sm leading-relaxed">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-dark" aria-hidden />
                <span>
                  {order.deliveryAddress}
                  <br />
                  {order.deliveryCity}, {order.deliveryState} {order.deliveryPincode}
                </span>
              </p>
              {order.customerNotes && (
                <p className="mt-4 rounded-xl border-l-2 border-gold bg-ivory-light px-4 py-3 font-display text-[1.05rem] italic leading-snug text-ink-soft">“{order.customerNotes}”</p>
              )}
            </div>
          </section>

          {/* Bulk & Occasion info if present */}
          {(order.isBulkRequest || order.occasion || order.requiredDate) && (
            <section className="relative overflow-hidden rounded-card border border-gold/40 bg-gradient-to-br from-gold-pale/70 via-ivory-light to-white p-5 shadow-card sm:p-6">
              <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-burgundy to-burgundy-accent" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="adm-section-title flex items-center gap-2 text-burgundy">
                  <Sparkles className="h-3.5 w-3.5 text-gold-dark" aria-hidden />
                  {order.isBulkRequest ? 'Bulk / Return Gifting Request' : 'Event & Occasion Details'}
                </h3>
                {order.isBulkRequest && (
                  <span className="rounded-full bg-burgundy px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold-light">Bulk Request</span>
                )}
              </div>
              <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                {order.occasion && (
                  <div>
                    <span className="text-ink-soft">Occasion:</span> <strong className="text-ink">{order.occasion}</strong>
                  </div>
                )}
                {order.requiredDate && (
                  <div>
                    <span className="text-ink-soft">Required by:</span> <strong className="text-ink">{order.requiredDate}</strong>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Requested items (immutable snapshot) */}
          <section className="adm-card overflow-hidden">
            <div className="adm-card-header py-3.5">
              <h3 className="adm-section-title">Requested — original, read-only</h3>
              <span className="text-sm text-ink-soft">
                Estimate: <span className="font-semibold text-ink">{order.initialIndicativeSubtotal === null ? 'on request' : formatPrice(order.initialIndicativeSubtotal)}</span>
              </span>
            </div>
            <ul className="divide-y divide-stone-deep/60">
              {(order.items || []).map((it: any) => (
                <li key={it.id} className="flex items-center gap-4 px-5 py-3.5 sm:px-6">
                  <Thumb src={it.imageUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug">{it.name}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-ink-soft">
                      <span className="font-mono text-[0.75rem]">{it.productSku || it.sku}</span> · Qty {it.quantity}
                      {it.variant ? ` · ${it.variant}` : ''}
                    </p>
                    {it.customisationNote && <p className="mt-1.5 rounded-lg bg-ivory-light px-2.5 py-1.5 text-[0.8125rem]">Customer note: {it.customisationNote}</p>}
                  </div>
                  <span className="whitespace-nowrap text-sm font-medium tabular-nums text-ink">{it.indicativePrice ? formatPrice(it.indicativePrice * it.quantity) : <span className="font-normal text-ink-faint">On request</span>}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Quotations (customer-visible) */}
          <section className="adm-card overflow-hidden">
            <div className="adm-card-header py-3.5">
              <h3 className="adm-section-title">Quotations — visible to the customer</h3>
              {!quoting && (
                <button type="button" className="adm-btn-secondary h-10" onClick={() => setQuoting(true)}>
                  <Plus className="h-4 w-4" aria-hidden /> New revision
                </button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {quoting && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: EASE_LUXURY }}
                  className="overflow-hidden border-b border-stone-deep/80 bg-ivory-light"
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
                  <div className="space-y-4 px-5 py-5 sm:px-6">
                    <p className="text-sm leading-relaxed text-ink-soft">
                      Publishing adds a new revision. Earlier revisions and the original request stay unchanged. Price ceiling is ₹{MAX_FRAME_PRICE} per frame.
                    </p>
                    <div className="divide-y divide-stone-deep/60 rounded-xl border border-stone-deep/80 bg-white">
                      {lines.map((l, i) => (
                        <div key={`${l.productId}-${i}`} className="grid grid-cols-[1fr_auto_7.5rem] items-center gap-3 px-3 py-2.5 sm:grid-cols-[1fr_auto_9rem] sm:px-4">
                          <span className="truncate text-sm font-semibold">{l.productName}</span>
                          <span className="text-sm tabular-nums text-ink-soft">× {l.quantity}</span>
                          <label className="relative">
                            <span className="sr-only">Agreed unit price for {l.productName}</span>
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gold-dark">₹</span>
                            <input
                              type="number"
                              min={0}
                              max={MAX_FRAME_PRICE}
                              required
                              className="adm-input pl-8 text-right tabular-nums"
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
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-deep/70 bg-white/70 px-5 py-3 sm:px-6">
                    <p className="text-sm text-ink-soft">
                      Total <span className="ml-1 font-display text-[1.5rem] font-semibold tabular-nums text-ink">{formatPrice(quoteTotal)}</span>
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
                </motion.form>
              )}
            </AnimatePresence>

            {order.quotations?.length ? (
              <ul className="divide-y divide-stone-deep/60">
                {order.quotations.map((q: any, qi: number) => (
                  <li key={q.id} className="px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 font-semibold">
                        Revision {q.revisionNumber}
                        {qi === 0 && <span className="adm-badge-gold">Latest</span>}
                      </span>
                      <span className="text-ink-faint">{formatDate(q.createdAt)}</span>
                    </div>
                    <ul className="mt-2.5 space-y-1 text-sm text-ink-soft">
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
                    <p className="mt-3 flex items-baseline justify-between border-t border-dashed border-stone-shade pt-2.5 text-sm font-semibold">
                      <span>Total</span>
                      <span className="font-display text-[1.25rem] tabular-nums text-burgundy">{formatPrice(q.totalQuotedAmount)}</span>
                    </p>
                    {q.notes && <p className="mt-2 text-sm text-ink-soft">Note: {q.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              !quoting && <p className="px-5 py-5 text-sm text-ink-soft sm:px-6">No quotation published yet.</p>
            )}
          </section>

          {/* Staff-only internal notes */}
          <section className="overflow-hidden rounded-card border border-gold/40 bg-gold-pale/40 shadow-subtle" aria-labelledby="staff-notes">
            <div className="flex items-center gap-2 border-b border-gold/30 bg-gold-pale/60 px-5 py-3 text-gold-dark sm:px-6">
              <Lock className="h-4 w-4" aria-hidden />
              <h3 id="staff-notes" className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em]">
                Staff only — never shown to the customer
              </h3>
            </div>
            <div className="space-y-3 px-5 py-4 sm:px-6">
              {order.internalNotes?.length ? (
                <ul className="space-y-2">
                  {order.internalNotes.map((n: any) => (
                    <li key={n.id} className="rounded-xl border border-gold/25 bg-white px-4 py-3 text-sm shadow-subtle">
                      <p className="flex justify-between gap-4 text-[0.8125rem] text-ink-faint">
                        <span className="font-semibold text-ink">{n.adminName}</span>
                        <span>{formatDate(n.createdAt)}</span>
                      </p>
                      <p className="mt-1 leading-relaxed">{n.note}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gold-dark/80">No internal notes yet.</p>
              )}
              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={e => {
                  e.preventDefault();
                  if (note.trim()) patch({ internalNote: note.trim() }, () => setNote(''));
                }}
              >
                <label htmlFor="internal-note" className="sr-only">
                  Add an internal note
                </label>
                <input id="internal-note" className="adm-input" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Called customer, will confirm size tomorrow" />
                <button type="submit" className="adm-btn-secondary flex-shrink-0" disabled={busy || !note.trim()}>
                  Add note
                </button>
              </form>
            </div>
          </section>

          <p className="flex items-center gap-2 text-sm text-ink-soft">
            Current status: <StatusBadge status={order.status} />
          </p>
        </motion.div>
      )}
    </Drawer>
  );
};
