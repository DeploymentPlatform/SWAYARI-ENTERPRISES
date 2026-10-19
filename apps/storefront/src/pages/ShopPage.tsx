import React, { useEffect, useState } from 'react';
import { Filter, Search, Tag, X } from 'lucide-react';
import { BUDGET_BANDS, OCCASIONS } from '@swayari/shared';
import { ProductCollection } from '../components/ProductCollection';
import { CollectionSkeleton, EmptyState, LoadError } from '../components/States';
import { useRouter } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { useCategories, useProducts } from '../lib/products';

/** Catalogue (/shop) and search results (/search?q=) share one page with budget and occasion filters. */
export const ShopPage: React.FC<{ searchQuery?: string }> = ({ searchQuery }) => {
  const { navigate, search } = useRouter();
  const isSearch = searchQuery !== undefined;
  const category = isSearch ? '' : search.get('category') || '';
  const budget = isSearch ? '' : search.get('budget') || '';
  const occasion = isSearch ? '' : search.get('occasion') || '';
  const isBulk = isSearch ? false : search.get('bulk') === '1';

  const [draft, setDraft] = useState(searchQuery || '');
  useEffect(() => setDraft(searchQuery || ''), [searchQuery]);

  const { products, status, retry } = useProducts({
    category: category || undefined,
    search: isSearch ? searchQuery : undefined,
    budget: budget || undefined,
    occasion: occasion || undefined,
    bulk: isBulk || undefined
  });
  const categories = useCategories().filter(c => (c.productCount ?? 0) > 0);

  // Derive dynamic page title
  let title = 'The Collection';
  if (isSearch) {
    title = searchQuery ? `Results for “${searchQuery}”` : 'Search';
  } else if (isBulk) {
    title = 'Bulk & Return Gifting';
  } else if (budget) {
    const band = BUDGET_BANDS.find(b => b.id === budget);
    title = band ? `Gifts ${band.label}` : budget === 'under-999' ? 'Gifts ₹999 & Under' : 'Budget Collection';
  } else if (occasion) {
    const occ = OCCASIONS.find(o => o.id === occasion);
    title = occ ? occ.name : 'Occasion Gifts';
  } else if (category) {
    const cat = categories.find(c => c.slug === category);
    title = cat ? cat.name : 'The Collection';
  }

  usePageMeta(
    title,
    'Thoughtful gifts. Beautifully priced. Discover gifts for celebrations, return gifting and everyday moments from SWAYARI.',
    { noindex: isSearch }
  );

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = draft.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/shop');
  }

  function updateQuery(updates: { category?: string; budget?: string; occasion?: string; bulk?: boolean }) {
    const p = new URLSearchParams();
    const newCat = updates.category !== undefined ? updates.category : category;
    const newBud = updates.budget !== undefined ? updates.budget : budget;
    const newOcc = updates.occasion !== undefined ? updates.occasion : occasion;
    const newBulk = updates.bulk !== undefined ? updates.bulk : isBulk;

    if (newCat) p.set('category', newCat);
    if (newBud) p.set('budget', newBud);
    if (newOcc) p.set('occasion', newOcc);
    if (newBulk) p.set('bulk', '1');

    const qs = p.toString();
    navigate(`/shop${qs ? `?${qs}` : ''}`);
  }

  const activeFiltersCount = (category ? 1 : 0) + (budget ? 1 : 0) + (occasion ? 1 : 0) + (isBulk ? 1 : 0);

  return (
    <div className="container-content pb-20 md:pb-28">
      <header className="flex flex-col gap-6 border-b border-stone-deep pb-8 pt-10 md:flex-row md:items-end md:justify-between md:pb-10 md:pt-14">
        <div>
          <p className="eyebrow mb-2">{isSearch ? 'Search' : isBulk ? 'Bulk Concierge' : 'Thoughtful Gifts'}</p>
          <h1 className="text-display-sm md:text-display-lg">{title}</h1>
          {status === 'ready' && (
            <p className="mt-3 text-ink-soft" aria-live="polite">
              {products.length} {products.length === 1 ? 'piece' : 'pieces'}
              {!isSearch && ' · all pricing confirmed personally by our team'}
            </p>
          )}
        </div>
        <form onSubmit={submitSearch} role="search" className="relative w-full md:w-80">
          <label htmlFor="shop-search" className="sr-only">
            Search the collection
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
          <input
            id="shop-search"
            type="search"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Search by name or description"
            className="field-input pl-10 pr-10"
            enterKeyHint="search"
          />
          {draft && (
            <button
              type="button"
              onClick={() => {
                setDraft('');
                if (isSearch) navigate('/shop');
              }}
              className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center text-ink-soft"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </form>
      </header>

      {!isSearch && (
        <div className="space-y-4 pt-6">
          {/* Budget Band Quick Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-burgundy">
              <Tag className="h-3.5 w-3.5" aria-hidden /> Budget:
            </span>
            <button
              type="button"
              onClick={() => updateQuery({ budget: '' })}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                !budget ? 'bg-burgundy text-white' : 'border border-stone-shade bg-white text-ink hover:border-burgundy'
              }`}
            >
              All Prices
            </button>
            {BUDGET_BANDS.map(band => {
              const active = budget === band.id;
              return (
                <button
                  key={band.id}
                  type="button"
                  onClick={() => updateQuery({ budget: active ? '' : band.id })}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active ? 'bg-burgundy text-white' : 'border border-stone-shade bg-white text-ink hover:border-burgundy'
                  }`}
                >
                  {band.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => updateQuery({ bulk: !isBulk })}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isBulk ? 'bg-burgundy text-white' : 'border border-stone-shade bg-white text-ink hover:border-burgundy'
              }`}
            >
              Bulk & Return Favors
            </button>
          </div>

          {/* Categories and Occasions horizontal strip */}
          <div className="scrollbar-none -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              <Filter className="h-3.5 w-3.5" aria-hidden /> Category:
            </span>
            {[{ slug: '', name: 'All' }, ...categories].map(c => {
              const active = category === c.slug;
              return (
                <button
                  key={c.slug || 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => updateQuery({ category: c.slug })}
                  className={`whitespace-nowrap border px-3.5 py-1.5 text-xs transition-colors ${
                    active ? 'border-ink bg-ink text-ivory' : 'border-stone-shade bg-white text-ink hover:border-ink'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Active Filter summary if any are active */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-ink-soft">
              <span>Filtering by:</span>
              {budget && (
                <span className="inline-flex items-center gap-1 rounded bg-[#FBF0F1] px-2 py-0.5 font-medium text-burgundy">
                  {BUDGET_BANDS.find(b => b.id === budget)?.label || budget}
                  <button type="button" onClick={() => updateQuery({ budget: '' })} aria-label="Remove budget filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {isBulk && (
                <span className="inline-flex items-center gap-1 rounded bg-[#FBF0F1] px-2 py-0.5 font-medium text-burgundy">
                  Bulk Favors
                  <button type="button" onClick={() => updateQuery({ bulk: false })} aria-label="Remove bulk filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1 rounded bg-stone-light px-2 py-0.5 font-medium text-ink">
                  {categories.find(c => c.slug === category)?.name || category}
                  <button type="button" onClick={() => updateQuery({ category: '' })} aria-label="Remove category filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {occasion && (
                <span className="inline-flex items-center gap-1 rounded bg-stone-light px-2 py-0.5 font-medium text-ink">
                  {OCCASIONS.find(o => o.id === occasion)?.name || occasion}
                  <button type="button" onClick={() => updateQuery({ occasion: '' })} aria-label="Remove occasion filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="ml-2 font-medium text-burgundy underline hover:text-burgundy-dark"
              >
                Reset all
              </button>
            </div>
          )}
        </div>
      )}

      <div className="pt-8 md:pt-12">
        {status === 'loading' && <CollectionSkeleton count={8} />}
        {status === 'error' && <LoadError onRetry={retry} />}
        {status === 'ready' && products.length > 0 && <ProductCollection products={products} priorityFirst />}
        {status === 'ready' && products.length === 0 &&
          (isSearch ? (
            <EmptyState
              title="Nothing matched your search"
              body={<p>Try a different word, browse the whole collection, or ask us — we may be able to help.</p>}
              action={{ to: '/shop', label: 'Browse the collection' }}
              secondary={
                <a className="btn-secondary" href={`/contact?product=${encodeURIComponent(searchQuery || '')}`}>
                  Ask our team
                </a>
              }
            />
          ) : (
            <EmptyState
              title="No items found in this selection"
              body={<p>Try exploring another budget band or category, or share what you are looking for.</p>}
              action={{ to: '/shop', label: 'View all pieces' }}
              secondary={
                <a className="btn-secondary" href="/contact">
                  Enquire for custom gifts
                </a>
              }
            />
          ))}
      </div>
    </div>
  );
};
