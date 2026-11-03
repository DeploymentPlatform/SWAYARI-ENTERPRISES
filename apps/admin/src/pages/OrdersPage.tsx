import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Inbox, Search, SearchX } from 'lucide-react';
import { formatDate, formatPrice, ORDER_STATUSES } from '@swayari/shared';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { EmptyState, ErrorBanner, PageHeader, SkeletonRows, StatusBadge, Thumb } from '../components/ui';

interface OrderRow {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryCity: string;
  deliveryState: string;
  status: string;
  indicativeSubtotal: number | null;
  itemCount: number;
  firstImage: string | null;
  createdAt: string;
}

export const OrdersPage: React.FC<{ initialSelectedOrderId?: string | null }> = ({ initialSelectedOrderId }) => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(initialSelectedOrderId || null);

  async function load() {
    setState('loading');
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (appliedQuery) params.set('search', appliedQuery);
    try {
      const res = await fetch(`/api/admin/orders${params.toString() ? `?${params}` : ''}`);
      if (!res.ok) throw new Error();
      setOrders((await res.json()).orders || []);
      setState('ready');
    } catch {
      setState('error');
    }
  }

  useEffect(() => {
    load();
  }, [status, appliedQuery]);

  const filtered = Boolean(appliedQuery || status !== 'all');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer requests"
        title="Order requests"
        description="Contact the customer, record notes, and publish quotation revisions. Original requests are never changed."
      />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0" role="group" aria-label="Filter by status">
          {[{ value: 'all', label: 'All' }, ...ORDER_STATUSES].map(s => (
            <button key={s.value} type="button" aria-pressed={status === s.value} onClick={() => setStatus(s.value)} className={status === s.value ? 'adm-chip-on' : 'adm-chip-off'}>
              {s.label}
            </button>
          ))}
        </div>
        <form
          role="search"
          className="relative w-full flex-shrink-0 sm:max-w-md xl:w-80"
          onSubmit={e => {
            e.preventDefault();
            setAppliedQuery(query.trim());
          }}
        >
          <label htmlFor="order-search" className="sr-only">
            Search requests
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-dark" aria-hidden />
          <input
            id="order-search"
            type="search"
            className="adm-input rounded-full pl-10"
            placeholder="Reference, name, phone, email or city"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (!e.target.value) setAppliedQuery('');
            }}
          />
        </form>
      </div>

      {state === 'error' && <ErrorBanner message="Could not load order requests." onRetry={load} />}

      <div className="adm-card overflow-hidden">
        {state === 'loading' ? (
          <SkeletonRows rows={6} label="Loading requests…" />
        ) : orders.length === 0 ? (
          <EmptyState icon={filtered ? SearchX : Inbox} title={filtered ? 'No requests match these filters' : 'No order requests yet'}>
            {filtered ? 'Try another status or search term.' : 'Requests from the customer website will appear here.'}
          </EmptyState>
        ) : (
          <>
            {/* Phones: stacked rows */}
            <ul className="adm-list md:hidden">
              {orders.map(o => (
                <li key={o.id} className={activeId === o.id ? 'bg-burgundy-soft/50' : ''}>
                  <button type="button" className="adm-list-row" onClick={() => setActiveId(o.id)}>
                    <Thumb src={o.firstImage} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="truncate font-semibold text-ink">{o.customerName}</span>
                        <StatusBadge status={o.status} />
                      </span>
                      <span className="mt-0.5 block font-mono text-[0.75rem] text-burgundy">{o.id}</span>
                      <span className="mt-1 block text-[0.8125rem] text-ink-soft">
                        {o.deliveryCity}, {o.deliveryState}
                      </span>
                      <span className="mt-1.5 flex items-center justify-between gap-2 text-[0.8125rem]">
                        <span className="text-ink-faint">
                          {o.itemCount} pcs · {formatDate(o.createdAt)}
                        </span>
                        <span className="font-semibold tabular-nums text-ink">{o.indicativeSubtotal === null ? 'On request' : formatPrice(o.indicativeSubtotal)}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {/* Tablet and desktop: table with sticky header */}
            <div className="adm-table-scroll hidden md:block">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Customer</th>
                    <th>Delivery</th>
                    <th className="text-right">Pieces</th>
                    <th className="text-right">Estimate</th>
                    <th>Status</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className={`cursor-pointer ${activeId === o.id ? 'adm-row-active' : ''}`} onClick={() => setActiveId(o.id)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Thumb src={o.firstImage} />
                          <button type="button" onClick={() => setActiveId(o.id)} className="font-mono text-[0.8125rem] font-semibold text-burgundy underline-offset-4 hover:underline">
                            {o.id}
                          </button>
                        </div>
                      </td>
                      <td>
                        <p className="font-semibold">{o.customerName}</p>
                        <p className="text-[0.8125rem] text-ink-faint">+91 {o.customerPhone}</p>
                      </td>
                      <td className="text-ink-soft">
                        {o.deliveryCity}, {o.deliveryState}
                      </td>
                      <td className="text-right tabular-nums">{o.itemCount}</td>
                      <td className="whitespace-nowrap text-right font-medium tabular-nums text-ink">{o.indicativeSubtotal === null ? <span className="font-normal text-ink-faint">On request</span> : formatPrice(o.indicativeSubtotal)}</td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="whitespace-nowrap text-ink-soft">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {activeId && <OrderDetailModal orderId={activeId} onClose={() => setActiveId(null)} onOrderUpdated={load} />}
      </AnimatePresence>
    </div>
  );
};
