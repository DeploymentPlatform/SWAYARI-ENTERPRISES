import React, { useState, useEffect } from 'react';
import { Order, formatPrice, formatDate, getStatusMeta, ORDER_STATUSES } from '@swayari/shared';
import { Search, ShoppingBag, Eye, RefreshCw } from 'lucide-react';
import { OrderDetailModal } from '../components/OrderDetailModal';

interface OrdersPageProps {
  initialSelectedOrderId?: string | null;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ initialSelectedOrderId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(initialSelectedOrderId || null);

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  async function fetchOrders() {
    setLoading(true);
    try {
      let url = '/api/admin/orders';
      const params = [];
      if (selectedStatus !== 'all') {
        params.push(`status=${encodeURIComponent(selectedStatus)}`);
      }
      if (searchQuery.trim()) {
        params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      }
      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchOrders();
  }

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-ivory-border shadow-subtle">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Customer Order Requests</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage telephone consultations, quotation revisions, and dispatch statuses.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-light absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by order ref, name, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-ivory rounded-lg border border-ivory-border focus:border-burgundy focus:outline-none"
          />
        </form>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selectedStatus === 'all'
              ? 'bg-burgundy text-white font-semibold shadow-sm'
              : 'bg-white text-charcoal hover:bg-ivory border border-ivory-border'
          }`}
        >
          All Requests
        </button>
        {ORDER_STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setSelectedStatus(s.value)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedStatus === s.value
                ? 'bg-burgundy text-white font-semibold shadow-sm'
                : 'bg-white text-charcoal hover:bg-ivory border border-ivory-border'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-ivory-border shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-muted animate-pulse">
            Loading orders list...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-xs text-charcoal-muted space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-charcoal-light stroke-[1.5]" />
            <p className="font-semibold text-charcoal text-sm">No matching order requests found</p>
            <p className="font-light">Try adjusting your status filter or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory/60 text-charcoal-muted uppercase tracking-wider text-[10px] border-b border-ivory-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Contact Phone</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Items</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-border/60">
                {orders.map(o => {
                  const statusMeta = getStatusMeta(o.status);
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setActiveOrderId(o.id)}
                      className="hover:bg-ivory-light/70 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-burgundy">{o.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-charcoal">{o.customerName}</td>
                      <td className="py-3.5 px-4 text-charcoal-muted font-mono">+91 {o.customerPhone}</td>
                      <td className="py-3.5 px-4 text-charcoal-muted">{o.deliveryCity}, {o.deliveryState}</td>
                      <td className="py-3.5 px-4 font-medium text-charcoal">{o.itemCount} items</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-ivory-muted text-charcoal border border-ivory-border">
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-light text-[11px]">{formatDate(o.createdAt)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setActiveOrderId(o.id);
                          }}
                          className="px-3 py-1 rounded bg-burgundy-light text-burgundy hover:bg-burgundy hover:text-white font-medium transition-colors text-[11px] inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
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

      {/* Order Detail Modal */}
      {activeOrderId && (
        <OrderDetailModal
          orderId={activeOrderId}
          onClose={() => setActiveOrderId(null)}
          onOrderUpdated={() => fetchOrders()}
        />
      )}
    </div>
  );
};
