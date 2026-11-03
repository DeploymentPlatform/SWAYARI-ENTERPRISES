import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Upload, Image as ImageIcon, Star, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { Category, DEITIES, FRAME_SIZES, MAX_FRAME_PRICE, MIN_ORDER_FRAMES, ORIENTATIONS, Product } from '@swayari/shared';
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

const Section: React.FC<{ title: string; hint?: string; step?: number; children: React.ReactNode }> = ({ title, hint, step, children }) => (
  <section className="adm-card p-5 sm:p-6">
    <div className="flex items-start gap-3">
      {step !== undefined && (
        <span aria-hidden className="mt-[-2px] flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold-pale/60 text-[0.75rem] font-semibold tabular-nums text-gold-dark">
          {step}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="font-display text-[1.25rem] font-semibold leading-tight text-ink">{title}</h3>
        {hint && <p className="adm-hint">{hint}</p>}
      </div>
    </div>
    <div className="mt-5 space-y-4">{children}</div>
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

/** Structured product editor; every item on SWAYARI must be priced at ₹999 or less. */
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
    categoryId: 'cat-god-frames',
    material: 'Silver foil embossed artwork with colour highlights, cream mount and clear front cover',
    dimensions: '',
    indicativePrice: '149',
    priceType: 'piece' as 'piece' | 'set',
    setContents: '',
    minQuantity: '1',
    orderIncrement: '1',
    isQuoteOnly: false,
    shippingInfo: 'Shipping is extra, charged at the actual courier cost for your quantity and delivery PIN code.',
    supportsIndividual: true,
    supportsBulk: true,
    customisationInfo: '',
    availabilityLabel: 'Ready to order',
    status: 'draft' as Product['status'],
    isDemo: false,
    deity: '',
    frameSize: 'No. 1',
    orientation: 'portrait' as 'portrait' | 'landscape' | 'square',
    borderFinish: 'Maroon frame with gold floral border'
  });
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [bulkTiersText, setBulkTiersText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedAssetPath, setSelectedAssetPath] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`File is too large (${Math.round(file.size / 1024)} KB). Maximum allowed size is 5MB.`);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Only authentic JPG, PNG, and WebP devotional photographs are supported.');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const dataUrl = await base64Promise;

      const res = await fetch('/api/admin/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataUrl, filename: file.name })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload photo');
      }

      setImages(prev => [...prev, data.path]);
      e.target.value = '';
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function addExistingAsset() {
    if (!selectedAssetPath) return;
    if (!images.includes(selectedAssetPath)) {
      setImages(prev => [...prev, selectedAssetPath]);
    }
    setSelectedAssetPath('');
  }

  function setAsPrimary(index: number) {
    if (index <= 0 || index >= images.length) return;
    setImages(prev => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }

  function moveImage(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    setImages(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index));
  }
  
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

    // Require photo before publishing
    if (f.status === 'published' && images.length === 0) {
      setError('Published devotional frames must have at least one authentic product photograph attached. Please add a photo or save as draft.');
      return;
    }

    // ₹999 rule: no item may cost more than ₹999
    if (f.indicativePrice !== '' && Number(f.indicativePrice) > MAX_FRAME_PRICE) {
      setError(`Everything on SWAYARI is under ₹${MAX_FRAME_PRICE}. Enter a price of ₹${MAX_FRAME_PRICE} or less.`);
      return;
    }

    const tiers = parseBulkTiers(bulkTiersText);
    for (const t of tiers) {
      if (t.unit_price > MAX_FRAME_PRICE) {
        setError(`Bulk tier unit price ₹${t.unit_price} is above the ₹${MAX_FRAME_PRICE} limit.`);
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
      subtitle={editing ? f.sku : 'Everything is ₹999 or less (god frames are ₹149). Minimum order 25 frames in total; shipping extra.'}
      footer={
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button type="button" className="adm-btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="product-form" className="adm-btn-primary" disabled={saving || state !== 'ready'}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create frame'}
          </button>
        </div>
      }
    >
      {state === 'loading' && (
        <div className="space-y-4" role="status">
          <span className="sr-only">Loading product…</span>
          {[40, 56, 44].map(h => (
            <span key={h} className="adm-skeleton block rounded-card" style={{ height: `${h * 4}px` }} aria-hidden />
          ))}
        </div>
      )}
      {state === 'error' && <ErrorBanner message="Could not load this product." />}
      {state === 'ready' && (
        <form id="product-form" onSubmit={save} className="space-y-5" noValidate>
          {error && <ErrorBanner message={error} />}

          <Section step={1} title="Basics">
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

          {/* Photo Management Section */}
          <Section
            step={2}
            title="Product Photographs & Gallery"
            hint="Manage genuine devotional frame photographs. The first image is the primary photo shown on listings, cards and bulk request summaries."
          >
            {uploadError && <ErrorBanner message={uploadError} />}

            {/* Gallery list */}
            {images.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-stone-shade/80 bg-ivory-light px-5 py-7 text-center">
                <span className="adm-empty-icon h-12 w-12 after:hidden">
                  <ImageIcon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink">No photographs attached yet</p>
                <p className="mx-auto mt-1 max-w-md text-[0.8125rem] leading-relaxed text-ink-soft">
                  Published frames must include at least one genuine photograph. Upload a frame photo or select from existing catalogue assets below.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {images.map((img, idx) => {
                    const isPrimary = idx === 0;
                    return (
                      <div
                        key={`${img}-${idx}`}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 ease-luxury ${
                          isPrimary
                            ? 'border-gold bg-gold-pale/40 shadow-gold'
                            : 'border-stone-deep bg-white hover:border-gold/60'
                        }`}
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-stone-deep bg-stone">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          {isPrimary && (
                            <span className="absolute left-1 top-1 rounded-full bg-burgundy p-0.5 text-white" title="Primary Photo">
                              <Star className="h-3 w-3 fill-current text-gold-light" />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {isPrimary ? (
                              <span className="adm-badge-gold">Primary Photo</span>
                            ) : (
                              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">Photo #{idx + 1}</span>
                            )}
                          </div>
                          <p className="mt-1 truncate font-mono text-[0.75rem] text-ink" title={img}>
                            {img.split('/').pop()}
                          </p>

                          <div className="flex items-center gap-1.5 mt-2">
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => setAsPrimary(idx)}
                                className="-ml-1 flex min-h-[36px] items-center gap-1 rounded-full px-1.5 text-[0.75rem] font-semibold text-burgundy underline-offset-4 hover:underline"
                                title="Set as primary photo"
                              >
                                <Star className="h-3 w-3 text-gold" /> Set Primary
                              </button>
                            )}
                            <div className="ml-auto flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveImage(idx, -1)}
                                disabled={idx === 0}
                                className="adm-icon-btn h-9 w-9 sm:h-8 sm:w-8"
                                title="Move up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImage(idx, 1)}
                                disabled={idx === images.length - 1}
                                className="adm-icon-btn h-9 w-9 sm:h-8 sm:w-8"
                                title="Move down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="adm-icon-btn h-9 w-9 text-red-700 hover:bg-red-50 hover:text-red-800 sm:h-8 sm:w-8"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add/Upload Controls */}
            <div className="grid gap-4 border-t border-stone-deep/70 pt-4 sm:grid-cols-2">
              <div>
                <span className="adm-label mb-1.5 block">Upload New Frame Photo</span>
                <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gold/60 bg-gold-pale/30 px-4 py-2.5 text-[0.8125rem] font-semibold text-ink transition-all duration-300 ease-luxury focus-within:ring-4 focus-within:ring-gold/20 hover:border-gold hover:bg-gold-pale/60">
                  <Upload className="h-4 w-4 text-burgundy" />
                  <span>{uploading ? 'Uploading photo…' : 'Choose JPG/PNG/WebP (Max 5MB)'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
              </div>

              <div>
                <span className="adm-label mb-1.5 block">Or Attach from Catalogue Assets</span>
                <div className="flex gap-2">
                  <select
                    className="adm-input flex-1 sm:text-[0.8125rem]"
                    value={selectedAssetPath}
                    onChange={e => setSelectedAssetPath(e.target.value)}
                  >
                    <option value="">(Select catalogue photo)</option>
                    {assets.map(a => (
                      <option key={a.path} value={a.path}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addExistingAsset}
                    disabled={!selectedAssetPath}
                    className="adm-btn-primary px-5"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </Section>

          {/* Devotional Deity & Frame Specifications */}
          <Section step={3} title="Devotional Attributes & Frame Specs">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="adm-label">Deity / Holy Figure</span>
                <input
                  className="adm-input"
                  value={f.deity}
                  onChange={set('deity')}
                  placeholder="e.g. Balaji, Sai Baba, Radha Krishna, Hanuman"
                />
              </label>
              <label>
                <span className="adm-label">Frame Size Format</span>
                <input
                  className="adm-input"
                  value={f.frameSize}
                  onChange={set('frameSize')}
                  placeholder="e.g. No. 1"
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
                  placeholder="e.g. Maroon frame with gold floral border"
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

          {/* Pricing section: ₹999 limit */}
          <Section step={4} title="Price & Quantity">
            <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold-pale/50 px-4 py-3 text-[0.8125rem] leading-relaxed text-gold-dark">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
              <span>
                <strong>Business rule:</strong> every item must be priced at <strong>₹{MAX_FRAME_PRICE} or less</strong> (god frames are ₹149). Customers must order at least <strong>{MIN_ORDER_FRAMES} frames in total</strong>, mixing any designs; shipping is charged extra.
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label>
                <span className="adm-label">Indicative price (₹) · Max ₹{MAX_FRAME_PRICE}</span>
                <input
                  type="number"
                  min={0}
                  max={MAX_FRAME_PRICE}
                  className="adm-input font-semibold tabular-nums text-burgundy"
                  value={f.indicativePrice}
                  onChange={set('indicativePrice')}
                  placeholder={`Max ₹${MAX_FRAME_PRICE}`}
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
                <span className="adm-label">Minimum of this design (usually 1)</span>
                <input type="number" min={1} className="adm-input" value={f.minQuantity} onChange={set('minQuantity')} />
              </label>
              <label>
                <span className="adm-label">Order increment</span>
                <input type="number" min={1} className="adm-input" value={f.orderIncrement} onChange={set('orderIncrement')} />
              </label>
            </div>

            <div>
              <span className="adm-label">Volume discounts (optional — leave empty for one flat price)</span>
              <p className="adm-hint">One per line as MinQty: UnitPrice, e.g. 100: 95. Every price must be ₹999 or less.</p>
              <textarea
                className="adm-textarea font-mono text-xs"
                rows={3}
                value={bulkTiersText}
                onChange={e => setBulkTiersText(e.target.value)}
                placeholder="Leave empty for one flat price"
              />
            </div>
          </Section>

          {/* Status & Publication */}
          <Section step={5} title="Publishing Status">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="adm-label">Publication Status</span>
                <select className="adm-input" value={f.status} onChange={set('status')}>
                  <option value="draft">Draft (hidden from public)</option>
                  <option value="published">Published (live on storefront)</option>
                  <option value="archived">Archived (soft-hidden, past orders preserved)</option>
                </select>
              </label>
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-stone-deep bg-ivory-light px-4 py-2.5 transition-colors hover:border-gold/60 sm:mt-[1.6rem]">
                <input
                  type="checkbox"
                  className="h-4 w-4 flex-shrink-0 accent-burgundy"
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
