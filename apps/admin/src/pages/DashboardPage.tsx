import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Inbox, MessageCircle, Package, RefreshCw, Truck } from 'lucide-react';
import { formatDate } from '@swayari/shared';
import { EmptyState, ErrorBanner, PageHeader, SkeletonRows, StatusBadge, Thumb } from '../components/ui';
import { CountUp, EASE_LUXURY, Stagger, StaggerItem } from '../components/motion';

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
    { label: 'New requests', value: o.new_request ?? 0, hint: 'Not yet contacted', tab: 'orders', emphasis: (o.new_request ?? 0) > 0, icon: Inbox },
    { label: 'In discussion', value: (o.contacted ?? 0) + (o.quoted ?? 0), hint: 'Contacted or quoted', tab: 'orders', icon: MessageCircle },
    { label: 'Confirmed / dispatched', value: (o.confirmed ?? 0) + (o.dispatched ?? 0), hint: 'Being fulfilled', tab: 'orders', icon: Truck },
    { label: 'Live products', value: p.published ?? 0, hint: `${p.draft ?? 0} draft · ${p.archived ?? 0} archived${p.samples ? ` · ${p.samples} samples` : ''}`, tab: 'products', icon: Package }
  ];
  const updated = refreshedAt ? refreshedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={greeting()}
        title="Overview"
        description="Current order requests and catalogue counts from the shared database."
        actions={
          <button type="button" className="adm-btn-secondary" onClick={load}>
            <RefreshCw className="h-4 w-4" aria-hidden /> Refresh
          </button>
        }
      />

      {state === 'error' && <ErrorBanner message="Could not load the latest figures." onRetry={load} />}

      <Stagger as="dl" className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <StaggerItem key={m.label}>
              <button
                type="button"
                onClick={() => onNavigateTab(m.tab)}
                className={`adm-card adm-card-hover group relative flex h-full w-full flex-col overflow-hidden p-5 text-left sm:p-6 ${
                  m.emphasis ? 'border-gold/50 bg-gradient-to-br from-white to-gold-pale/60' : ''
                }`}
              >
                <span aria-hidden className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="flex items-start justify-between gap-3">
                  <dt className="text-[0.8125rem] font-semibold text-ink-soft">{m.label}</dt>
                  <span
                    aria-hidden
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-1 transition-transform duration-500 ease-luxury group-hover:scale-105 ${
                      m.emphasis ? 'bg-burgundy text-gold-light ring-burgundy' : 'bg-gold-pale/70 text-gold-dark ring-gold/25'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  </span>
                </span>
                <dd className="mt-4 font-display text-[2.75rem] font-semibold leading-none text-ink [font-variant-numeric:lining-nums_tabular-nums] sm:text-[3rem]">
                  {state === 'loading' ? <span className="adm-skeleton inline-block h-10 w-16 align-middle" aria-label="Loading" /> : <CountUp value={m.value} />}
                </dd>
                <dd className="mt-3 flex items-center gap-2 text-[0.8125rem] text-ink-faint">
                  {m.emphasis && <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-burgundy-accent motion-reduce:animate-none" />}
                  {m.hint}
                </dd>
              </button>
            </StaggerItem>
          );
        })}
      </Stagger>

      <motion.section
        className="adm-card overflow-hidden"
        aria-labelledby="recent-title"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_LUXURY, delay: 0.25 }}
      >
        <div className="adm-card-header">
          <div>
            <h2 id="recent-title" className="adm-card-title">
              Latest order requests
            </h2>
            <p className="mt-0.5 text-[0.8125rem] text-ink-soft">
              {o.total ?? 0} in total{updated ? ` · updated ${updated}` : ''}
            </p>
          </div>
          <button type="button" onClick={() => onNavigateTab('orders')} className="adm-btn-quiet -mr-2 text-burgundy hover:text-burgundy-hover">
            All requests <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {state === 'loading' ? (
          <SkeletonRows rows={5} label="Loading…" />
        ) : recent.length === 0 ? (
          <EmptyState icon={Inbox} title="No order requests yet">
            Requests sent from the customer website appear here as soon as they are saved.
          </EmptyState>
        ) : (
          <>
            {/* Phones: stacked rows */}
            <ul className="adm-list md:hidden">
              {recent.map(r => (
                <li key={r.id}>
                  <button type="button" className="adm-list-row" onClick={() => onOpenOrder(r.id)}>
                    <Thumb src={r.firstImage} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="truncate font-semibold text-ink">{r.customerName}</span>
                        <StatusBadge status={r.status} />
                      </span>
                      <span className="mt-0.5 block font-mono text-[0.75rem] text-burgundy">{r.id}</span>
                      <span className="mt-1 block text-[0.8125rem] text-ink-soft">
                        {r.deliveryCity} · {r.itemCount} pcs · {formatDate(r.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {/* Tablet and desktop: table */}
            <div className="adm-table-wrap hidden md:block">
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
                    <tr key={r.id} className="cursor-pointer" onClick={() => onOpenOrder(r.id)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Thumb src={r.firstImage} />
                          <button type="button" className="font-mono text-[0.8125rem] font-semibold text-burgundy underline-offset-4 hover:underline" onClick={() => onOpenOrder(r.id)}>
                            {r.id}
                          </button>
                        </div>
                      </td>
                      <td>
                        <p className="font-semibold">{r.customerName}</p>
                        <p className="text-[0.8125rem] text-ink-faint">+91 {r.customerPhone}</p>
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
          </>
        )}
      </motion.section>
    </div>
  );
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
