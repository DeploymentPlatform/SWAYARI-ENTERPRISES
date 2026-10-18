import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Check, X, ArrowUpRight, Monitor, Smartphone } from 'lucide-react';
import { CampaignBanner } from '@swayari/shared';
import { ErrorBanner, PageHeader, Drawer } from '../components/ui';

const PRESET_BANNERS = [
  {
    name: 'Slide 1 — Moments (Festive Lamps & Gifts)',
    desktop: '/assets/editorial/hero-slide-1-moments-desktop.webp',
    mobile: '/assets/editorial/hero-slide-1-moments-mobile.webp'
  },
  {
    name: 'Slide 2 — Devotional (Sanctum Frames)',
    desktop: '/assets/editorial/hero-slide-2-devotional-desktop.webp',
    mobile: '/assets/editorial/hero-slide-2-devotional-mobile.webp'
  },
  {
    name: 'Slide 3 — Lighting (Artisanal Brass Lamps)',
    desktop: '/assets/editorial/hero-slide-3-decor-desktop.webp',
    mobile: '/assets/editorial/hero-slide-3-decor-mobile.webp'
  },
  {
    name: 'Slide 4 — Urulis & Gifting (Celebration Urulis)',
    desktop: '/assets/editorial/hero-slide-4-gifting-desktop.webp',
    mobile: '/assets/editorial/hero-slide-4-gifting-mobile.webp'
  }
];

export const BannersPage: React.FC = () => {
  const [banners, setBanners] = useState<CampaignBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editingBanner, setEditingBanner] = useState<CampaignBanner | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    badge: '',
    headline: '',
    emphasis: '',
    supporting: '',
    ctaText: 'Explore Collection',
    ctaHref: '/shop',
    desktopImage: PRESET_BANNERS[0].desktop,
    mobileImage: PRESET_BANNERS[0].mobile,
    alt: '',
    displayOrder: 1,
    isActive: true
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  async function loadBanners() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      if (!res.ok) throw new Error('Failed to load campaign banners');
      const data = await res.json();
      setBanners(data.banners || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error loading banners');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBanners();
  }, []);

  function handleOpenCreate() {
    setFormData({
      badge: 'Artisanal Collection',
      headline: 'New Seasonal',
      emphasis: 'Showcase.',
      supporting: 'Curated handcrafted brass and devotional gifting collections.',
      ctaText: 'Explore Collection',
      ctaHref: '/shop',
      desktopImage: PRESET_BANNERS[0].desktop,
      mobileImage: PRESET_BANNERS[0].mobile,
      alt: 'SWAYARI celebratory collection showcase',
      displayOrder: (banners.length + 1),
      isActive: true
    });
    setEditingBanner(null);
    setIsCreating(true);
    setFormError(null);
  }

  function handleOpenEdit(b: CampaignBanner) {
    setFormData({
      badge: b.badge || '',
      headline: b.headline,
      emphasis: b.emphasis || '',
      supporting: b.supporting || '',
      ctaText: b.ctaText,
      ctaHref: b.ctaHref,
      desktopImage: b.desktopImage,
      mobileImage: b.mobileImage,
      alt: b.alt || '',
      displayOrder: b.displayOrder,
      isActive: b.isActive
    });
    setEditingBanner(b);
    setIsCreating(true);
    setFormError(null);
  }

  async function handleToggleActive(b: CampaignBanner) {
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !b.isActive })
      });
      if (res.ok) {
        loadBanners();
      }
    } catch {
      // silently ignore or reload
    }
  }

  async function handleDelete(b: CampaignBanner) {
    if (!window.confirm(`Are you sure you want to delete banner "${b.headline}"?`)) return;
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, { method: 'DELETE' });
      if (res.ok) {
        loadBanners();
      }
    } catch {
      // silently ignore or reload
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to save banner');
      }

      setIsCreating(false);
      setEditingBanner(null);
      loadBanners();
    } catch (err: any) {
      setFormError(err.message || 'Error saving banner');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaign Banners"
        description="Dynamic multi-slide promotional hero carousel on the customer storefront. Reorder, update copy, toggle active state, or add seasonal campaigns."
        actions={
          <button type="button" onClick={handleOpenCreate} className="adm-btn-primary">
            <Plus className="h-4 w-4" aria-hidden /> New Campaign Slide
          </button>
        }
      />

      {error && <ErrorBanner message={error} />}

      {/* Banner List */}
      <div className="adm-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-ink-soft">Loading campaign banners…</div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-soft">No banners created yet. Click "New Campaign Slide" to create one.</div>
        ) : (
          <div className="divide-y divide-stone-deep">
            {banners.map((b) => (
              <div key={b.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone/30 transition-colors">
                
                {/* Left: Thumbnail & Copy */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="relative w-28 h-16 sm:w-36 sm:h-20 flex-shrink-0 bg-stone rounded border border-stone-deep overflow-hidden">
                    <img
                      src={b.desktopImage}
                      alt={b.alt || b.headline}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white tracking-wider">
                      #{b.displayOrder}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {b.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#8F7138] border border-[#E7DFD5] text-[10.5px] font-semibold uppercase tracking-wider">
                          {b.badge}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.isActive ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#FEF3F2] text-[#B42318]'
                      }`}>
                        {b.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <h4 className="mt-1 text-[15px] font-semibold text-ink truncate">
                      {b.headline} <span className="text-burgundy italic">{b.emphasis}</span>
                    </h4>

                    {b.supporting && (
                      <p className="text-[12.5px] text-ink-soft line-clamp-1 mt-0.5">
                        {b.supporting}
                      </p>
                    )}

                    <div className="mt-1.5 flex items-center gap-3 text-[11.5px] text-ink-faint">
                      <span>CTA: <strong className="text-ink-soft">{b.ctaText}</strong></span>
                      <span>Link: <code className="text-burgundy">{b.ctaHref}</code></span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(b)}
                    className={`adm-btn-secondary text-[12px] h-8 px-2.5 ${b.isActive ? 'text-ink-soft' : 'text-[#027A48]'}`}
                    title={b.isActive ? 'Disable banner' : 'Enable banner'}
                  >
                    {b.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(b)}
                    className="adm-btn-secondary text-[12px] h-8 px-2.5 flex items-center gap-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b)}
                    className="adm-btn-danger text-[12px] h-8 px-2.5 flex items-center gap-1.5"
                    title="Delete slide"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Drawer */}
      {isCreating && (
        <Drawer
          title={editingBanner ? 'Edit Campaign Slide' : 'New Campaign Slide'}
          onClose={() => { setIsCreating(false); setEditingBanner(null); }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && <ErrorBanner message={formError} />}

            {/* Device Preview Toggle */}
            <div className="p-3.5 bg-stone/40 rounded-lg border border-stone-deep space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Interactive Live Preview
                </span>
                <div className="flex items-center gap-1 bg-white rounded border border-stone-deep p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                      previewDevice === 'desktop' ? 'bg-burgundy text-white font-medium' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                      previewDevice === 'mobile' ? 'bg-burgundy text-white font-medium' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Rendered Slide Mockup */}
              <div className={`relative overflow-hidden rounded bg-[#1B1310] text-white shadow-md mx-auto transition-all ${
                previewDevice === 'desktop' ? 'w-full h-44 sm:h-52' : 'w-64 h-56'
              }`}>
                <img
                  src={previewDevice === 'desktop' ? formData.desktopImage : formData.mobileImage}
                  alt={formData.alt || 'Preview'}
                  className="absolute inset-0 w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end sm:justify-center">
                  {formData.badge && (
                    <span className="text-[9.5px] font-bold text-[#D8C29D] uppercase tracking-wider mb-1 truncate">
                      {formData.badge}
                    </span>
                  )}
                  <h3 className="font-serif text-base sm:text-lg font-bold leading-tight drop-shadow-sm">
                    {formData.headline} <span className="italic text-[#D8C29D]">{formData.emphasis}</span>
                  </h3>
                  {formData.supporting && (
                    <p className="text-[11px] text-white/80 line-clamp-2 mt-1 max-w-[280px]">
                      {formData.supporting}
                    </p>
                  )}
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#B49155] text-white text-[10.5px] font-semibold uppercase tracking-wider shadow-sm">
                      {formData.ctaText}
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Presets selection */}
            <div>
              <span className="adm-label mb-1.5 block">Select Imagery Preset or Custom URL</span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_BANNERS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, desktopImage: p.desktop, mobileImage: p.mobile }))}
                    className={`p-2 rounded border text-left text-xs transition-all flex items-center gap-2 ${
                      formData.desktopImage === p.desktop
                        ? 'border-burgundy bg-burgundy-soft text-burgundy-deep font-medium'
                        : 'border-stone-deep bg-white text-ink-soft hover:border-ink'
                    }`}
                  >
                    <img src={p.desktop} alt="" className="w-10 h-6 object-cover rounded flex-shrink-0" />
                    <span className="truncate">{p.name.split('—')[1] || p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Fields */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="adm-label">Badge / Eyebrow</span>
                <input
                  className="adm-input"
                  value={formData.badge}
                  placeholder="e.g. Artisanal Festive Collection"
                  onChange={e => setFormData({ ...formData, badge: e.target.value })}
                />
              </label>
              <label>
                <span className="adm-label">Order & Visibility</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="number"
                    className="adm-input w-24"
                    value={formData.displayOrder}
                    onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) || 1 })}
                  />
                  <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-stone-deep text-burgundy focus:ring-burgundy"
                    />
                    <span>Active Slide</span>
                  </label>
                </div>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="adm-label">Headline (Main)</span>
                <input
                  required
                  className="adm-input"
                  value={formData.headline}
                  placeholder="e.g. Gifts for Meaningful"
                  onChange={e => setFormData({ ...formData, headline: e.target.value })}
                />
              </label>
              <label>
                <span className="adm-label">Emphasis / Highlight</span>
                <input
                  className="adm-input"
                  value={formData.emphasis}
                  placeholder="e.g. Moments."
                  onChange={e => setFormData({ ...formData, emphasis: e.target.value })}
                />
              </label>
            </div>

            <label className="block">
              <span className="adm-label">Supporting Description</span>
              <textarea
                rows={2}
                className="adm-input"
                value={formData.supporting}
                placeholder="Brief evocative sentence about this collection..."
                onChange={e => setFormData({ ...formData, supporting: e.target.value })}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="adm-label">CTA Button Label</span>
                <input
                  required
                  className="adm-input"
                  value={formData.ctaText}
                  placeholder="e.g. Explore Gifting Sets"
                  onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                />
              </label>
              <label>
                <span className="adm-label">CTA Destination URL</span>
                <input
                  required
                  className="adm-input"
                  value={formData.ctaHref}
                  placeholder="e.g. /shop?category=gift-sets"
                  onChange={e => setFormData({ ...formData, ctaHref: e.target.value })}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="adm-label">Desktop Image URL</span>
                <input
                  required
                  className="adm-input font-mono text-xs"
                  value={formData.desktopImage}
                  onChange={e => setFormData({ ...formData, desktopImage: e.target.value })}
                />
              </label>
              <label>
                <span className="adm-label">Mobile Image URL</span>
                <input
                  required
                  className="adm-input font-mono text-xs"
                  value={formData.mobileImage}
                  onChange={e => setFormData({ ...formData, mobileImage: e.target.value })}
                />
              </label>
            </div>

            <label className="block">
              <span className="adm-label">Accessibility Alt Text</span>
              <input
                className="adm-input"
                value={formData.alt}
                placeholder="Descriptive text for visually impaired visitors"
                onChange={e => setFormData({ ...formData, alt: e.target.value })}
              />
            </label>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-deep">
              <button
                type="button"
                className="adm-btn-quiet"
                onClick={() => { setIsCreating(false); setEditingBanner(null); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="adm-btn-primary"
              >
                {saving ? 'Saving…' : editingBanner ? 'Update Slide' : 'Create Slide'}
              </button>
            </div>

          </form>
        </Drawer>
      )}

    </div>
  );
};
