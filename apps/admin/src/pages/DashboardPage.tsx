import React, { useEffect, useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { formatDate } from '@swayari/shared';
import { ErrorBanner, PageHeader, StatusBadge, Thumb } from '../components/ui';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  onOpenOrder: (orderId: string) => void;
}

interface OrderRow {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
  status: string;
  itemCount: number;
  firstImage: string | null;
  createdAt: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab, onOpenOrder }) => {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<OrderRow[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  async function load() {
    try {
      const [s, o] = await Promise.all([fetch('/api/admin/stats'), fetch('/api/admin/orders?limit=6')]);
      if (!s.ok || !o.ok) throw new Error();
      setStats((await s.json()).stats);
      setRecent((await o.json()).orders || []);
      setRefreshedAt(new Date());
      setState('ready');
    } catch {
      setState('error');
    }
  }

  useEffect(() => {
    load();
    const t = window.setInterval(() => document.visibilityState === 'visible' && load(), 30000);
    return () => window.clearInterval(t);
  }, []);

  const o = stats?.orders || {};
  const p = stats?.products || {};
  const metrics = [
    { label: 'New requests', value: o.new_request ?? 0, hint: 'Not yet contacted', tab: 'orders', emphasis: (o.new_request ?? 0) > 0 },
    { label: 'In discussion', value: (o.contacted ?? 0) + (o.quoted ?? 0), hint: 'Contacted or quoted', tab: 'orders' },
    { label: 'Confirmed / dispatched', value: (o.confirmed ?? 0) + (o.dispatched ?? 0), hint: 'Being fulfilled', tab: 'orders' },
    { label: 'Live products', value: p.published ?? 0, hint: `${p.draft ?? 0} draft · ${p.archived ?? 0} archived${p.samples ? ` · ${p.samples} samples` : ''}`, tab: 'products' }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="Current order requests and catalogue counts from the shared database."
        actions={
          <button type="button" className="adm-btn-secondary" onClick={load}>
            <RefreshCw className="h-4 w-4" aria-hidden /> Refresh
          </button>
        }
      />

      {state === 'error' && <ErrorBanner message="Could not load the latest figures." onRetry={load} />}

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(m => (
          <button
            key={m.label}
            type="button"
            onClick={() => onNavigateTab(m.tab)}
            className={`adm-card p-5 text-left transition-colors hover:border-ink-faint ${m.emphasis ? 'border-l-4 border-l-burgundy' : ''}`}
          >
            <dt className="text-sm text-ink-soft">{m.label}</dt>
            <dd className="mt-2 font-sans text-[2rem] font-medium leading-none tabular-nums">{state === 'loading' ? '—' : m.value}</dd>
            <dd className="mt-2 text-[0.8125rem] text-ink-faint">{m.hint}</dd>
          </button>
        ))}
      </dl>

      <section className="adm-card overflow-hidden" aria-labelledby="recent-title">
        <div className="flex items-center justify-between border-b border-stone-deep px-5 py-4">
          <div>
            <h2 id="recent-title" className="text-base font-semibold">
              Latest order requests
            </h2>
            <p className="text-sm text-ink-soft">
              {o.total ?? 0} in total{refreshedAt ? ` · updated ${refreshedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
          </div>
          <button type="button" onClick={() => onNavigateTab('orders')} className="adm-btn-quiet">
            All requests <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {state === 'loading' ? (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">Loading…</p>
        ) : recent.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-medium">No order requests yet</p>
            <p className="mt-1 text-sm text-ink-soft">Requests sent from the customer website appear here as soon as they are saved.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Customer</th>
                  <th>City</th>
                  <th>Pieces</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r.id} className="cursor-pointer hover:bg-[#FAF8F5]" onClick={() => onOpenOrder(r.id)}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Thumb src={r.firstImage} />
                        <button type="button" className="font-mono text-[0.8125rem] font-medium text-burgundy hover:underline" onClick={() => onOpenOrder(r.id)}>
                          {r.id}
                        </button>
                      </div>
                    </td>
                    <td>
                      <p className="font-medium">{r.customerName}</p>
                      <p className="text-[0.8125rem] text-ink-soft">+91 {r.customerPhone}</p>
                    </td>
                    <td className="text-ink-soft">{r.deliveryCity}</td>
                    <td className="tabular-nums">{r.itemCount}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="whitespace-nowrap text-ink-soft">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
