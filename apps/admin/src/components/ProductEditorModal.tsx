import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Category, OCCASIONS, Product } from '@swayari/shared';
import { Drawer, ErrorBanner } from './ui';

interface ProductEditorModalProps {
  productId?: string | null;
  onClose: () => void;
  onSaved: (name: string) => void;
}

interface Asset {
  path: string;
  name: string;
  category: string;
}

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const Section: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <section className="adm-card p-5">
    <h3 className="adm-section-title">{title}</h3>
    {hint && <p className="adm-hint">{hint}</p>}
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);

function parseBulkTiers(text: string) {
  if (!text.trim()) return [];
  try {
    if (text.trim().startsWith('[')) return JSON.parse(text);
  } catch {}
  return text
    .split('\n')
    .map(line => {
      const parts = line.split(/[:,-]/).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const minQty = parseInt(parts[0], 10);
        const unitPrice = parseFloat(parts[1]);
        if (minQty && !isNaN(unitPrice)) {
          return { minQuantity: minQty, unitPrice, label: `${minQty}+ pcs` };
        }
      }
      return null;
    })
    .filter(Boolean);
}

/** Structured product editor. Only confirmed details belong in material/dimensions/price. */
export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({ productId, onClose, onSaved }) => {
  const editing = Boolean(productId);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(editing ? 'loading' : 'ready');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [slugTouched, setSlugTouched] = useState(editing);

  const [f, setF] = useState({
    sku: '',
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    material: '',
    dimensions: '',
    indicativePrice: '',
    priceType: 'piece' as 'piece' | 'set',
    setContents: '',
    minQuantity: '1',
    orderIncrement: '1',
    isQuoteOnly: false,
    shippingInfo: '',
    supportsIndividual: true,
    supportsBulk: true,
    customisationInfo: '',
    availabilityLabel: 'Available on request',
    status: 'draft' as Product['status'],
    isDemo: false
  });
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [bulkTiersText, setBulkTiersText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  useEffect(() => {
    (async () => {
      try {
        const [c, a] = await Promise.all([fetch('/api/admin/categories'), fetch('/api/admin/assets')]);
        if (c.ok) setCategories((await c.json()).categories || []);
        if (a.ok) setAssets((await a.json()).assets || []);
        if (productId) {
          const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`);
          if (!res.ok) throw new Error();
          const p: Product = (await res.json()).product;
          setF({
            sku: p.sku,
            name: p.name,
            slug: p.slug,
            description: p.description,
            categoryId: p.categoryId || '',
            material: p.material || '',
            dimensions: p.dimensions || '',
            indicativePrice: p.indicativePrice === null || p.indicativePrice === undefined ? '' : String(p.indicativePrice),
            priceType: p.priceType || 'piece',
            setContents: p.setContents || '',
            minQuantity: String(p.minQuantity || 1),
            orderIncrement: String(p.orderIncrement || 1),
            isQuoteOnly: Boolean(p.isQuoteOnly),
            shippingInfo: p.shippingInfo || '',
            supportsIndividual: p.supportsIndividual !== false,
            supportsBulk: p.supportsBulk !== false,
            customisationInfo: p.customisationInfo || '',
            availabilityLabel: p.availabilityLabel || 'Available on request',
            status: p.status,
            isDemo: Boolean(p.isDemo)
          });
          setSelectedOccasions(p.occasions || []);
          setBulkTiersText(
            p.bulkTiers && p.bulkTiers.length > 0
              ? p.bulkTiers.map(t => `${t.minQuantity}: ${t.unitPrice}`).join('\n')
              : ''
          );
          setImages(p.images || []);
        }
        setState('ready');
      } catch {
        setState('error');
      }
    })();
  }, [productId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!f.sku.trim() || !f.name.trim() || !f.description.trim()) {
      setError('SKU, name and description are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/products/${encodeURIComponent(productId!)}` : '/api/admin/products', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: f.sku.trim(),
          name: f.name.trim(),
          slug: (f.slug || slugify(f.name)).trim(),
          description: f.description.trim(),
          categoryId: f.categoryId || null,
          images,
          material: f.material.trim() || null,
          dimensions: f.dimensions.trim() || null,
          indicativePrice: f.indicativePrice === '' ? null : Number(f.indicativePrice),
          priceType: f.priceType,
          setContents: f.setContents.trim() || null,
          minQuantity: Number(f.minQuantity) || 1,
          orderIncrement: Number(f.orderIncrement) || 1,
          isQuoteOnly: Boolean(f.isQuoteOnly),
          bulkTiers: parseBulkTiers(bulkTiersText),
          shippingInfo: f.shippingInfo.trim() || null,
          occasions: selectedOccasions,
          supportsIndividual: f.supportsIndividual,
          supportsBulk: f.supportsBulk,
          availabilityLabel: f.availabilityLabel.trim() || 'Available on request',
          customisationInfo: f.customisationInfo.trim() || null,
          status: f.status,
          isDemo: f.isDemo
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'The product was not saved.');
      onSaved(f.name.trim());
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      onClose={onClose}
      width="max-w-[760px]"
      title={editing ? `Edit ${f.name || 'product'}` : 'New product'}
      subtitle={editing ? f.sku : 'Saved products appear on the customer website once published (unless marked as a sample).'}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="adm-btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="product-form" className="adm-btn-primary" disabled={saving || state !== 'ready'}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
          </button>
        </div>
      }
    >
      {state === 'loading' && <p className="py-12 text-center text-sm text-ink-soft">Loading product…</p>}
      {state === 'error' && <ErrorBanner message="Could not load this product." />}
      {state === 'ready' && (
        <form id="product-form" onSubmit={save} className="space-y-5" noValidate>
          {error && <ErrorBanner message={error} />}

          <Section title="Basics">
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <label>
                <span className="adm-label">SKU</span>
                <input className="adm-input font-mono uppercase" value={f.sku} onChange={set('sku')} placeholder="SWY-001" required />
              </label>
              <label>
                <span className="adm-label">Name</span>
                <input
                  className="adm-input"
                  value={f.name}
                  required
                  onChange={e => {
                    const name = e.target.value;
                    setF(prev => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
                  }}
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="adm-label">Web address</span>
                <div className="flex items-center rounded-md border border-stone-shade bg-white focus-within:border-burgundy focus-within:ring-1 focus-within:ring-burgundy">
                  <span className="pl-3 text-sm text-ink-faint">/product/</span>
                  <input
                    className="w-full bg-transparent px-1 py-2 text-[0.9375rem] focus:outline-none"
                    value={f.slug}
                    onChange={e => {
                      setSlugTouched(true);
                      setF(prev => ({ ...prev, slug: slugify(e.target.value) }));
                    }}
                  />
                </div>
              </label>
              <label>
                <span className="adm-label">Category</span>
                <select className="adm-input" value={f.categoryId} onChange={set('categoryId')}>
                  <option value="">No category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="adm-label">Description</span>
              <textarea className="adm-input" rows={4} value={f.description} onChange={set('description')} required placeholder="Describe what the photographs show and anything the team has confirmed." />
            </label>
          </Section>

          <Section title="Confirmed details" hint="Leave blank anything not yet confirmed — blank fields are simply not shown to customers.">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="adm-label">Material</span>
                <input className="adm-input" value={f.material} onChange={set('material')} />
              </label>
              <label>
                <span className="adm-label">Dimensions / weight</span>
                <input className="adm-input" value={f.dimensions} onChange={set('dimensions')} placeholder="e.g. 30 × 25 cm" />
              </label>
            </div>
            <label className="block">
              <span className="adm-label">Personalisation or packing information</span>
              <input className="adm-input" value={f.customisationInfo} onChange={set('customisationInfo')} />
            </label>
          </Section>

          <Section title="Price, packaging & quantity">
            <div className="grid gap-4 sm:grid-cols-3">
              <label>
                <span className="adm-label">Indicative price (₹)</span>
                <input
                  type="number"
                  min={0}
                  className="adm-input"
                  value={f.indicativePrice}
                  onChange={set('indicativePrice')}
                  placeholder="Blank = on request"
                  disabled={f.isQuoteOnly}
                />
              </label>
              <label>
                <span className="adm-label">Price unit</span>
                <select className="adm-input" value={f.priceType} onChange={set('priceType')}>
                  <option value="piece">Per piece (/ pc)</option>
                  <option value="set">Per set (/ set)</option>
                </select>
              </label>
              <label>
                <span className="adm-label">Availability label</span>
                <input className="adm-input" value={f.availabilityLabel} onChange={set('availabilityLabel')} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-burgundy"
                  checked={f.isQuoteOnly}
                  onChange={set('isQuoteOnly')}
                />
                <span className="text-sm font-medium">Quote only (never place in a confirmed budget band)</span>
              </label>
              <label>
                <span className="adm-label">Set contents (if applicable)</span>
                <input
                  className="adm-input"
                  value={f.setContents}
                  onChange={set('setContents')}
                  placeholder="e.g. 1 Handcrafted Uruli + 4 Diya cups"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="adm-label">Minimum order quantity (MOQ)</span>
                <input type="number" min={1} className="adm-input" value={f.minQuantity} onChange={set('minQuantity')} />
              </label>
              <label>
                <span className="adm-label">Order increment</span>
                <input type="number" min={1} className="adm-input" value={f.orderIncrement} onChange={set('orderIncrement')} />
              </label>
            </div>

            <div>
              <span className="adm-label">Volume pricing tiers (one per line: MinQty: UnitPrice)</span>
              <textarea
                className="adm-input font-mono text-xs"
                rows={3}
                value={bulkTiersText}
                onChange={e => setBulkTiersText(e.target.value)}
                placeholder="25: 85&#10;50: 75&#10;100: 65"
              />
              <p className="mt-1 text-xs text-ink-soft">
                Example: <code>25: 85</code> means 25+ pieces cost ₹85 each.
              </p>
            </div>

            <div>
              <span className="adm-label">Shipping & delivery terms</span>
              <input
                className="adm-input"
                value={f.shippingInfo}
                onChange={set('shippingInfo')}
                placeholder="e.g. Dispatches in 24–48 hours across India. Insured transit."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-burgundy"
                  checked={f.supportsIndividual}
                  onChange={set('supportsIndividual')}
                />
                <span className="text-sm">Supports individual retail purchase</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-burgundy"
                  checked={f.supportsBulk}
                  onChange={set('supportsBulk')}
                />
                <span className="text-sm">Supports bulk return gifting requests</span>
              </label>
            </div>

            <div className="pt-2">
              <span className="adm-label">Suitable occasions & events</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {OCCASIONS.map(occ => {
                  const active = selectedOccasions.includes(occ.id);
                  return (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() =>
                        setSelectedOccasions(prev =>
                          active ? prev.filter(id => id !== occ.id) : [...prev, occ.id]
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'bg-burgundy text-white'
                          : 'border border-stone-shade bg-white text-ink hover:border-burgundy'
                      }`}
                    >
                      {occ.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section title="Photographs" hint="Real product photographs only. The first photograph is the main image.">
            {images.length > 0 && (
              <ol className="flex flex-wrap gap-3">
                {images.map((src, i) => (
                  <li key={src} className="relative">
                    <img src={src} alt="" className="h-28 w-[90px] rounded border border-stone-deep object-cover" />
                    {i === 0 && <span className="absolute left-1 top-1 rounded bg-white/90 px-1.5 text-[0.6875rem] font-medium">Main</span>}
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter(p => p !== src))}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
                      aria-label="Remove photograph"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </li>
                ))}
              </ol>
            )}
            <div>
              <p className="adm-label">Photo library</p>
              {assets.length === 0 ? (
                <p className="text-sm text-ink-soft">No product photographs are deployed yet.</p>
              ) : (
                <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
                  {assets.map(a => {
                    const on = images.includes(a.path);
                    return (
                      <button
                        key={a.path}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setImages(prev => (on ? prev.filter(p => p !== a.path) : [...prev, a.path]))}
                        className={`relative overflow-hidden rounded border-2 text-left ${on ? 'border-burgundy' : 'border-transparent hover:border-stone-shade'}`}
                        title={a.name}
                      >
                        <img src={a.path} alt="" loading="lazy" className="aspect-[4/5] w-full bg-stone object-cover" />
                        <span className="block truncate px-1 py-0.5 text-[0.6875rem] text-ink-soft">{a.name}</span>
                        {on && (
                          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-burgundy text-white">
                            <Check className="h-3 w-3" aria-hidden />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Section>

          <Section title="Visibility">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="adm-label">Status</span>
                <select className="adm-input" value={f.status} onChange={set('status')}>
                  <option value="draft">Draft — hidden</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived — hidden, kept for past requests</option>
                </select>
              </label>
              <label className="flex items-start gap-3 rounded-md border border-stone-deep bg-[#FAF8F5] p-3">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-burgundy" checked={f.isDemo} onChange={set('isDemo')} />
                <span>
                  <span className="block text-sm font-medium">Sample / preview item</span>
                  <span className="block text-[0.8125rem] text-ink-soft">Never shown on the public website and cannot be requested by customers.</span>
                </span>
              </label>
            </div>
          </Section>
        </form>
      )}
    </Drawer>
  );
};
