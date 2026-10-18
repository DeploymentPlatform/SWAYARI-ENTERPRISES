import React, { useState, useEffect } from 'react';
import { formatPrice, formatDate, getStatusMeta, Order } from '@swayari/shared';
import { ShoppingBag, Package, CheckCircle2, Clock, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  onOpenOrder: (orderId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab, onOpenOrder }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    fetchDashboardData();

    // Polling every 30 seconds, paused when tab is hidden
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders?limit=6')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.orders || []);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  const orderStats = stats?.orders || {
    total: 0,
    new_request: 0,
    contacted: 0,
    quoted: 0,
    confirmed: 0,
    dispatched: 0,
    completed: 0
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & Refresh Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-ivory-border shadow-subtle">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Studio Operations Dashboard</h1>
          <p className="text-xs text-charcoal-muted mt-1 font-light">
            Real-time enquiry flow from the customer storefront.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-charcoal-light font-mono">
            Updated: {lastRefreshed.toLocaleTimeString('en-IN')}
          </span>
          <button
            onClick={() => fetchDashboardData()}
            className="p-2 rounded-lg bg-ivory border border-ivory-border hover:bg-ivory-muted text-charcoal transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: New Requests (Actionable) */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-2xl border border-ivory-border shadow-subtle hover:border-burgundy/40 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
              Action Required
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-charcoal">{orderStats.new_request}</span>
            <p className="text-xs text-charcoal-muted mt-1">New Uncontacted Requests</p>
          </div>
        </div>

        {/* Card 2: Quoted / In Discussion */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-2xl border border-ivory-border shadow-subtle hover:border-burgundy/40 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
              In Negotiation
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-charcoal">
              {orderStats.contacted + orderStats.quoted}
            </span>
            <p className="text-xs text-charcoal-muted mt-1">Contacted &amp; Quoted</p>
          </div>
        </div>

        {/* Card 3: Dispatched / Confirmed */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-2xl border border-ivory-border shadow-subtle hover:border-burgundy/40 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Fulfillment
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-charcoal">
              {orderStats.confirmed + orderStats.dispatched}
            </span>
            <p className="text-xs text-charcoal-muted mt-1">Confirmed &amp; Dispatched</p>
          </div>
        </div>

        {/* Card 4: Total Value Quoted */}
        <div className="bg-white p-5 rounded-2xl border border-ivory-border shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-burgundy bg-burgundy-light px-2.5 py-0.5 rounded-full">
              Quotation Volume
            </span>
            <div className="w-8 h-8 rounded-full bg-burgundy-light text-burgundy flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-burgundy">
              {formatPrice(stats?.totalRevenueQuoted || 0)}
            </span>
            <p className="text-xs text-charcoal-muted mt-1">Official Studio Quotes Issued</p>
          </div>
        </div>

      </div>

      {/* Recent Order Requests Table */}
      <div className="bg-white rounded-2xl border border-ivory-border shadow-subtle overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-ivory-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal">Recent Customer Requests</h3>
            <p className="text-xs text-charcoal-muted font-light mt-0.5">
              Click any order to review customer address, requested pieces, and manage quotations.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-burgundy hover:underline"
          >
            <span>View All ({orderStats.total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-charcoal-muted animate-pulse">
            Loading recent requests...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-muted space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-charcoal-light stroke-[1.5]" />
            <p className="font-semibold text-charcoal">No customer requests received yet</p>
            <p className="font-light max-w-sm mx-auto">
              When visitors submit order requests on the storefront, they will immediately appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory/60 text-charcoal-muted uppercase tracking-wider text-[10px] border-b border-ivory-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Phone</th>
                  <th className="py-3 px-4 font-semibold">Destination</th>
                  <th className="py-3 px-4 font-semibold">Pieces</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-border/60">
                {recentOrders.map(order => {
                  const statusMeta = getStatusMeta(order.status);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => onOpenOrder(order.id)}
                      className="hover:bg-ivory-light/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-burgundy">{order.id}</td>
                      <td className="py-3.5 px-4 font-medium text-charcoal">{order.customerName}</td>
                      <td className="py-3.5 px-4 text-charcoal-muted">+91 {order.customerPhone}</td>
                      <td className="py-3.5 px-4 text-charcoal-muted">{order.deliveryCity}, {order.deliveryState}</td>
                      <td className="py-3.5 px-4 font-semibold text-charcoal">{order.itemCount} items</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-ivory-muted text-charcoal border border-ivory-border">
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-light text-[11px]">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onOpenOrder(order.id);
                          }}
                          className="px-3 py-1 rounded bg-burgundy-light text-burgundy hover:bg-burgundy hover:text-white font-medium transition-colors text-[11px]"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
