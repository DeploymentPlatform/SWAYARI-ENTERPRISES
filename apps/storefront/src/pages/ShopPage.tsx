import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { ProductCollection } from '../components/ProductCollection';
import { CollectionSkeleton, EmptyState, LoadError } from '../components/States';
import { useRouter } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { useCategories, useProducts } from '../lib/products';

/** Catalogue (/shop) and search results (/search?q=) share one page. */
export const ShopPage: React.FC<{ searchQuery?: string }> = ({ searchQuery }) => {
  const { navigate, search } = useRouter();
  const isSearch = searchQuery !== undefined;
  const category = isSearch ? '' : search.get('category') || '';
  const [draft, setDraft] = useState(searchQuery || '');
  useEffect(() => setDraft(searchQuery || ''), [searchQuery]);

  const { products, status, retry } = useProducts({ category: category || undefined, search: isSearch ? searchQuery : undefined });
  const categories = useCategories().filter(c => (c.productCount ?? 0) > 0);

  usePageMeta(
    isSearch ? (searchQuery ? `Search: ${searchQuery}` : 'Search') : 'The Collection',
    'Browse SWAYARI décor and gifting. Add pieces to your bag and send one request — our team confirms availability, pricing and delivery personally.',
    { noindex: isSearch }
  );

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = draft.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/shop');
  }

  const title = isSearch ? (searchQuery ? `Results for “${searchQuery}”` : 'Search') : 'The Collection';

  return (
    <div className="container-content pb-20 md:pb-28">
      <header className="flex flex-col gap-6 border-b border-stone-deep pb-8 pt-10 md:flex-row md:items-end md:justify-between md:pb-10 md:pt-14">
        <div>
          <p className="eyebrow mb-3">{isSearch ? 'Search' : 'Shop'}</p>
          <h1 className="text-display-sm md:text-display-lg">{title}</h1>
          {status === 'ready' && (
            <p className="mt-3 text-ink-soft" aria-live="polite">
              {products.length} {products.length === 1 ? 'piece' : 'pieces'}
              {!isSearch && ' · prices confirmed personally by our team'}
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

      {!isSearch && categories.length > 1 && (
        <nav aria-label="Categories" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pt-6 sm:mx-0 sm:px-0">
          {[{ slug: '', name: 'All pieces' }, ...categories].map(c => {
            const active = category === c.slug;
            return (
              <button
                key={c.slug || 'all'}
                type="button"
                aria-pressed={active}
                onClick={() => navigate(c.slug ? `/shop?category=${c.slug}` : '/shop')}
                className={`whitespace-nowrap border px-4 py-2 text-sm transition-colors ${
                  active ? 'border-ink bg-ink text-ivory' : 'border-stone-shade text-ink hover:border-ink'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </nav>
      )}

      <div className="pt-10 md:pt-14">
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
              title="Our first pieces are being photographed"
              body={<p>Tell us what you are looking for and our team will reply personally.</p>}
              action={{ to: '/contact', label: 'Ask about a piece' }}
            />
          ))}
      </div>
    </div>
  );
};
