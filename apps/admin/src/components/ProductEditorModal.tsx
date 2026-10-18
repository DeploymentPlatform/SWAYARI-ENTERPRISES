import React, { useState, useEffect } from 'react';
import { X, Check, Image as ImageIcon, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Product, Category } from '@swayari/shared';

interface ProductEditorModalProps {
  productId?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({ productId, onClose, onSaved }) => {
  const isEditing = Boolean(productId);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  // Form Fields
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [indicativePrice, setIndicativePrice] = useState<string>('');
  const [minQuantity, setMinQuantity] = useState<number>(1);
  const [availabilityLabel, setAvailabilityLabel] = useState('Available on Request');
  const [customisationInfo, setCustomisationInfo] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [productId]);

  async function fetchInitialData() {
    try {
      const [catRes, assetRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/assets')
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
      if (assetRes.ok) {
        const assetData = await assetRes.json();
        setAvailableAssets(assetData.assets || []);
      }

      if (productId) {
        const prodRes = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const p: Product = prodData.product;
          setSku(p.sku);
          setName(p.name);
          setSlug(p.slug);
          setDescription(p.description);
          setCategoryId(p.categoryId || '');
          setImages(p.images || []);
          setMaterial(p.material || '');
          setDimensions(p.dimensions || '');
          setIndicativePrice(p.indicativePrice !== null && p.indicativePrice !== undefined ? String(p.indicativePrice) : '');
          setMinQuantity(p.minQuantity || 1);
          setAvailabilityLabel(p.availabilityLabel || 'Available on Request');
          setCustomisationInfo(p.customisationInfo || '');
          setStatus(p.status || 'published');
        }
      }
    } catch (err) {
      console.error('Failed to load product editor data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const payload = {
      sku,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      categoryId: categoryId || null,
      images,
      material: material || null,
      dimensions: dimensions || null,
      indicativePrice: indicativePrice ? Number(indicativePrice) : null,
      minQuantity: Number(minQuantity) || 1,
      availabilityLabel,
      customisationInfo: customisationInfo || null,
      status
    };

    try {
      const url = isEditing
        ? `/api/admin/products/${encodeURIComponent(productId!)}`
        : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  function toggleAssetSelection(path: string) {
    if (images.includes(path)) {
      setImages(images.filter(p => p !== path));
    } else {
      setImages([...images, path]);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center text-xs text-charcoal-muted">
          Loading product editor...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-ivory-border shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-ivory-border flex items-center justify-between bg-ivory/40">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal">
              {isEditing ? `Edit Product: ${sku}` : 'Publish New Catalogue Piece'}
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Configured information appears on the customer storefront.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-charcoal-muted hover:text-burgundy rounded-full hover:bg-ivory">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-charcoal block mb-1">SKU / ID *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value.toUpperCase())}
                placeholder="E.g. SWY-BR-001"
                className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-charcoal block mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="E.g. Mayur Brass Diya Uruli"
                className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-charcoal block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light"
              >
                <option value="">No Category Assigned</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light font-medium"
              >
                <option value="published">Published (Visible on Store)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-charcoal block mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Handcrafted iconographic description, alloy details, and traditional significance..."
              className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light"
            />
          </div>

          {/* Material & Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-charcoal block mb-1">Confirmed Material</label>
              <input
                type="text"
                value={material}
                onChange={e => setMaterial(e.target.value)}
                placeholder="E.g. Solid Bell Metal Alloy / Cast Brass"
                className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Confirmed Dimensions &amp; Weight</label>
              <input
                type="text"
                value={dimensions}
                onChange={e => setDimensions(e.target.value)}
                placeholder="E.g. Height: 12 in, Base: 8 in, Weight: 3.5 kg"
                className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light"
              />
            </div>
          </div>

          {/* Pricing & Order Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-charcoal block mb-1">
                Indicative Price (₹)
                <span className="font-normal text-charcoal-muted block text-[10px]">Leave blank for Price on Request</span>
              </label>
              <input
                type="number"
                value={indicativePrice}
                onChange={e => setIndicativePrice(e.target.value)}
                placeholder="Price on Request"
                className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Minimum Order Qty</label>
              <input
                type="number"
                min={1}
                value={minQuantity}
                onChange={e => setMinQuantity(Number(e.target.value) || 1)}
                className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Availability Label</label>
              <input
                type="text"
                value={availabilityLabel}
                onChange={e => setAvailabilityLabel(e.target.value)}
                placeholder="Available on Request"
                className="w-full p-2.5 rounded-lg border border-ivory-border bg-ivory-light"
              />
            </div>
          </div>

          {/* Visual Asset Selector Section */}
          <div className="space-y-3 pt-3 border-t border-ivory-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-charcoal block">Product Photographs (From Deployed Assets)</label>
                <p className="text-[11px] text-charcoal-muted font-light">
                  Select high-resolution photos tracked in Git. Selected: {images.length} images.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssetPicker(!showAssetPicker)}
                className="px-3 py-1.5 rounded-lg border border-ivory-border bg-white text-charcoal hover:bg-ivory flex items-center space-x-1"
              >
                <ImageIcon className="w-3.5 h-3.5 text-burgundy" />
                <span>{showAssetPicker ? 'Hide Gallery' : 'Select from Assets'}</span>
              </button>
            </div>

            {/* Selected images preview row */}
            {images.length > 0 && (
              <div className="flex items-center space-x-2 overflow-x-auto p-2 bg-ivory-light rounded-xl border border-ivory-border">
                {images.map((img, i) => (
                  <div key={i} className="relative group w-16 h-20 rounded-lg overflow-hidden border border-burgundy flex-shrink-0">
                    <img src={img} alt="Selected" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-red-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Asset Picker Grid */}
            {showAssetPicker && (
              <div className="p-4 bg-ivory/60 rounded-2xl border border-ivory-border space-y-3">
                <p className="text-[11px] text-charcoal-muted">Click images to toggle them on this product:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
                  {availableAssets.map((asset, aIdx) => {
                    const isSelected = images.includes(asset.path);
                    return (
                      <div
                        key={aIdx}
                        onClick={() => toggleAssetSelection(asset.path)}
                        className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all p-1 bg-white ${
                          isSelected ? 'border-burgundy ring-2 ring-burgundy/20' : 'border-ivory-border hover:border-gold'
                        }`}
                      >
                        <div className="aspect-[4/5] bg-ivory-muted rounded-lg overflow-hidden">
                          <img src={asset.path} alt={asset.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] text-charcoal truncate mt-1 px-1">{asset.name}</p>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-burgundy text-white flex items-center justify-center shadow">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-ivory-border flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-ivory-border text-charcoal hover:bg-ivory"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-burgundy hover:bg-burgundy-hover text-white font-medium shadow-sm flex items-center space-x-1.5"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditing ? 'Save Product Changes' : 'Publish Product'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
