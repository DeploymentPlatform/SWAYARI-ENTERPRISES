import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatDate, formatPrice, getStatusMeta } from '@swayari/shared';
import { useAuth } from '../context/AuthContext';
import { productImageSources } from '../lib/media';
import { usePageMeta } from '../lib/meta';
import { EmptyState, LoadError, PageIntro } from '../components/States';
import { Picture, PriceText } from '../components/ui';

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

const STATUS_TONE: Record<string, string> = {
  new_request: 'bg-stone text-ink',
  contacted: 'bg-amber-50 text-amber-900',
  quoted: 'bg-burgundy-soft text-burgundy-deep',
  confirmed: 'bg-emerald-50 text-emerald-900',
  dispatched: 'bg-emerald-50 text-emerald-900',
  completed: 'bg-emerald-50 text-emerald-900',
  cancelled: 'bg-red-50 text-red-900'
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex px-2.5 py-1 text-[0.75rem] font-medium uppercase tracking-[0.1em] ${STATUS_TONE[status] || 'bg-stone text-ink'}`}>
    {status === 'new_request' ? 'Received' : getStatusMeta(status).label}
  </span>
);

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

  if (isLoading) return <div className="container-content py-24 text-center text-ink-soft">Checking your account…</div>;

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
      <PageIntro eyebrow="Your account" title="Your requests">
        Signed in as {user.email}
      </PageIntro>

      <div className="pt-8">
        {status === 'loading' && (
          <div className="space-y-3" aria-busy="true">
            {[0, 1].map(i => (
              <div key={i} className="skeleton h-24" />
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
          <ul className="divide-y divide-stone-deep border-y border-stone-deep">
            {orders.map(order => {
              const isOpen = open === order.id;
              const detail = details[order.id];
              const thumb = productImageSources(order.firstImage);
              return (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => toggle(order.id)}
                    aria-expanded={isOpen}
                    aria-controls={`order-${order.id}`}
                    className="grid w-full grid-cols-[56px_1fr_auto] items-center gap-4 py-5 text-left sm:grid-cols-[64px_1fr_auto_auto] sm:gap-6"
                  >
                    <div className="bg-stone">
                      {thumb && <Picture sources={thumb} sizes="64px" width={128} height={160} alt="" className="aspect-product w-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[0.9375rem] text-burgundy">{order.id}</p>
                      <p className="mt-1 text-sm text-ink-soft">
                        {formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? 'piece' : 'pieces'} · {order.deliveryCity}
                      </p>
                      <div className="mt-2 sm:hidden">
                        <StatusPill status={order.status} />
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <StatusPill status={order.status} />
                    </div>
                    <ChevronDown className={`h-5 w-5 text-ink-soft transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                  </button>

                  {isOpen && (
                    <div id={`order-${order.id}`} className="pb-8 sm:pl-[88px]">
                      {!detail && <div className="skeleton h-28" aria-busy="true" />}
                      {detail === 'error' && <p className="text-sm text-red-800">We couldn’t load this request. Please try again.</p>}
                      {detail && detail !== 'error' && (
                        <div className="grid gap-8 md:grid-cols-2">
                          <div>
                            <h3 className="font-sans text-label uppercase text-ink-soft">Requested</h3>
                            <ul className="mt-3 space-y-3">
                              {detail.items.map(it => (
                                <li key={it.id} className="flex justify-between gap-4 text-[0.9375rem]">
                                  <span>
                                    {it.name} <span className="text-ink-soft">× {it.quantity}</span>
                                    {it.variant && <span className="block text-sm text-ink-soft">{it.variant}</span>}
                                  </span>
                                  <PriceText value={it.indicativePrice === null ? null : it.indicativePrice * it.quantity} className="whitespace-nowrap text-ink-soft" />
                                </li>
                              ))}
                            </ul>
                            <p className="mt-5 text-sm text-ink-soft">
                              Delivery: {detail.deliveryAddress}, {detail.deliveryCity}, {detail.deliveryState} {detail.deliveryPincode}
                            </p>
                            {detail.customerNotes && <p className="mt-2 text-sm text-ink-soft">Your note: {detail.customerNotes}</p>}
                          </div>

                          <div>
                            <h3 className="font-sans text-label uppercase text-ink-soft">Quotation from our team</h3>
                            {detail.quotations.length === 0 ? (
                              <p className="mt-3 text-[0.9375rem] text-ink-soft">
                                No quotation yet. Our team will contact you to confirm availability, final pricing and delivery.
                              </p>
                            ) : (
                              <QuotationView quotation={detail.quotations[0]} total={detail.quotations.length} />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

const QuotationView: React.FC<{ quotation: Quotation; total: number }> = ({ quotation, total }) => (
  <div className="mt-3 bg-stone p-5">
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
      <div className="flex justify-between font-medium">
        <dt>Quoted total</dt>
        <dd>{formatPrice(quotation.totalQuotedAmount)}</dd>
      </div>
    </dl>
    {quotation.notes && <p className="mt-3 text-sm text-ink-soft">{quotation.notes}</p>}
  </div>
);
