import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layers, Plus } from 'lucide-react';
import { EmptyState, ErrorBanner, PageHeader, SkeletonRows } from '../components/ui';
import { EASE_LUXURY } from '../components/motion';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    setState('loading');
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error();
      setCategories((await res.json()).categories || []);
      setState('ready');
    } catch {
      setState('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setFormError('Please enter a category name.');
    setFormError(null);
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), description: description.trim(), displayOrder: Number(displayOrder) || 0 })
    }).catch(() => null);
    if (!res?.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      return setFormError(data.error || 'The category was not saved.');
    }
    setName('');
    setDescription('');
    setDisplayOrder('0');
    setCreating(false);
    load();
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="Groups shown as filters on the customer website. Categories without published products are hidden there automatically."
        actions={
          !creating && (
            <button type="button" className="adm-btn-primary" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> New category
            </button>
          )
        }
      />

      <AnimatePresence initial={false}>
        {creating && (
          <motion.form
            onSubmit={create}
            className="adm-card overflow-hidden"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.45, ease: EASE_LUXURY }}
          >
            <div className="adm-card-header">
              <div>
                <p className="adm-eyebrow">New</p>
                <h2 className="adm-card-title mt-1">Add a category</h2>
              </div>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              {formError && <ErrorBanner message={formError} />}
              <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                <label>
                  <span className="adm-label">Name</span>
                  <input className="adm-input" value={name} onChange={e => setName(e.target.value)} autoFocus />
                </label>
                <label>
                  <span className="adm-label">Order</span>
                  <input type="number" className="adm-input" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} />
                </label>
              </div>
              <label className="block">
                <span className="adm-label">Description (optional)</span>
                <input className="adm-input" value={description} onChange={e => setDescription(e.target.value)} />
              </label>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-stone-deep/80 bg-ivory-light px-5 py-3 sm:flex-row sm:justify-end sm:px-6">
              <button type="button" className="adm-btn-quiet" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <button type="submit" className="adm-btn-primary">
                Save category
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {state === 'error' && <ErrorBanner message="Could not load categories." onRetry={load} />}

      <div className="adm-card overflow-hidden">
        {state === 'loading' ? (
          <SkeletonRows rows={4} thumb={false} label="Loading…" />
        ) : categories.length === 0 ? (
          <EmptyState icon={Layers} title="No categories yet.">
            Create a category to group products into filters on the customer website.
          </EmptyState>
        ) : (
          <>
            {/* Phones: stacked rows */}
            <ul className="adm-list sm:hidden">
              {categories.map(c => (
                <li key={c.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-ink">{c.name}</p>
                    <span className="adm-badge-gold flex-shrink-0 tabular-nums">{c.productCount} products</span>
                  </div>
                  {c.description && <p className="mt-1 text-[0.8125rem] text-ink-soft">{c.description}</p>}
                  <p className="mt-2 flex items-center justify-between gap-3 text-[0.75rem] text-ink-faint">
                    <span className="truncate font-mono">/shop?category={c.slug}</span>
                    <span className="flex-shrink-0">Order {c.displayOrder}</span>
                  </p>
                </li>
              ))}
            </ul>
            <div className="adm-table-wrap hidden sm:block">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Web address</th>
                    <th className="text-right">Products</th>
                    <th className="text-right">Order</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td>
                        <p className="font-semibold">{c.name}</p>
                        {c.description && <p className="mt-0.5 text-[0.8125rem] text-ink-soft">{c.description}</p>}
                      </td>
                      <td>
                        <code className="whitespace-nowrap rounded-md bg-stone/70 px-2 py-1 font-mono text-[0.75rem] text-ink-soft">/shop?category={c.slug}</code>
                      </td>
                      <td className="text-right font-medium tabular-nums">{c.productCount}</td>
                      <td className="text-right tabular-nums text-ink-soft">{c.displayOrder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
