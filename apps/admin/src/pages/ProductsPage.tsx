import React, { useState, useEffect } from 'react';
import { Product, formatPrice } from '@swayari/shared';
import { Plus, Search, Edit3, Archive, Package, Eye } from 'lucide-react';
import { ProductEditorModal } from '../components/ProductEditorModal';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editorProductId, setEditorProductId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  async function fetchProducts() {
    setLoading(true);
    try {
      let url = '/api/admin/products';
      const params = [];
      if (statusFilter !== 'all') {
        params.push(`status=${encodeURIComponent(statusFilter)}`);
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
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleArchiveProduct(id: string) {
    if (!confirm('Are you sure you want to archive this product? It will be hidden from the storefront, while preserving all past order requests.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to archive product:', err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-ivory-border shadow-subtle">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Catalogue &amp; Inventory Management</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Configure confirmed materials, indicative pricing, and select high-res photos from deployed assets.
          </p>
        </div>

        <button
          onClick={() => {
            setEditorProductId(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1">
          {['all', 'published', 'draft', 'archived'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-burgundy text-white font-semibold shadow-sm'
                  : 'bg-white text-charcoal hover:bg-ivory border border-ivory-border'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-charcoal-light absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchProducts()}
            placeholder="Search SKU or title..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white rounded-lg border border-ivory-border focus:border-burgundy focus:outline-none"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-ivory-border shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-muted animate-pulse">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-xs text-charcoal-muted space-y-2">
            <Package className="w-10 h-10 mx-auto text-charcoal-light stroke-[1.5]" />
            <p className="font-semibold text-charcoal text-sm">No products found</p>
            <p className="font-light">Click "New Product" above to publish your first piece.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory/60 text-charcoal-muted uppercase tracking-wider text-[10px] border-b border-ivory-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Photo</th>
                  <th className="py-3 px-4 font-semibold">SKU</th>
                  <th className="py-3 px-4 font-semibold">Product Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Indicative Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-border/60">
                {products.map(p => {
                  const firstImg = p.images && p.images.length > 0 ? p.images[0] : '/assets/demo/sample_product_1.jpeg';
                  return (
                    <tr key={p.id} className="hover:bg-ivory-light/60 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={firstImg}
                          alt={p.name}
                          className="w-10 h-12 object-cover rounded bg-ivory-muted border border-ivory-border"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-burgundy">{p.sku}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-charcoal line-clamp-1">{p.name}</p>
                        {p.isDemo && (
                          <span className="text-[10px] font-bold text-amber-700 uppercase">Preview Model</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-charcoal-muted">{p.categoryName || '—'}</td>
                      <td className="py-3 px-4 font-serif font-semibold text-charcoal">
                        {formatPrice(p.indicativePrice)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                            p.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'draft'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditorProductId(p.id);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-ivory text-charcoal hover:text-burgundy"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {p.status !== 'archived' && (
                          <button
                            onClick={() => handleArchiveProduct(p.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-charcoal-light hover:text-red-700"
                            title="Archive product"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Editor Modal */}
      {isModalOpen && (
        <ProductEditorModal
          productId={editorProductId}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => fetchProducts()}
        />
      )}
    </div>
  );
};
