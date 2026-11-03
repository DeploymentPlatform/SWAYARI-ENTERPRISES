import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit2, Trash2, ArrowUpRight, Monitor, Smartphone, GalleryHorizontal } from 'lucide-react';
import { CampaignBanner } from '@swayari/shared';
import { ErrorBanner, PageHeader, Drawer, EmptyState, SkeletonRows } from '../components/ui';
import { EASE_LUXURY, Stagger, StaggerItem } from '../components/motion';

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
        eyebrow="Storefront"
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
          <SkeletonRows rows={3} label="Loading campaign banners…" />
        ) : banners.length === 0 ? (
          <EmptyState icon={GalleryHorizontal} title="No banners created yet">
            Click "New Campaign Slide" to create one.
          </EmptyState>
        ) : (
          <Stagger as="ul" className="divide-y divide-stone-deep/60">
            {banners.map(b => (
              <StaggerItem as="li" key={b.id} className="group flex flex-col justify-between gap-4 p-4 transition-colors duration-300 hover:bg-ivory-light sm:p-5 md:flex-row md:items-center">
                {/* Left: Thumbnail & Copy */}
                <div className="flex min-w-0 items-start gap-4">
                  <div className="relative h-[72px] w-28 flex-shrink-0 overflow-hidden rounded-xl border border-stone-deep bg-stone shadow-subtle sm:h-24 sm:w-44">
                    <img src={b.desktopImage} alt={b.alt || b.headline} className="h-full w-full object-cover text-[0px] text-transparent transition-transform duration-700 ease-luxury group-hover:scale-105" />
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-umber/75 px-2 py-0.5 text-[0.625rem] font-semibold tracking-wider text-gold-light backdrop-blur">
                      #{b.displayOrder}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {b.badge && <span className="adm-badge-gold max-w-full truncate">{b.badge}</span>}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${
                          b.isActive ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-stone text-ink-faint ring-stone-shade/70'
                        }`}
                      >
                        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${b.isActive ? 'bg-emerald-600' : 'bg-ink-faint'}`} />
                        {b.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <h4 className="mt-1.5 truncate font-display text-[1.3rem] font-semibold leading-tight text-ink">
                      {b.headline} <span className="italic text-burgundy">{b.emphasis}</span>
                    </h4>

                    {b.supporting && <p className="mt-0.5 line-clamp-1 text-[0.8125rem] text-ink-soft">{b.supporting}</p>}

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-ink-faint">
                      <span>
                        CTA: <strong className="font-semibold text-ink-soft">{b.ctaText}</strong>
                      </span>
                      <span className="min-w-0 truncate">
                        Link: <code className="text-burgundy">{b.ctaHref}</code>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-shrink-0 items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(b)}
                    className={`adm-btn-secondary h-10 px-4 text-[0.8125rem] sm:h-9 ${b.isActive ? 'text-ink-soft' : 'text-emerald-800'}`}
                    title={b.isActive ? 'Disable banner' : 'Enable banner'}
                  >
                    {b.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button type="button" onClick={() => handleOpenEdit(b)} className="adm-btn-secondary h-10 px-4 text-[0.8125rem] sm:h-9">
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button type="button" onClick={() => handleDelete(b)} className="adm-btn-danger h-10 w-10 px-0 sm:h-9 sm:w-9" title="Delete slide" aria-label="Delete slide">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>

      {/* Editor Drawer */}
      <AnimatePresence>
      {isCreating && (
        <Drawer
          title={editingBanner ? 'Edit Campaign Slide' : 'New Campaign Slide'}
          onClose={() => { setIsCreating(false); setEditingBanner(null); }}
          footer={
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <button
                type="button"
                className="adm-btn-quiet"
                onClick={() => { setIsCreating(false); setEditingBanner(null); }}
              >
                Cancel
              </button>
              <button type="submit" form="banner-form" disabled={saving} className="adm-btn-primary">
                {saving ? 'Saving…' : editingBanner ? 'Update Slide' : 'Create Slide'}
              </button>
            </div>
          }
        >
          <form id="banner-form" onSubmit={handleSubmit} className="space-y-6">
            {formError && <ErrorBanner message={formError} />}

            {/* Device Preview Toggle */}
            <div className="adm-panel-muted space-y-3 p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="adm-section-title">
                  Interactive Live Preview
                </span>
                <div className="adm-segment">
                  <button
                    type="button"
                    aria-pressed={previewDevice === 'desktop'}
                    onClick={() => setPreviewDevice('desktop')}
                    className="adm-segment-btn"
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={previewDevice === 'mobile'}
                    onClick={() => setPreviewDevice('mobile')}
                    className="adm-segment-btn"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Rendered Slide Mockup */}
              <motion.div
                layout
                transition={{ duration: 0.5, ease: EASE_LUXURY }}
                className={`relative mx-auto overflow-hidden rounded-xl bg-umber text-white shadow-card ring-1 ring-gold/20 ${
                previewDevice === 'desktop' ? 'w-full h-44 sm:h-52' : 'w-full max-w-[16rem] h-56'
              }`}>
                <img
                  src={previewDevice === 'desktop' ? formData.desktopImage : formData.mobileImage}
                  alt={formData.alt || 'Preview'}
                  className="absolute inset-0 h-full w-full object-cover text-transparent opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-umber/85 via-umber/40 to-transparent p-4 flex flex-col justify-end sm:justify-center">
                  {formData.badge && (
                    <span className="mb-1 truncate text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold-light">
                      {formData.badge}
                    </span>
                  )}
                  <h3 className="font-display text-lg font-semibold leading-tight drop-shadow-sm sm:text-xl">
                    {formData.headline} <span className="italic text-gold-light">{formData.emphasis}</span>
                  </h3>
                  {formData.supporting && (
                    <p className="text-[11px] text-white/80 line-clamp-2 mt-1 max-w-[280px]">
                      {formData.supporting}
                    </p>
                  )}
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-gold-light to-gold px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-burgundy-deep shadow-sm">
                      {formData.ctaText}
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Presets selection */}
            <div>
              <span className="adm-label mb-1.5 block">Select Imagery Preset or Custom URL</span>
              <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                {PRESET_BANNERS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, desktopImage: p.desktop, mobileImage: p.mobile }))}
                    aria-pressed={formData.desktopImage === p.desktop}
                    className={`flex min-h-[48px] items-center gap-2.5 rounded-xl border p-2 text-left text-[0.8125rem] transition-all duration-300 ease-luxury ${
                      formData.desktopImage === p.desktop
                        ? 'border-gold bg-gold-pale/50 font-semibold text-burgundy-deep shadow-gold'
                        : 'border-stone-deep bg-white text-ink-soft hover:border-gold/60 hover:text-ink'
                    }`}
                  >
                    <img src={p.desktop} alt="" className="h-8 w-12 flex-shrink-0 rounded-md bg-stone object-cover" />
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
                <div className="flex items-center gap-3">
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
                      className="h-4 w-4 accent-burgundy"
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

          </form>
        </Drawer>
      )}
      </AnimatePresence>

    </div>
  );
};
