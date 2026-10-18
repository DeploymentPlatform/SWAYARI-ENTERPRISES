import React, { useState, useEffect } from 'react';
import { Category } from '@swayari/shared';
import { Layers, Plus, Loader2 } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), displayOrder })
      });
      if (res.ok) {
        setName('');
        setDescription('');
        setDisplayOrder(0);
        setIsCreating(false);
        fetchCategories();
      }
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-ivory-border shadow-subtle">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Category Taxonomy</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Organize products into curated devotional collections and occasions.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        )}
      </div>

      {/* Create Category Inline Card */}
      {isCreating && (
        <form onSubmit={handleCreateCategory} className="bg-white p-5 rounded-2xl border border-burgundy/30 shadow-subtle space-y-4 text-xs">
          <h3 className="font-semibold text-charcoal">Add New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-charcoal block mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="E.g. Sacred Pooja Urulis"
                className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light"
              />
            </div>
            <div>
              <label className="font-medium text-charcoal block mb-1">Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={e => setDisplayOrder(Number(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light"
              />
            </div>
          </div>
          <div>
            <label className="font-medium text-charcoal block mb-1">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short collection description..."
              className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-lg border border-ivory-border text-charcoal hover:bg-ivory"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-burgundy text-white font-medium hover:bg-burgundy-hover"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-ivory-border shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-charcoal-muted animate-pulse">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-muted">
            No categories defined yet.
          </div>
        ) : (
          <div className="divide-y divide-ivory-border/60">
            {categories.map(c => (
              <div key={c.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-ivory-light/50 text-xs">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-charcoal text-sm">{c.name}</h4>
                  <p className="text-charcoal-light font-mono text-[11px]">slug: {c.slug}</p>
                  {c.description && <p className="text-charcoal-muted font-light">{c.description}</p>}
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-ivory-muted text-charcoal font-semibold text-[11px]">
                    {c.productCount || 0} Products
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
