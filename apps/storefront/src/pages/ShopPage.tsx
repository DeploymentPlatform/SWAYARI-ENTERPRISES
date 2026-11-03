import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { DEITIES, FRAME_SIZES, ORIENTATIONS, FRAME_PRICE_BANDS, OCCASIONS, Product } from '@swayari/shared';
import { ProductCollection } from '../components/ProductCollection';
import { ProductCard } from '../components/ProductCard';
import { CollectionSkeleton, EmptyState, LoadError } from '../components/States';
import { EASE_LUXURY, Reveal, StaggerGroup, StaggerItem } from '../components/motion';
import { useDialogBehaviour } from '../components/ui';
import { useRouter } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { useProducts } from '../lib/products';

/** Occasion chips. `value` is what the catalogue stores on each frame (matched with LIKE by the API). */
const OCCASION_FILTERS: { id: string; label: string; value: string; aliases: string[] }[] = [
  { id: 'wedding-return', label: 'Wedding Return Gifts', value: 'Wedding Return', aliases: [] },
  { id: 'housewarming', label: 'Griha Pravesh', value: 'Housewarming', aliases: [] },
  { id: 'navratri-haldi', label: 'Navratri & Haldi Kumkum', value: 'Navratri', aliases: [] },
  { id: 'family-celebrations', label: 'Family Poojas', value: 'Family Celebrations', aliases: [] }
].map(o => ({ ...o, aliases: [OCCASIONS.find(x => x.id === o.id)?.name || '', o.id].filter(Boolean) }));

function findOccasion(param: string) {
  const p = param.toLowerCase();
  return OCCASION_FILTERS.find(o => o.value.toLowerCase() === p || o.aliases.some(a => a.toLowerCase() === p));
}

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';
const SORTS: { id: SortKey; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Low price' },
  { id: 'price-desc', label: 'High price' },
  { id: 'name', label: 'Name A–Z' }
];

function sortProducts(list: Product[], sort: SortKey): Product[] {
  if (sort === 'featured') return list;
  const copy = [...list];
  const price = (p: Product) => (p.indicativePrice === null ? Number.POSITIVE_INFINITY : p.indicativePrice);
  if (sort === 'price-asc') copy.sort((a, b) => price(a) - price(b));
  if (sort === 'price-desc') copy.sort((a, b) => (b.indicativePrice ?? -1) - (a.indicativePrice ?? -1));
  if (sort === 'name') copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

export const ShopPage: React.FC<{ searchQuery?: string }> = ({ searchQuery }) => {
  const { navigate, search } = useRouter();
  // `/search?q=` passes the query in; the header and this page's own search bar use `/shop?search=`.
  const effectiveQuery = searchQuery !== undefined ? searchQuery : search.get('search') ?? undefined;
  const isSearch = effectiveQuery !== undefined;

  const category = isSearch ? '' : search.get('category') || '';
  const budget = isSearch ? '' : search.get('budget') || '';
  const deity = isSearch ? '' : search.get('deity') || '';
  const frameSize = isSearch ? '' : search.get('frame_size') || search.get('size') || '';
  const orientation = isSearch ? '' : search.get('orientation') || '';
  const occasion = isSearch ? '' : search.get('occasion') || '';
  const isBulk = isSearch ? false : search.get('bulk') === '1';

  const [draft, setDraft] = useState(effectiveQuery || '');
  useEffect(() => setDraft(effectiveQuery || ''), [effectiveQuery]);
  const [sort, setSort] = useState<SortKey>('featured');
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeOccasion = occasion ? findOccasion(occasion) : undefined;

  const { products, status, retry } = useProducts({
    category: category || undefined,
    search: isSearch ? effectiveQuery : undefined,
    budget: budget || undefined,
    deity: deity || undefined,
    frame_size: frameSize || undefined,
    orientation: orientation || undefined,
    // Links from the home page use the occasion's display name; query with the stored keyword.
    occasion: activeOccasion ? activeOccasion.value : occasion || undefined,
    bulk: isBulk || undefined
  });

  const sorted = useMemo(() => sortProducts(products, sort), [products, sort]);

  // Derive dynamic page title
  let title = 'Devotional God Frames';
  if (isSearch) {
    title = effectiveQuery ? `Results for “${effectiveQuery}”` : 'Search Frames';
  } else if (isBulk) {
    title = 'Wedding Return Gifts & Bulk Frames';
  } else if (deity) {
    const dObj = DEITIES.find(d => d.id === deity);
    title = dObj ? `${dObj.name} Frames` : `${deity} Frames`;
  } else if (occasion) {
    title = `Frames for ${activeOccasion ? activeOccasion.label : occasion}`;
  } else if (frameSize) {
    const sObj = FRAME_SIZES.find(s => s.id === frameSize);
    title = sObj ? `${sObj.name} Frames` : `${frameSize} Frames`;
  } else if (budget) {
    const band = FRAME_PRICE_BANDS.find(b => b.id === budget);
    title = band ? `Gifts ${band.label}` : 'Everything under ₹999';
  }

  usePageMeta(
    title,
    'Devotional gifts under ₹999, including No. 1 silver foil god frames at ₹149 each. Auspicious return gifts for weddings, griha pravesh and family celebrations. Minimum order 25 frames; shipping extra.',
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
    occasion?: string;
    bulk?: boolean;
  }) {
    const p = new URLSearchParams();
    const newCat = updates.category !== undefined ? updates.category : category;
    const newBud = updates.budget !== undefined ? updates.budget : budget;
    const newDeity = updates.deity !== undefined ? updates.deity : deity;
    const newSize = updates.frame_size !== undefined ? updates.frame_size : frameSize;
    const newOri = updates.orientation !== undefined ? updates.orientation : orientation;
    const newOcc = updates.occasion !== undefined ? updates.occasion : occasion;
    const newBulk = updates.bulk !== undefined ? updates.bulk : isBulk;

    if (newCat) p.set('category', newCat);
    if (newBud) p.set('budget', newBud);
    if (newDeity) p.set('deity', newDeity);
    if (newSize) p.set('frame_size', newSize);
    if (newOri) p.set('orientation', newOri);
    if (newOcc) p.set('occasion', newOcc);
    if (newBulk) p.set('bulk', '1');

    const qs = p.toString();
    // Keep the visitor's scroll position while refining filters.
    const y = window.scrollY;
    navigate(`/shop${qs ? `?${qs}` : ''}`);
    window.scrollTo({ top: y });
  }

  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (category) activeChips.push({ key: 'category', label: category.replace(/-/g, ' '), clear: () => updateQuery({ category: '' }) });
  if (deity) activeChips.push({ key: 'deity', label: `Deity: ${DEITIES.find(d => d.id === deity)?.name || deity}`, clear: () => updateQuery({ deity: '' }) });
  if (budget) activeChips.push({ key: 'budget', label: FRAME_PRICE_BANDS.find(b => b.id === budget)?.label || budget, clear: () => updateQuery({ budget: '' }) });
  if (occasion) activeChips.push({ key: 'occasion', label: activeOccasion?.label || occasion, clear: () => updateQuery({ occasion: '' }) });
  if (frameSize) activeChips.push({ key: 'size', label: `Size: ${FRAME_SIZES.find(s => s.id === frameSize)?.name || frameSize}`, clear: () => updateQuery({ frame_size: '' }) });
  if (orientation) activeChips.push({ key: 'orientation', label: ORIENTATIONS.find(o => o.id === orientation)?.name || orientation, clear: () => updateQuery({ orientation: '' }) });
  if (isBulk) activeChips.push({ key: 'bulk', label: 'Bulk favours only', clear: () => updateQuery({ bulk: false }) });
  const activeFiltersCount = activeChips.length;

  const groups = (
    <FilterGroups
      deity={deity}
      budget={budget}
      occasion={occasion}
      frameSize={frameSize}
      orientation={orientation}
      isBulk={isBulk}
      activeOccasionId={activeOccasion?.id}
      updateQuery={updateQuery}
    />
  );

  const gridKey = search.toString() + sort;

  return (
    <div className="pb-20 md:pb-28">
      {/* Page header */}
      <header className="relative overflow-hidden border-b border-stone-deep/70 bg-gradient-to-b from-ivory-light/90 to-transparent">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-light/25 blur-3xl" />
        <div className="container-content relative pb-8 pt-10 md:pb-12 md:pt-16">
          <motion.div
            className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_LUXURY }}
          >
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">{isSearch ? 'Search the collection' : 'Everything under ₹999'}</p>
              <h1 className="display-title">
                {isSearch || isBulk || deity || occasion || frameSize || budget ? (
                  title
                ) : (
                  <>
                    Devotional <em>god frames</em>
                  </>
                )}
              </h1>
              <p className="lede mt-4 max-w-xl">
                Auspicious god frames and gifts for weddings, griha pravesh and family poojas — everything is ₹999 or less, and our
                god frames are just ₹149 each. Minimum order 25 frames in any mix; shipping is charged extra.
              </p>
            </div>

            {/* Search */}
            <form onSubmit={submitSearch} role="search" className="relative w-full lg:w-[22rem]">
              <label htmlFor="shop-search" className="sr-only">
                Search god frames
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
              <input
                id="shop-search"
                type="search"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Search god frames and return gifts"
                className="h-12 w-full rounded-full border border-stone-deep bg-white/90 pl-11 pr-12 text-[0.9375rem] text-ink shadow-subtle transition-all duration-300 placeholder:text-ink-faint focus:border-gold focus:bg-white focus:outline-none focus:ring-4 focus:ring-gold/15 [&::-webkit-search-cancel-button]:hidden"
                enterKeyHint="search"
              />
              {draft && (
                <button
                  type="button"
                  onClick={() => {
                    setDraft('');
                    if (isSearch) navigate('/shop');
                  }}
                  className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint transition-colors hover:text-burgundy"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </form>
          </motion.div>
        </div>
      </header>

      <div className="container-content">
        {/* Desktop / tablet filters */}
        {!isSearch && <div className="hidden pt-8 md:block">{groups}</div>}

        {/* Mobile: quick deity row + Filters sheet trigger */}
        {!isSearch && (
          <div className="pt-5 md:hidden">
            <div className="-mx-4 overflow-x-auto px-4 scrollbar-none mask-fade-x">
              <div className="flex w-max gap-2 py-1 pr-6" role="group" aria-label="Filter by deity">
                <button type="button" onClick={() => updateQuery({ deity: '' })} aria-pressed={!deity} className={`chip h-11 ${!deity ? 'chip-active' : ''}`}>
                  All deities
                </button>
                {DEITIES.filter(d => d.id !== 'all').map(d => {
                  const active = deity.toLowerCase() === d.id.toLowerCase();
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => updateQuery({ deity: active ? '' : d.id })}
                      aria-pressed={active}
                      className={`chip h-11 ${active ? 'chip-active' : ''}`}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Toolbar: count, active filters, sort */}
        <div className="mt-5 border-y border-stone-deep/70 py-3 md:mt-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {!isSearch && (
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="chip h-11 flex-shrink-0 border-ink/15 text-ink md:hidden"
                  aria-haspopup="dialog"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-burgundy px-1.5 text-[0.6875rem] font-semibold text-ivory-light">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              )}
              <p className="whitespace-nowrap text-sm text-ink-soft" aria-live="polite">
                {status === 'ready' ? (
                  <>
                    <span className="font-display text-[1.25rem] font-semibold text-ink lining-nums">{products.length}</span>{' '}
                    <span className="hidden sm:inline">{products.length === 1 ? 'frame design' : 'frame designs'}</span>
                    <span className="sm:hidden">{products.length === 1 ? 'design' : 'designs'}</span>
                    <span className="hidden lg:inline"> · Everything under ₹999 · Minimum 25 frames · Shipping extra</span>
                  </>
                ) : status === 'loading' ? (
                  <span className="text-ink-faint">Loading…</span>
                ) : null}
              </p>
            </div>
            <div className="relative flex-shrink-0">
              <label htmlFor="shop-sort" className="sr-only">
                Sort frames
              </label>
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gold-dark" aria-hidden />
              <select
                id="shop-sort"
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                className="h-11 cursor-pointer appearance-none rounded-full border border-stone-deep bg-white/90 pl-8 pr-8 sm:pl-9 sm:pr-9 text-[0.8125rem] font-medium text-ink transition-colors hover:border-gold focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
              >
                {SORTS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="sr-only">Active filters:</span>
              <AnimatePresence initial={false}>
                {activeChips.map(c => (
                  <motion.span
                    key={c.key}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, ease: EASE_LUXURY }}
                    className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold-pale/60 py-1 pl-3 pr-1 text-[0.8125rem] font-medium capitalize text-burgundy"
                  >
                    {c.label}
                    <button
                      type="button"
                      onClick={c.clear}
                      aria-label={`Remove ${c.label} filter`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              <button type="button" onClick={() => navigate('/shop')} className="link-underline ml-1 text-[0.8125rem] font-semibold text-burgundy">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Product grid */}
        <section className="mt-8 md:mt-10" aria-label="Product catalogue">
          {status === 'loading' && <CollectionSkeleton count={8} />}
          {status === 'error' && <LoadError onRetry={retry} />}
          {status === 'ready' && products.length === 0 && (
            <EmptyState
              eyebrow="Nothing here just yet"
              title="No devotional frames matched your filters"
              body={<p>Try clearing one or more filters, or explore our full collection — everything is under ₹999.</p>}
              action={{ to: '/shop', label: 'View All Frames' }}
            />
          )}
          {status === 'ready' && products.length > 0 && products.length < 4 && (
            <Reveal key={gridKey}>
              <ProductCollection products={sorted} />
            </Reveal>
          )}
          {status === 'ready' && products.length >= 4 && (
            <StaggerGroup key={gridKey} className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-12">
              {sorted.map((p, i) => (
                <StaggerItem key={p.id} className="h-full">
                  <ProductCard product={p} priority={i < 2} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </section>
      </div>

      {/* Mobile filters bottom sheet */}
      {!isSearch && (
        <FilterSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          resultCount={status === 'ready' ? products.length : null}
          onClear={() => navigate('/shop')}
          hasActive={activeFiltersCount > 0}
        >
          {groups}
        </FilterSheet>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ Filter groups */

const FilterRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-2.5 md:flex-row md:items-start md:gap-5">
    <p className="w-28 flex-shrink-0 pt-2.5 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-dark">{label}</p>
    <div className="flex flex-wrap gap-2" role="group" aria-label={`Filter by ${label.toLowerCase()}`}>
      {children}
    </div>
  </div>
);

const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} aria-pressed={active} className={`chip h-11 md:h-9 ${active ? 'chip-active' : ''}`}>
    {children}
  </button>
);

const SelectField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { id: string; name: string }[];
}> = ({ id, label, value, onChange, options }) => (
  <div className="relative">
    <label htmlFor={id} className="sr-only">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`h-11 w-full cursor-pointer appearance-none rounded-full border bg-white/90 pl-4 pr-10 text-[0.8125rem] font-medium transition-colors hover:border-gold focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15 md:h-9 md:w-auto ${
        value ? 'border-burgundy/60 text-burgundy' : 'border-stone-deep text-ink-soft'
      }`}
    >
      {options.map(o => (
        <option key={o.id} value={o.id === 'all' ? '' : o.id}>
          {o.name}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
  </div>
);

const FilterGroups: React.FC<{
  deity: string;
  budget: string;
  occasion: string;
  frameSize: string;
  orientation: string;
  isBulk: boolean;
  activeOccasionId?: string;
  updateQuery: (u: { deity?: string; budget?: string; occasion?: string; frame_size?: string; orientation?: string; bulk?: boolean }) => void;
}> = ({ deity, budget, occasion, frameSize, orientation, isBulk, activeOccasionId, updateQuery }) => (
  <div className="space-y-6 md:space-y-4">
    <FilterRow label="Deity">
      <Chip active={!deity} onClick={() => updateQuery({ deity: '' })}>
        All deities
      </Chip>
      {DEITIES.filter(d => d.id !== 'all').map(d => {
        const active = deity.toLowerCase() === d.id.toLowerCase();
        return (
          <Chip key={d.id} active={active} onClick={() => updateQuery({ deity: active ? '' : d.id })}>
            {d.name}
          </Chip>
        );
      })}
    </FilterRow>

    <FilterRow label="Price">
      <Chip active={!budget} onClick={() => updateQuery({ budget: '' })}>
        All (under ₹999)
      </Chip>
      {FRAME_PRICE_BANDS.map(band => {
        const active = budget === band.id;
        return (
          <Chip key={band.id} active={active} onClick={() => updateQuery({ budget: active ? '' : band.id })}>
            {band.label}
          </Chip>
        );
      })}
    </FilterRow>

    <FilterRow label="Occasion">
      <Chip active={!occasion && !isBulk} onClick={() => updateQuery({ occasion: '', bulk: false })}>
        Every occasion
      </Chip>
      {OCCASION_FILTERS.map(o => {
        const active = activeOccasionId === o.id;
        return (
          <Chip key={o.id} active={active} onClick={() => updateQuery({ occasion: active ? '' : o.value })}>
            {o.label}
          </Chip>
        );
      })}
      <Chip active={isBulk} onClick={() => updateQuery({ bulk: !isBulk })}>
        Wedding Return Favors Only
      </Chip>
    </FilterRow>

    <FilterRow label="Format">
      <div className="grid w-full grid-cols-1 gap-2 md:flex md:w-auto">
        <SelectField id="filter-orientation" label="Orientation" value={orientation} onChange={v => updateQuery({ orientation: v })} options={ORIENTATIONS} />
      </div>
    </FilterRow>
  </div>
);

/* ------------------------------------------------------------------ Mobile bottom sheet */

const FilterSheet: React.FC<{
  open: boolean;
  onClose: () => void;
  resultCount: number | null;
  hasActive: boolean;
  onClear: () => void;
  children: React.ReactNode;
}> = ({ open, onClose, resultCount, hasActive, onClear, children }) => {
  const ref = useDialogBehaviour(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <motion.div
            className="absolute inset-0 bg-umber/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filters-title"
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[28px] bg-ivory-light shadow-dialog outline-none"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.55, ease: EASE_LUXURY }}
          >
            <div className="flex justify-center pt-3" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-stone-shade" />
            </div>
            <div className="flex items-center justify-between border-b border-stone-deep px-5 pb-3 pt-2">
              <h2 id="filters-title" className="font-display text-[1.75rem]">
                Refine <em className="text-burgundy">frames</em>
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-stone"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>
            <div className="pb-safe grid grid-cols-[auto_1fr] gap-3 border-t border-stone-deep bg-white/80 px-5 pt-3 backdrop-blur">
              <button type="button" className="btn-secondary px-5" onClick={onClear} disabled={!hasActive}>
                Clear
              </button>
              <button type="button" className="btn-primary" onClick={onClose}>
                {resultCount === null ? 'Show frames' : `Show ${resultCount} ${resultCount === 1 ? 'frame' : 'frames'}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
