import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Archive, Package, Pencil, Plus, Search } from 'lucide-react';
import { Product, formatPrice } from '@swayari/shared';
import { ProductEditorModal } from '../components/ProductEditorModal';
import { EmptyState, ErrorBanner, Notice, PageHeader, SkeletonRows, StatusBadge, Thumb } from '../components/ui';

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
        eyebrow="Catalogue"
        title="Products"
        description="What customers can request. Only confirmed details should be entered; sample items stay hidden from the public website."
        actions={
          <button type="button" className="adm-btn-primary" onClick={() => setEditor({ id: null })}>
            <Plus className="h-4 w-4" aria-hidden /> New product
          </button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0" role="group" aria-label="Filter by status">
          {['all', 'published', 'draft', 'archived'].map(s => (
            <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)} className={status === s ? 'adm-chip-on' : 'adm-chip-off'}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <form
          role="search"
          className="relative w-full flex-shrink-0 lg:w-72"
          onSubmit={e => {
            e.preventDefault();
            setApplied(query.trim());
          }}
        >
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-dark" aria-hidden />
          <input
            id="product-search"
            type="search"
            className="adm-input rounded-full pl-10"
            placeholder="Name or SKU"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (!e.target.value) setApplied('');
            }}
          />
        </form>
      </div>

      {notice && <Notice key={notice} tone={notice.startsWith('Could not') ? 'warning' : 'success'}>{notice}</Notice>}
      {state === 'error' && <ErrorBanner message="Could not load products." onRetry={load} />}

      <div className="adm-card overflow-hidden">
        {state === 'loading' ? (
          <SkeletonRows rows={6} label="Loading products…" />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products here yet"
            action={
              <button type="button" className="adm-btn-secondary" onClick={() => setEditor({ id: null })}>
                <Plus className="h-4 w-4" aria-hidden /> New product
              </button>
            }
          >
            Add a product with its real photographs and confirmed details.
          </EmptyState>
        ) : (
          <>
            {/* Phones: stacked cards */}
            <ul className="adm-list md:hidden">
              {products.map(p => (
                <li key={p.id} className="flex gap-3 px-4 py-4">
                  <Thumb src={p.images?.[0]} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <button type="button" className="min-h-[24px] text-left font-semibold leading-snug text-ink hover:text-burgundy" onClick={() => setEditor({ id: p.id })}>
                        {p.name}
                      </button>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="mt-1 text-[0.8125rem] text-ink-soft">
                      <span className="font-mono text-[0.75rem]">{p.sku}</span> · {p.categoryName || '—'}
                    </p>
                    {p.isDemo && <p className="mt-1 text-[0.75rem] text-gold-dark">Sample — hidden from the public website</p>}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="font-semibold tabular-nums">{p.indicativePrice === null ? 'On request' : formatPrice(p.indicativePrice)}</span>
                      <span className="-mr-2 flex gap-1">
                        <button type="button" className="adm-btn-quiet h-10 px-3" onClick={() => setEditor({ id: p.id })}>
                          Edit
                        </button>
                        {p.status !== 'archived' && (
                          <button type="button" className="adm-btn-quiet h-10 px-3 hover:bg-red-50 hover:text-red-800" onClick={() => archive(p)}>
                            Archive
                          </button>
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {/* Tablet and desktop: table with sticky header */}
            <div className="adm-table-scroll hidden md:block">
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
                    <tr key={p.id} className="group">
                      <td>
                        <div className="flex items-center gap-3.5">
                          <Thumb src={p.images?.[0]} size="md" />
                          <div className="min-w-0">
                            <button type="button" className="text-left font-semibold text-ink underline-offset-4 hover:text-burgundy hover:underline" onClick={() => setEditor({ id: p.id })}>
                              {p.name}
                            </button>
                            {p.isDemo && <p className="mt-0.5 text-[0.75rem] text-gold-dark">Sample — hidden from the public website</p>}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap font-mono text-[0.75rem] text-ink-soft">{p.sku}</td>
                      <td className="whitespace-nowrap text-ink-soft">{p.categoryName || '—'}</td>
                      <td className="whitespace-nowrap text-right font-medium tabular-nums">{p.indicativePrice === null ? <span className="font-normal text-ink-faint">On request</span> : formatPrice(p.indicativePrice)}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="whitespace-nowrap text-right">
                        <span className="inline-flex gap-1 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
                          <button type="button" className="adm-btn-quiet h-9 px-3" onClick={() => setEditor({ id: p.id })}>
                            <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                          </button>
                          {p.status !== 'archived' && (
                            <button type="button" className="adm-btn-quiet h-9 px-3 hover:bg-red-50 hover:text-red-800" onClick={() => archive(p)}>
                              <Archive className="h-3.5 w-3.5" aria-hidden /> Archive
                            </button>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
};
