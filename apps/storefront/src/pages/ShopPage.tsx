import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { BRAND_TAGLINES, DEITIES, FRAME_PRICE_BANDS, OCCASIONS, Product } from '@swayari/shared';
import { ProductCollection } from '../components/ProductCollection';
import { ProductCard } from '../components/ProductCard';
import { CollectionSkeleton, EmptyState, LoadError } from '../components/States';
import { EASE_LUXURY, Reveal, StaggerGroup, StaggerItem } from '../components/motion';
import { useDialogBehaviour } from '../components/ui';
import { useRouter } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { PAGES, shopLanding } from '../content/seo.js';
import { useProducts } from '../lib/products';

/** The five catalogue categories (slug matches `categories.slug`, sent to the API as `category`). */
const CATEGORIES: { slug: string; name: string }[] = [
  { slug: 'god-frames', name: 'God Frames' },
  { slug: 'stotram-frames', name: 'Stotram Frames' },
  { slug: 'god-stands', name: 'God Stands' },
  { slug: 'stotram-cards', name: 'Stotram Cards' }
];

/** Extra budget the API accepts on top of FRAME_PRICE_BANDS: the whole gifting collection. */
const GIFTING_BAND = { id: 'under-2999', label: 'Gifting under ₹2,999' };

function budgetLabel(id: string) {
  if (id === GIFTING_BAND.id) return GIFTING_BAND.label;
  return FRAME_PRICE_BANDS.find(b => b.id === id)?.label;
}

/** Occasion chips come from the shared OCCASIONS; the id is what each product stores in occasions_json. */
function findOccasion(param: string) {
  const p = param.toLowerCase();
  // Accept the id (current links) or the display name (older links).
  return OCCASIONS.find(o => o.id === p || o.name.toLowerCase() === p);
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

type QueryUpdate = { category?: string; budget?: string; deity?: string; occasion?: string; bulk?: boolean };

export const ShopPage: React.FC<{ searchQuery?: string }> = ({ searchQuery }) => {
  const { navigate, search } = useRouter();
  // `/search?q=` passes the query in; the header and this page's own search bar use `/shop?search=`.
  const effectiveQuery = searchQuery !== undefined ? searchQuery : search.get('search') ?? undefined;
  const isSearch = effectiveQuery !== undefined;

  const category = isSearch ? '' : search.get('category') || '';
  const budget = isSearch ? '' : search.get('budget') || '';
  const deity = isSearch ? '' : search.get('deity') || '';
  const occasion = isSearch ? '' : search.get('occasion') || '';
  // `bulk=1` is still used by links elsewhere (header, hero): items that offer bulk prices.
  const isBulk = isSearch ? false : search.get('bulk') === '1';

  const [draft, setDraft] = useState(effectiveQuery || '');
  useEffect(() => setDraft(effectiveQuery || ''), [effectiveQuery]);
  const [sort, setSort] = useState<SortKey>('featured');
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeOccasion = occasion ? findOccasion(occasion) : undefined;
  const activeCategory = CATEGORIES.find(c => c.slug === category);
  const activeDeity = DEITIES.find(d => d.id === deity.toLowerCase());

  const { products, status, retry } = useProducts({
    category: category || undefined,
    search: isSearch ? effectiveQuery : undefined,
    budget: budget || undefined,
    deity: deity || undefined,
    // Older links may carry the occasion's display name; always query with the stored id.
    occasion: activeOccasion ? activeOccasion.id : occasion || undefined,
    bulk: isBulk || undefined
  });

  const sorted = useMemo(() => sortProducts(products, sort), [products, sort]);

  // Page title follows the most specific filter.
  let title = 'Devotional Gifts';
  if (isSearch) {
    title = effectiveQuery ? `Results for “${effectiveQuery}”` : 'Search Gifts';
  } else if (activeCategory || category) {
    title = activeCategory ? activeCategory.name : category.replace(/-/g, ' ');
  } else if (occasion) {
    title = activeOccasion ? activeOccasion.name : occasion;
  } else if (isBulk) {
    title = 'Return Gifts in Bulk';
  } else if (deity) {
    title = `${activeDeity ? activeDeity.name : deity} Gifts`;
  } else if (budget) {
    title = budgetLabel(budget) || 'Shop by Budget';
  }
  const isFiltered = isSearch || isBulk || Boolean(category || deity || occasion || budget);

  // A single category, occasion, budget or deity filter is a landing page with its own title (content/seo.js).
  const landing = shopLanding(search);
  usePageMeta(
    landing ? landing.meta.title : isFiltered ? title : PAGES['/shop'].title,
    landing ? landing.meta.description : PAGES['/shop'].description,
    { noindex: isSearch }
  );

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = draft.trim();
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop');
  }

  function updateQuery(updates: QueryUpdate) {
    const p = new URLSearchParams();
    const newCat = updates.category !== undefined ? updates.category : category;
    const newBud = updates.budget !== undefined ? updates.budget : budget;
    const newDeity = updates.deity !== undefined ? updates.deity : deity;
    const newOcc = updates.occasion !== undefined ? updates.occasion : occasion;
    const newBulk = updates.bulk !== undefined ? updates.bulk : isBulk;

    if (newCat) p.set('category', newCat);
    if (newBud) p.set('budget', newBud);
    if (newDeity) p.set('deity', newDeity);
    if (newOcc) p.set('occasion', newOcc);
    if (newBulk) p.set('bulk', '1');

    const qs = p.toString();
    // Keep the visitor's scroll position while refining filters.
    navigate(`/shop${qs ? `?${qs}` : ''}`, { keepScroll: true });
  }

  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (category) activeChips.push({ key: 'category', label: activeCategory?.name || category.replace(/-/g, ' '), clear: () => updateQuery({ category: '' }) });
  if (deity) activeChips.push({ key: 'deity', label: `Deity: ${activeDeity?.name || deity}`, clear: () => updateQuery({ deity: '' }) });
  if (budget) activeChips.push({ key: 'budget', label: budgetLabel(budget) || budget, clear: () => updateQuery({ budget: '' }) });
  if (occasion) activeChips.push({ key: 'occasion', label: activeOccasion?.name || occasion, clear: () => updateQuery({ occasion: '' }) });
  if (isBulk) activeChips.push({ key: 'bulk', label: 'Bulk prices', clear: () => updateQuery({ bulk: false }) });
  const activeFiltersCount = activeChips.length;

  const groups = (
    <FilterGroups
      category={category}
      deity={deity}
      budget={budget}
      activeOccasionId={activeOccasion?.id}
      occasion={occasion}
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_LUXURY }}
          >
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">{isSearch ? 'Search the collection' : BRAND_TAGLINES.headline}</p>
              <h1 className="display-title">
                {isFiltered ? (
                  title
                ) : (
                  <>
                    Devotional <em>gifts</em>
                  </>
                )}
              </h1>
              <p className="lede mt-4 max-w-xl">
                Silver foil god frames, stotram frames, god stands and stotram cards, every one under ₹2,999 — for weddings,
                griha pravesh, festivals and the pooja room. Order from 1 piece, and mix designs to unlock bulk prices.
              </p>
              <p className="mt-3 text-[0.8125rem] text-ink-soft">{BRAND_TAGLINES.priceNote}</p>
            </div>

            {/* Search */}
            <form onSubmit={submitSearch} role="search" className="relative w-full lg:w-[22rem]">
              <label htmlFor="shop-search" className="sr-only">
                Search devotional gifts
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
              <input
                id="shop-search"
                type="search"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Search frames, stands and stotram cards"
                className="h-12 w-full rounded-full border border-stone-deep bg-white/90 pl-11 pr-12 text-[0.9375rem] text-ink shadow-subtle transition-all duration-300 placeholder:text-ink-soft focus:border-gold focus:bg-white focus:outline-none focus:ring-4 focus:ring-gold/15 [&::-webkit-search-cancel-button]:hidden"
                enterKeyHint="search"
              />
              {draft && (
                <button
                  type="button"
                  onClick={() => {
                    setDraft('');
                    if (isSearch) navigate('/shop');
                  }}
                  className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-burgundy"
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

        {/* Mobile: quick category row + Filters sheet trigger */}
        {!isSearch && (
          <div className="pt-5 md:hidden">
            <div className="-mx-4 overflow-x-auto px-4 scrollbar-none mask-fade-x">
              <div className="flex w-max gap-2 py-1 pr-6" role="group" aria-label="Filter by category">
                <button type="button" onClick={() => updateQuery({ category: '' })} aria-pressed={!category} className={`chip h-11 ${!category ? 'chip-active' : ''}`}>
                  All gifts
                </button>
                {CATEGORIES.map(c => {
                  const active = category === c.slug;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => updateQuery({ category: active ? '' : c.slug })}
                      aria-pressed={active}
                      className={`chip h-11 ${active ? 'chip-active' : ''}`}
                    >
                      {c.name}
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
                    <span>{products.length === 1 ? 'design' : 'designs'}</span>
                    <span className="hidden lg:inline"> · Order from 1 piece · Delivery extra</span>
                  </>
                ) : status === 'loading' ? (
                  <span>Loading…</span>
                ) : null}
              </p>
            </div>
            <div className="relative flex-shrink-0">
              <label htmlFor="shop-sort" className="sr-only">
                Sort designs
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
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
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
              title="No designs matched your filters"
              body={<p>Try clearing a filter, or browse the full collection — god frames, stotram frames, god stands and stotram cards.</p>}
              action={{ to: '/shop', label: 'View all designs' }}
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

const FilterGroups: React.FC<{
  category: string;
  deity: string;
  budget: string;
  occasion: string;
  activeOccasionId?: string;
  updateQuery: (u: QueryUpdate) => void;
}> = ({ category, deity, budget, occasion, activeOccasionId, updateQuery }) => (
  <div className="space-y-6 md:space-y-4">
    <FilterRow label="Category">
      <Chip active={!category} onClick={() => updateQuery({ category: '' })}>
        All gifts
      </Chip>
      {CATEGORIES.map(c => {
        const active = category === c.slug;
        return (
          <Chip key={c.slug} active={active} onClick={() => updateQuery({ category: active ? '' : c.slug })}>
            {c.name}
          </Chip>
        );
      })}
    </FilterRow>

    <FilterRow label="Price">
      <Chip active={!budget} onClick={() => updateQuery({ budget: '' })}>
        All prices
      </Chip>
      {[GIFTING_BAND, ...FRAME_PRICE_BANDS].map(band => {
        const active = budget === band.id;
        return (
          <Chip key={band.id} active={active} onClick={() => updateQuery({ budget: active ? '' : band.id })}>
            {band.label}
          </Chip>
        );
      })}
    </FilterRow>

    <FilterRow label="Deity">
      <Chip active={!deity} onClick={() => updateQuery({ deity: '' })}>
        All deities
      </Chip>
      {DEITIES.filter(d => d.id !== 'all').map(d => {
        const active = deity.toLowerCase() === d.id;
        return (
          <Chip key={d.id} active={active} onClick={() => updateQuery({ deity: active ? '' : d.id })}>
            {d.name}
          </Chip>
        );
      })}
    </FilterRow>

    <FilterRow label="Occasion">
      <Chip active={!occasion} onClick={() => updateQuery({ occasion: '' })}>
        Every occasion
      </Chip>
      {OCCASIONS.map(o => {
        const active = activeOccasionId === o.id;
        return (
          <Chip key={o.id} active={active} onClick={() => updateQuery({ occasion: active ? '' : o.id })}>
            {o.name}
          </Chip>
        );
      })}
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
                Refine <em className="text-burgundy">gifts</em>
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
                {resultCount === null ? 'Show designs' : `Show ${resultCount} ${resultCount === 1 ? 'design' : 'designs'}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
