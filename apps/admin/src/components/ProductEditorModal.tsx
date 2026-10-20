import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { Category, DEITIES, FRAME_SIZES, ORIENTATIONS, Product } from '@swayari/shared';
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
          return { min_qty: minQty, unit_price: unitPrice };
        }
      }
      return null;
    })
    .filter(Boolean);
}

/** Structured devotional frame product editor with strict <= 99 ceiling enforcement. */
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
    isDemo: false,
    deity: '',
    frameSize: '',
    orientation: 'portrait' as 'portrait' | 'landscape' | 'square',
    borderFinish: ''
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
            isDemo: Boolean(p.isDemo),
            deity: p.deity || '',
            frameSize: p.frameSize || '',
            orientation: p.orientation || 'portrait',
            borderFinish: p.borderFinish || ''
          });
          setSelectedOccasions(p.occasions || []);
          setBulkTiersText(
            p.bulkTiers && p.bulkTiers.length > 0
              ? p.bulkTiers.map(t => `${t.min_qty}: ${t.unit_price}`).join('\n')
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

    // Strict ₹99 rule: Frame price cannot exceed ₹99
    if (f.indicativePrice !== '' && Number(f.indicativePrice) > 99) {
      setError('Devotional frames must be priced at ₹99 or less per frame as per confirmed business direction.');
      return;
    }

    const tiers = parseBulkTiers(bulkTiersText);
    for (const t of tiers) {
      if (t.unit_price > 99) {
        setError(`Bulk tier unit price ₹${t.unit_price} exceeds the maximum frame price limit of ₹99.`);
        return;
      }
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
          bulkTiers: tiers,
          shippingInfo: f.shippingInfo.trim() || null,
          occasions: selectedOccasions,
          supportsIndividual: f.supportsIndividual,
          supportsBulk: f.supportsBulk,
          availabilityLabel: f.availabilityLabel.trim() || 'Available on request',
          customisationInfo: f.customisationInfo.trim() || null,
          status: f.status,
          isDemo: f.isDemo,
          deity: f.deity.trim() || null,
          frameSize: f.frameSize.trim() || null,
          orientation: f.orientation,
          borderFinish: f.borderFinish.trim() || null
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
      title={editing ? `Edit ${f.name || 'product'}` : 'New Devotional Frame'}
      subtitle={editing ? f.sku : 'Devotional frames strictly priced at ₹99 or less per frame. Shipping quoted separately.'}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="adm-btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="product-form" className="adm-btn-primary" disabled={saving || state !== 'ready'}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create frame'}
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
                <input className="adm-input font-mono uppercase" value={f.sku} onChange={set('sku')} placeholder="SWY-FRAME-001" required />
              </label>
              <label>
                <span className="adm-label">Name</span>
                <input
                  className="adm-input"
                  value={f.name}
                  onChange={e => {
                    set('name')(e);
                    if (!slugTouched) setF(prev => ({ ...prev, slug: slugify(e.target.value) }));
                  }}
                  placeholder="e.g. Sri Venkateswara Sanctum Gold Frame"
                  required
                />
              </label>
            </div>
            <label className="block">
              <span className="adm-label">URL Slug</span>
              <input
                className="adm-input font-mono text-xs"
                value={f.slug}
                onChange={e => {
                  setSlugTouched(true);
                  set('slug')(e);
                }}
                required
              />
            </label>
            <label className="block">
              <span className="adm-label">Description</span>
              <textarea className="adm-textarea" rows={3} value={f.description} onChange={set('description')} required />
            </label>
            <label className="block">
              <span className="adm-label">Category</span>
              <select className="adm-input" value={f.categoryId} onChange={set('categoryId')}>
                <option value="">(Select a devotional category)</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </Section>

          {/* Devotional Deity & Frame Specifications */}
          <Section title="Devotional Attributes & Frame Specs">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="adm-label">Deity / Holy Figure</span>
                <input
                  className="adm-input"
                  value={f.deity}
                  onChange={set('deity')}
                  placeholder="e.g. Balaji, Ganesha, Lakshmi, Radha Krishna"
                />
              </label>
              <label>
                <span className="adm-label">Frame Size Format</span>
                <input
                  className="adm-input"
                  value={f.frameSize}
                  onChange={set('frameSize')}
                  placeholder="e.g. Classic 4&quot;×6&quot;, Mini 3&quot;×3&quot;, Royal 5&quot;×7&quot;"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label>
                <span className="adm-label">Orientation</span>
                <select className="adm-input" value={f.orientation} onChange={set('orientation')}>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="square">Square</option>
                </select>
              </label>
              <label>
                <span className="adm-label">Border Finish</span>
                <input
                  className="adm-input"
                  value={f.borderFinish}
                  onChange={set('borderFinish')}
                  placeholder="e.g. Antique Gold Foil, Temple Teak"
                />
              </label>
              <label>
                <span className="adm-label">Dimensions</span>
                <input
                  className="adm-input"
                  value={f.dimensions}
                  onChange={set('dimensions')}
                  placeholder="e.g. 4&quot; x 6&quot;"
                />
              </label>
            </div>

            <label className="block">
              <span className="adm-label">Material / Crafting Details</span>
              <input
                className="adm-input"
                value={f.material}
                onChange={set('material')}
                placeholder="e.g. Gold Foil Relief Plaque in Teak-finish Border"
              />
            </label>

            <label className="block">
              <span className="adm-label">Personalisation or Event Backing Information</span>
              <input
                className="adm-input"
                value={f.customisationInfo}
                onChange={set('customisationInfo')}
                placeholder="e.g. Custom event sticker on backing available on bulk requests"
              />
            </label>
          </Section>

          {/* Strict <= 99 Pricing Section */}
          <Section title="Strict ₹99 Price Ceiling & Bulk Tiers">
            <div className="p-3 bg-[#FFFBF0] border border-[#C49A45]/40 rounded-lg text-xs text-[#6B5018] flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-[#C49A45] flex-shrink-0" />
              <span>
                <strong>Strict Business Rule:</strong> Every purchasable frame and volume tier must be priced at <strong>₹99 or less</strong>. Shipping is quoted separately.
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label>
                <span className="adm-label">Indicative price (₹) · Max ₹99</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  className="adm-input font-bold text-burgundy"
                  value={f.indicativePrice}
                  onChange={set('indicativePrice')}
                  placeholder="Max ₹99"
                  disabled={f.isQuoteOnly}
                />
              </label>
              <label>
                <span className="adm-label">Price unit</span>
                <select className="adm-input" value={f.priceType} onChange={set('priceType')}>
                  <option value="piece">Per frame (/ frame)</option>
                  <option value="set">Per set (/ set)</option>
                </select>
              </label>
              <label>
                <span className="adm-label">Availability label</span>
                <input className="adm-input" value={f.availabilityLabel} onChange={set('availabilityLabel')} />
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
              <span className="adm-label">Volume pricing tiers (one per line: MinQty: UnitPrice, e.g. 50: 69)</span>
              <p className="adm-hint">All tier prices must be ≤ ₹99 per frame.</p>
              <textarea
                className="adm-textarea font-mono text-xs"
                rows={3}
                value={bulkTiersText}
                onChange={e => setBulkTiersText(e.target.value)}
                placeholder="25: 79&#10;50: 69&#10;100: 59"
              />
            </div>
          </Section>

          {/* Status & Publication */}
          <Section title="Publishing Status">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="adm-label">Publication Status</span>
                <select className="adm-input" value={f.status} onChange={set('status')}>
                  <option value="draft">Draft (hidden from public)</option>
                  <option value="published">Published (live on storefront)</option>
                  <option value="archived">Archived (soft-hidden, past orders preserved)</option>
                </select>
              </label>
              <label className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-burgundy"
                  checked={f.isDemo}
                  onChange={set('isDemo')}
                />
                <span className="text-sm font-medium">Sample preview item (hidden from live production store)</span>
              </label>
            </div>
          </Section>
        </form>
      )}
    </Drawer>
  );
};
