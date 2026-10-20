import React, { useEffect, useState } from 'react';
import { Filter, Search, Tag, X, Sparkles, Check } from 'lucide-react';
import { DEITIES, FRAME_SIZES, ORIENTATIONS, FRAME_PRICE_BANDS } from '@swayari/shared';
import { ProductCollection } from '../components/ProductCollection';
import { CollectionSkeleton, EmptyState, LoadError } from '../components/States';
import { useRouter } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { useCategories, useProducts } from '../lib/products';

export const ShopPage: React.FC<{ searchQuery?: string }> = ({ searchQuery }) => {
  const { navigate, search } = useRouter();
  const isSearch = searchQuery !== undefined;
  
  const category = isSearch ? '' : search.get('category') || '';
  const budget = isSearch ? '' : search.get('budget') || '';
  const deity = isSearch ? '' : search.get('deity') || '';
  const frameSize = isSearch ? '' : search.get('frame_size') || search.get('size') || '';
  const orientation = isSearch ? '' : search.get('orientation') || '';
  const isBulk = isSearch ? false : search.get('bulk') === '1';

  const [draft, setDraft] = useState(searchQuery || '');
  useEffect(() => setDraft(searchQuery || ''), [searchQuery]);

  const { products, status, retry } = useProducts({
    category: category || undefined,
    search: isSearch ? searchQuery : undefined,
    budget: budget || undefined,
    deity: deity || undefined,
    frame_size: frameSize || undefined,
    orientation: orientation || undefined,
    bulk: isBulk || undefined
  });

  const categories = useCategories().filter(c => (c.productCount ?? 0) > 0);

  // Derive dynamic page title
  let title = 'Devotional God Frames';
  if (isSearch) {
    title = searchQuery ? `Results for “${searchQuery}”` : 'Search Frames';
  } else if (isBulk) {
    title = 'Wedding Return Gifts & Bulk Frames';
  } else if (deity) {
    const dObj = DEITIES.find(d => d.id === deity);
    title = dObj ? `${dObj.name} Frames` : `${deity} Frames`;
  } else if (frameSize) {
    const sObj = FRAME_SIZES.find(s => s.id === frameSize);
    title = sObj ? `${sObj.name} Frames` : `${frameSize} Frames`;
  } else if (budget) {
    const band = FRAME_PRICE_BANDS.find(b => b.id === budget);
    title = band ? `Frames ${band.label}` : 'Devotional Frames ≤ ₹99';
  }

  usePageMeta(
    title,
    'Devotional god frames priced at ₹99 or less per frame. Auspicious return gifts for weddings, griha pravesh and family celebrations. Shipping quoted separately.',
    { noindex: isSearch }
  );

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = draft.trim();
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop');
  }

  function updateQuery(updates: { 
    category?: string; 
    budget?: string; 
    deity?: string; 
    frame_size?: string; 
    orientation?: string; 
    bulk?: boolean;
  }) {
    const p = new URLSearchParams();
    const newCat = updates.category !== undefined ? updates.category : category;
    const newBud = updates.budget !== undefined ? updates.budget : budget;
    const newDeity = updates.deity !== undefined ? updates.deity : deity;
    const newSize = updates.frame_size !== undefined ? updates.frame_size : frameSize;
    const newOri = updates.orientation !== undefined ? updates.orientation : orientation;
    const newBulk = updates.bulk !== undefined ? updates.bulk : isBulk;

    if (newCat) p.set('category', newCat);
    if (newBud) p.set('budget', newBud);
    if (newDeity) p.set('deity', newDeity);
    if (newSize) p.set('frame_size', newSize);
    if (newOri) p.set('orientation', newOri);
    if (newBulk) p.set('bulk', '1');

    const qs = p.toString();
    navigate(`/shop${qs ? `?${qs}` : ''}`);
  }

  const activeFiltersCount = 
    (category ? 1 : 0) + 
    (budget ? 1 : 0) + 
    (deity ? 1 : 0) + 
    (frameSize ? 1 : 0) + 
    (orientation ? 1 : 0) + 
    (isBulk ? 1 : 0);

  return (
    <div className="container-content pb-20 md:pb-28">
      {/* Header */}
      <header className="flex flex-col gap-6 border-b border-[#E6DDD5] pb-8 pt-8 md:flex-row md:items-end md:justify-between md:pb-10 md:pt-12">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C49A45]/15 border border-[#C49A45]/30 text-[#8F7138] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-[#C49A45]" />
            <span>₹99 &amp; Under Collection</span>
          </div>
          <h1 className="font-display text-[1.75rem] md:text-[2.25rem] font-bold text-[#2B2625] leading-tight">
            {title}
          </h1>
          {status === 'ready' && (
            <p className="mt-2 text-[13px] text-[#6B6362]" aria-live="polite">
              {products.length} {products.length === 1 ? 'frame design' : 'frame designs'} · All priced at ₹99 or less · Shipping quoted separately
            </p>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={submitSearch} role="search" className="relative w-full md:w-80">
          <label htmlFor="shop-search" className="sr-only">
            Search god frames
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6362]" aria-hidden />
          <input
            id="shop-search"
            type="search"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Search god frames and return gifts"
            className="w-full h-11 pl-10 pr-10 rounded-full border border-[#E6DDD5] bg-[#FAF7F2] text-[13px] text-[#2B2625] placeholder-[#6B6362] focus:outline-none focus:border-[#5C1D24] focus:bg-white"
            enterKeyHint="search"
          />
          {draft && (
            <button
              type="button"
              onClick={() => {
                setDraft('');
                if (isSearch) navigate('/shop');
              }}
              className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[#6B6362]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </form>
      </header>

      {/* Filter Strips: Deity, Frame Size, Orientation, Price */}
      {!isSearch && (
        <div className="space-y-3.5 pt-6 pb-2">
          
          {/* 1. Deity Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C1D24] mr-1">
              Deity:
            </span>
            <button
              type="button"
              onClick={() => updateQuery({ deity: '' })}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                !deity ? 'bg-[#5C1D24] text-white shadow-xs' : 'border border-[#E6DDD5] bg-white text-[#2B2625] hover:border-[#5C1D24]'
              }`}
            >
              All Deities
            </button>
            {DEITIES.filter(d => d.id !== 'all').map(d => {
              const active = deity.toLowerCase() === d.id.toLowerCase();
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => updateQuery({ deity: active ? '' : d.id })}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                    active ? 'bg-[#5C1D24] text-white shadow-xs' : 'border border-[#E6DDD5] bg-white text-[#2B2625] hover:border-[#5C1D24]'
                  }`}
                >
                  {d.name}
                </button>
              );
            })}
          </div>

          {/* 2. Price Band Filters (Strictly <= 99) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8F7138] mr-1">
              <Tag className="h-3 w-3" aria-hidden /> Price:
            </span>
            <button
              type="button"
              onClick={() => updateQuery({ budget: '' })}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                !budget ? 'bg-[#C49A45] text-[#2B2625] font-bold shadow-xs' : 'border border-[#E6DDD5] bg-white text-[#2B2625] hover:border-[#C49A45]'
              }`}
            >
              All (≤ ₹99)
            </button>
            {FRAME_PRICE_BANDS.filter(b => b.id !== 'all-99').map(band => {
              const active = budget === band.id;
              return (
                <button
                  key={band.id}
                  type="button"
                  onClick={() => updateQuery({ budget: active ? '' : band.id })}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                    active ? 'bg-[#C49A45] text-[#2B2625] font-bold shadow-xs' : 'border border-[#E6DDD5] bg-white text-[#2B2625] hover:border-[#C49A45]'
                  }`}
                >
                  {band.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => updateQuery({ bulk: !isBulk })}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                isBulk ? 'bg-[#5C1D24] text-white shadow-xs' : 'border border-[#E6DDD5] bg-white text-[#2B2625] hover:border-[#5C1D24]'
              }`}
            >
              Wedding Return Favors Only
            </button>
          </div>

          {/* 3. Frame Size & Orientation Strip */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[12px] text-[#6B6362]">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#2B2625]">Size:</span>
              <select
                value={frameSize}
                onChange={e => updateQuery({ frame_size: e.target.value })}
                className="px-2.5 py-1 rounded-lg border border-[#E6DDD5] bg-white text-[#2B2625] text-[12px] focus:outline-none focus:border-[#5C1D24]"
              >
                {FRAME_SIZES.map(s => (
                  <option key={s.id} value={s.id === 'all' ? '' : s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#2B2625]">Orientation:</span>
              <select
                value={orientation}
                onChange={e => updateQuery({ orientation: e.target.value })}
                className="px-2.5 py-1 rounded-lg border border-[#E6DDD5] bg-white text-[#2B2625] text-[12px] focus:outline-none focus:border-[#5C1D24]"
              >
                {ORIENTATIONS.map(o => (
                  <option key={o.id} value={o.id === 'all' ? '' : o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[12px] text-[#6B6362]">
              <span>Active filters:</span>
              {deity && (
                <span className="inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#E6DDD5] px-2 py-0.5 font-medium text-[#5C1D24]">
                  Deity: {DEITIES.find(d => d.id === deity)?.name || deity}
                  <button type="button" onClick={() => updateQuery({ deity: '' })} aria-label="Remove deity filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {budget && (
                <span className="inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#E6DDD5] px-2 py-0.5 font-medium text-[#5C1D24]">
                  {FRAME_PRICE_BANDS.find(b => b.id === budget)?.label || budget}
                  <button type="button" onClick={() => updateQuery({ budget: '' })} aria-label="Remove budget filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {frameSize && (
                <span className="inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#E6DDD5] px-2 py-0.5 font-medium text-[#5C1D24]">
                  Size: {frameSize}
                  <button type="button" onClick={() => updateQuery({ frame_size: '' })} aria-label="Remove size filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {orientation && (
                <span className="inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#E6DDD5] px-2 py-0.5 font-medium text-[#5C1D24]">
                  {orientation}
                  <button type="button" onClick={() => updateQuery({ orientation: '' })} aria-label="Remove orientation filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {isBulk && (
                <span className="inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#E6DDD5] px-2 py-0.5 font-medium text-[#5C1D24]">
                  Bulk Favors Only
                  <button type="button" onClick={() => updateQuery({ bulk: false })} aria-label="Remove bulk filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="ml-2 text-xs font-semibold text-[#5C1D24] underline hover:text-[#4A161D]"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Products Grid */}
      <main className="mt-8" aria-label="Product catalogue">
        {status === 'loading' && <CollectionSkeleton count={8} />}
        {status === 'error' && <LoadError onRetry={retry} />}
        {status === 'ready' && products.length === 0 && (
          <EmptyState
            title="No devotional frames matched your filters"
            body={<p className="text-[13px] text-[#6B6362]">Try clearing one or more filters, or explore our full collection of frames priced at ₹99 or less.</p>}
            action={{ to: '/shop', label: 'View All Frames' }}
          />
        )}
        {status === 'ready' && products.length > 0 && <ProductCollection products={products} />}
      </main>
    </div>
  );
};
