import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { ErrorBanner, PageHeader } from '../components/ui';

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
    <div className="max-w-4xl space-y-6">
      <PageHeader
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

      {creating && (
        <form onSubmit={create} className="adm-card space-y-4 p-5">
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
          <div className="flex justify-end gap-2">
            <button type="button" className="adm-btn-quiet" onClick={() => setCreating(false)}>
              Cancel
            </button>
            <button type="submit" className="adm-btn-primary">
              Save category
            </button>
          </div>
        </form>
      )}

      {state === 'error' && <ErrorBanner message="Could not load categories." onRetry={load} />}

      <div className="adm-card overflow-hidden">
        {state === 'loading' ? (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">No categories yet.</p>
        ) : (
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
                    <p className="font-medium">{c.name}</p>
                    {c.description && <p className="text-[0.8125rem] text-ink-soft">{c.description}</p>}
                  </td>
                  <td className="font-mono text-[0.8125rem] text-ink-soft">/shop?category={c.slug}</td>
                  <td className="text-right tabular-nums">{c.productCount}</td>
                  <td className="text-right tabular-nums text-ink-soft">{c.displayOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
