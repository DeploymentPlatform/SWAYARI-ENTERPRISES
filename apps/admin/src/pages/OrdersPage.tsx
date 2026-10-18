import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { formatDate, formatPrice, ORDER_STATUSES } from '@swayari/shared';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { ErrorBanner, PageHeader, StatusBadge, Thumb } from '../components/ui';

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

  return (
    <div className="space-y-6">
      <PageHeader title="Order requests" description="Contact the customer, record notes, and publish quotation revisions. Original requests are never changed." />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by status">
          {[{ value: 'all', label: 'All' }, ...ORDER_STATUSES].map(s => (
            <button key={s.value} type="button" aria-pressed={status === s.value} onClick={() => setStatus(s.value)} className={status === s.value ? 'adm-chip-on' : 'adm-chip-off'}>
              {s.label}
            </button>
          ))}
        </div>
        <form
          role="search"
          className="relative w-full lg:w-80"
          onSubmit={e => {
            e.preventDefault();
            setAppliedQuery(query.trim());
          }}
        >
          <label htmlFor="order-search" className="sr-only">
            Search requests
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            id="order-search"
            type="search"
            className="adm-input pl-9"
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
          <p className="px-5 py-12 text-center text-sm text-ink-soft">Loading requests…</p>
        ) : orders.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-medium">{appliedQuery || status !== 'all' ? 'No requests match these filters' : 'No order requests yet'}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {appliedQuery || status !== 'all' ? 'Try another status or search term.' : 'Requests from the customer website will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                  <tr key={o.id} className={`cursor-pointer hover:bg-[#FAF8F5] ${activeId === o.id ? 'bg-burgundy-soft/40' : ''}`} onClick={() => setActiveId(o.id)}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Thumb src={o.firstImage} />
                        <button type="button" onClick={() => setActiveId(o.id)} className="font-mono text-[0.8125rem] font-medium text-burgundy hover:underline">
                          {o.id}
                        </button>
                      </div>
                    </td>
                    <td>
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-[0.8125rem] text-ink-soft">+91 {o.customerPhone}</p>
                    </td>
                    <td className="text-ink-soft">
                      {o.deliveryCity}, {o.deliveryState}
                    </td>
                    <td className="text-right tabular-nums">{o.itemCount}</td>
                    <td className="whitespace-nowrap text-right tabular-nums text-ink-soft">{o.indicativeSubtotal === null ? 'On request' : formatPrice(o.indicativeSubtotal)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="whitespace-nowrap text-ink-soft">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeId && <OrderDetailModal orderId={activeId} onClose={() => setActiveId(null)} onOrderUpdated={load} />}
    </div>
  );
};
