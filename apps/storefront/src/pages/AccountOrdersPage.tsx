import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, MapPin, X } from 'lucide-react';
import { formatDate, formatPrice, getStatusMeta } from '@swayari/shared';
import { useAuth } from '../context/AuthContext';
import { productImageSources } from '../lib/media';
import { usePageMeta } from '../lib/meta';
import { EmptyState, LoadError, PageIntro } from '../components/States';
import { EASE_LUXURY, StaggerGroup, StaggerItem } from '../components/motion';
import { Picture, PriceText, Spinner } from '../components/ui';

interface OrderSummary {
  id: string;
  status: string;
  deliveryCity: string;
  deliveryState: string;
  indicativeSubtotal: number | null;
  itemCount: number;
  firstImage: string | null;
  quotationCount: number;
  createdAt: string;
}

interface Quotation {
  id: string;
  revisionNumber: number;
  items: { productName: string; quantity: number; agreedUnitPrice: number }[];
  itemsSubtotal: number;
  shippingCharge: number;
  taxAmount: number;
  totalQuotedAmount: number;
  notes: string | null;
  createdAt: string;
}

interface OrderDetail {
  id: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  customerNotes: string | null;
  items: { id: string; name: string; quantity: number; variant: string | null; indicativePrice: number | null; imageUrl: string | null; customisationNote: string | null }[];
  quotations: Quotation[];
}

const STATUS_TONE: Record<string, { pill: string; dot: string }> = {
  new_request: { pill: 'border-stone-deep bg-stone text-ink', dot: 'bg-ink-faint' },
  contacted: { pill: 'border-gold/40 bg-gold-pale/70 text-gold-dark', dot: 'bg-gold' },
  quoted: { pill: 'border-burgundy/20 bg-burgundy-soft text-burgundy-deep', dot: 'bg-burgundy' },
  confirmed: { pill: 'border-emerald-700/20 bg-emerald-50 text-emerald-900', dot: 'bg-emerald-600' },
  dispatched: { pill: 'border-emerald-700/20 bg-emerald-50 text-emerald-900', dot: 'bg-emerald-600' },
  completed: { pill: 'border-emerald-700/20 bg-emerald-50 text-emerald-900', dot: 'bg-emerald-700' },
  cancelled: { pill: 'border-red-800/20 bg-red-50 text-red-900', dot: 'bg-red-700' }
};

const statusLabel = (status: string) => (status === 'new_request' ? 'Received' : getStatusMeta(status).label);

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const tone = STATUS_TONE[status] || STATUS_TONE.new_request;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] ${tone.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden />
      {statusLabel(status)}
    </span>
  );
};

const JOURNEY = ['new_request', 'contacted', 'quoted', 'confirmed', 'dispatched', 'completed'];

/** Horizontal timeline of where a request is in its journey. */
const StatusTimeline: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <p className="flex items-center gap-2 rounded-2xl border border-red-800/15 bg-red-50/70 px-4 py-3 text-sm text-red-900">
        <X className="h-4 w-4" aria-hidden /> This request was cancelled.
      </p>
    );
  }
  const current = Math.max(0, JOURNEY.indexOf(status));
  return (
    <ol className="-mx-1 flex overflow-x-auto px-1 pb-1 scrollbar-none" aria-label="Request progress">
      {JOURNEY.map((s, i) => {
        const done = i < current || (i === current && s === 'completed');
        const active = i === current && s !== 'completed';
        return (
          <li key={s} className="flex min-w-[5.5rem] flex-1 flex-col items-center text-center" aria-current={active ? 'step' : undefined}>
            <div className="flex w-full items-center">
              <span className={`h-px flex-1 ${i === 0 ? 'opacity-0' : i <= current ? 'bg-gold' : 'bg-stone-deep'}`} />
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-[0.6875rem] font-semibold ${
                  done
                    ? 'border-gold bg-gradient-to-b from-gold-light to-gold text-burgundy-deep'
                    : active
                      ? 'border-burgundy bg-burgundy text-ivory-light shadow-[0_0_0_4px_rgba(94,26,40,0.12)]'
                      : 'border-stone-deep bg-white text-ink-faint'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /> : i + 1}
              </span>
              <span className={`h-px flex-1 ${i === JOURNEY.length - 1 ? 'opacity-0' : i < current ? 'bg-gold' : 'bg-stone-deep'}`} />
            </div>
            <span className={`mt-2 text-[0.625rem] font-semibold uppercase tracking-[0.1em] ${active ? 'text-burgundy' : done ? 'text-gold-dark' : 'text-ink-faint'}`}>
              {statusLabel(s)}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export const AccountOrdersPage: React.FC = () => {
  const { user, isLoading, initiateGoogleSignIn } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, OrderDetail | 'error'>>({});
  usePageMeta('Your requests', undefined, { noindex: true });

  useEffect(() => {
    if (!user) return;
    setStatus('loading');
    fetch('/api/orders/my')
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => {
        setOrders(data.orders || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [user, attempt]);

  async function toggle(id: string) {
    setOpen(cur => (cur === id ? null : id));
    if (details[id] && details[id] !== 'error') return;
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDetails(d => ({ ...d, [id]: data.order }));
    } catch {
      setDetails(d => ({ ...d, [id]: 'error' }));
    }
  }

  if (isLoading)
    return (
      <div className="container-content flex items-center justify-center gap-3 py-28 text-ink-soft" role="status">
        <Spinner className="h-5 w-5 text-gold" /> Checking your account…
      </div>
    );

  if (!user) {
    return (
      <div className="container-content">
        <EmptyState
          title="Sign in to see your requests"
          body={<p>View the requests you have sent and any updates from our team.</p>}
          secondary={
            <button type="button" className="btn-primary" onClick={() => initiateGoogleSignIn(undefined, 'orders')}>
              Sign in with Google
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-content max-w-5xl pb-20 md:pb-28">
      <PageIntro eyebrow="Your account" title={<>Your <em>requests</em></>}>
        Signed in as {user.email}
      </PageIntro>

      <div className="pt-8 md:pt-10">
        {status === 'loading' && (
          <div className="space-y-4" aria-busy="true">
            {[0, 1, 2].map(i => (
              <div key={i} className="skeleton h-28 rounded-card" />
            ))}
          </div>
        )}
        {status === 'error' && <LoadError onRetry={() => setAttempt(a => a + 1)} />}
        {status === 'ready' && orders.length === 0 && (
          <EmptyState
            title="No requests yet"
            body={<p>When you send a request, it will appear here with any updates from our team.</p>}
            action={{ to: '/shop', label: 'Explore the Collection' }}
          />
        )}
        {status === 'ready' && orders.length > 0 && (
          <StaggerGroup as="ul" className="space-y-4">
            {orders.map(order => {
              const isOpen = open === order.id;
              const detail = details[order.id];
              const thumb = productImageSources(order.firstImage);
              return (
                <StaggerItem as="li" key={order.id}>
                  <div
                    className={`card-luxe overflow-hidden transition-shadow duration-500 ease-luxury ${isOpen ? 'shadow-card-hover' : 'hover:shadow-card-hover'}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(order.id)}
                      aria-expanded={isOpen}
                      aria-controls={`order-${order.id}`}
                      className="grid w-full grid-cols-[56px_1fr_auto] items-center gap-4 p-4 text-left sm:grid-cols-[72px_1fr_auto_auto] sm:gap-6 sm:p-5"
                    >
                      <div className="aspect-square overflow-hidden rounded-xl border border-stone-deep/60 bg-gradient-to-b from-ivory-light to-stone p-1">
                        {thumb && <Picture sources={thumb} sizes="72px" width={144} height={144} alt="" className="h-full w-full object-contain" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[0.9375rem] tracking-wide text-burgundy">{order.id}</p>
                        <p className="mt-1 text-[0.8125rem] text-ink-soft">
                          {formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? 'piece' : 'pieces'} · {order.deliveryCity}
                        </p>
                        <div className="mt-2 sm:hidden">
                          <StatusPill status={order.status} />
                        </div>
                      </div>
                      <div className="hidden text-right sm:block">
                        <StatusPill status={order.status} />
                        {order.indicativeSubtotal !== null && (
                          <p className="mt-1.5 font-display text-[1.2rem] font-semibold leading-none text-ink lining-nums">{formatPrice(order.indicativeSubtotal)}</p>
                        )}
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-deep bg-white/80">
                        <ChevronDown className={`h-4 w-4 text-gold-dark transition-transform duration-500 ease-luxury ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`order-${order.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE_LUXURY }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-stone-deep/70 bg-ivory-light/60 p-4 sm:p-6">
                            <StatusTimeline status={order.status} />
                            <div className="mt-6">
                              {!detail && <div className="skeleton h-28" aria-busy="true" />}
                              {detail === 'error' && <p className="text-sm text-red-800">We couldn’t load this request. Please try again.</p>}
                              {detail && detail !== 'error' && (
                                <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                                  <div>
                                    <h3 className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-dark">Requested</h3>
                                    <ul className="mt-3 divide-y divide-stone-deep/60">
                                      {detail.items.map(it => (
                                        <li key={it.id} className="flex justify-between gap-4 py-2.5 text-[0.9375rem]">
                                          <span>
                                            {it.name} <span className="text-ink-faint">× {it.quantity}</span>
                                            {it.variant && <span className="block text-sm text-ink-soft">{it.variant}</span>}
                                          </span>
                                          <PriceText value={it.indicativePrice === null ? null : it.indicativePrice * it.quantity} className="whitespace-nowrap text-ink-soft" />
                                        </li>
                                      ))}
                                    </ul>
                                    <p className="mt-4 flex gap-2 text-sm text-ink-soft">
                                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" aria-hidden />
                                      <span>
                                        Delivery: {detail.deliveryAddress}, {detail.deliveryCity}, {detail.deliveryState} {detail.deliveryPincode}
                                      </span>
                                    </p>
                                    {detail.customerNotes && <p className="mt-2 text-sm italic text-ink-soft">Your note: {detail.customerNotes}</p>}
                                  </div>

                                  <div>
                                    <h3 className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-dark">Quotation from our team</h3>
                                    {detail.quotations.length === 0 ? (
                                      <p className="mt-3 rounded-2xl border border-dashed border-stone-shade bg-white/60 p-4 text-[0.9375rem] text-ink-soft">
                                        No quotation yet. Our team will contact you to confirm availability, final pricing and delivery.
                                      </p>
                                    ) : (
                                      <QuotationView quotation={detail.quotations[0]} total={detail.quotations.length} />
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </div>
    </div>
  );
};

const QuotationView: React.FC<{ quotation: Quotation; total: number }> = ({ quotation, total }) => (
  <div className="mt-3 rounded-2xl border border-gold/30 bg-white p-5 shadow-subtle">
    <p className="text-sm text-ink-soft">
      Revision {quotation.revisionNumber}
      {total > 1 ? ` (latest of ${total})` : ''} · {formatDate(quotation.createdAt)}
    </p>
    <ul className="mt-3 space-y-2 text-[0.9375rem]">
      {quotation.items.map((q, i) => (
        <li key={i} className="flex justify-between gap-4">
          <span>
            {q.productName} × {q.quantity}
          </span>
          <span>{formatPrice(q.agreedUnitPrice * q.quantity)}</span>
        </li>
      ))}
    </ul>
    <dl className="mt-3 space-y-1.5 border-t border-stone-deep pt-3 text-[0.9375rem]">
      <div className="flex justify-between">
        <dt className="text-ink-soft">Shipping</dt>
        <dd>{formatPrice(quotation.shippingCharge || 0)}</dd>
      </div>
      {quotation.taxAmount > 0 && (
        <div className="flex justify-between">
          <dt className="text-ink-soft">Taxes</dt>
          <dd>{formatPrice(quotation.taxAmount)}</dd>
        </div>
      )}
      <div className="flex items-baseline justify-between border-t border-stone-deep pt-2 font-medium">
        <dt>Quoted total</dt>
        <dd className="font-display text-[1.5rem] font-semibold leading-none text-burgundy lining-nums">{formatPrice(quotation.totalQuotedAmount)}</dd>
      </div>
    </dl>
    {quotation.notes && <p className="mt-3 text-sm text-ink-soft">{quotation.notes}</p>}
  </div>
);
