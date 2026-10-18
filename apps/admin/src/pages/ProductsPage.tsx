import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Product, formatPrice } from '@swayari/shared';
import { ProductEditorModal } from '../components/ProductEditorModal';
import { ErrorBanner, PageHeader, StatusBadge, Thumb } from '../components/ui';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [applied, setApplied] = useState('');
  const [editor, setEditor] = useState<{ id: string | null } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setState('loading');
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (applied) params.set('search', applied);
    try {
      const res = await fetch(`/api/admin/products${params.toString() ? `?${params}` : ''}`);
      if (!res.ok) throw new Error();
      setProducts((await res.json()).products || []);
      setState('ready');
    } catch {
      setState('error');
    }
  }

  useEffect(() => {
    load();
  }, [status, applied]);

  async function archive(p: Product) {
    if (!window.confirm(`Archive “${p.name}”? It will be hidden from the customer website. Past requests keep their copy of it.`)) return;
    const res = await fetch(`/api/admin/products/${encodeURIComponent(p.id)}`, { method: 'DELETE' }).catch(() => null);
    setNotice(res?.ok ? `“${p.name}” archived.` : 'Could not archive the product. Please try again.');
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="What customers can request. Only confirmed details should be entered; sample items stay hidden from the public website."
        actions={
          <button type="button" className="adm-btn-primary" onClick={() => setEditor({ id: null })}>
            <Plus className="h-4 w-4" aria-hidden /> New product
          </button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2" role="group" aria-label="Filter by status">
          {['all', 'published', 'draft', 'archived'].map(s => (
            <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)} className={status === s ? 'adm-chip-on' : 'adm-chip-off'}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <form
          role="search"
          className="relative w-full lg:w-72"
          onSubmit={e => {
            e.preventDefault();
            setApplied(query.trim());
          }}
        >
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            id="product-search"
            type="search"
            className="adm-input pl-9"
            placeholder="Name or SKU"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (!e.target.value) setApplied('');
            }}
          />
        </form>
      </div>

      {notice && (
        <p role="status" className="rounded-md border border-stone-deep bg-white px-4 py-2.5 text-sm">
          {notice}
        </p>
      )}
      {state === 'error' && <ErrorBanner message="Could not load products." onRetry={load} />}

      <div className="adm-card overflow-hidden">
        {state === 'loading' ? (
          <p className="px-5 py-12 text-center text-sm text-ink-soft">Loading products…</p>
        ) : products.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-medium">No products here yet</p>
            <p className="mt-1 text-sm text-ink-soft">Add a product with its real photographs and confirmed details.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th className="text-right">Price</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]">
                    <td>
                      <div className="flex items-center gap-3">
                        <Thumb src={p.images?.[0]} size="md" />
                        <div className="min-w-0">
                          <button type="button" className="text-left font-medium hover:text-burgundy hover:underline" onClick={() => setEditor({ id: p.id })}>
                            {p.name}
                          </button>
                          {p.isDemo && <p className="text-[0.8125rem] text-amber-800">Sample — hidden from the public website</p>}
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-[0.8125rem] text-ink-soft">{p.sku}</td>
                    <td className="text-ink-soft">{p.categoryName || '—'}</td>
                    <td className="whitespace-nowrap text-right tabular-nums">{p.indicativePrice === null ? 'On request' : formatPrice(p.indicativePrice)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <button type="button" className="adm-btn-quiet h-8 px-2.5" onClick={() => setEditor({ id: p.id })}>
                        Edit
                      </button>
                      {p.status !== 'archived' && (
                        <button type="button" className="adm-btn-quiet h-8 px-2.5 hover:text-red-800" onClick={() => archive(p)}>
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editor && (
        <ProductEditorModal
          productId={editor.id}
          onClose={() => setEditor(null)}
          onSaved={name => {
            setNotice(`“${name}” saved.`);
            load();
          }}
        />
      )}
    </div>
  );
};
