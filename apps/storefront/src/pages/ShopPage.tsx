import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '@swayari/shared';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

interface ShopPageProps {
  navigate: (path: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const isDev = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
      let url = isDev ? '/api/products?include_demo=1' : '/api/products';
      if (selectedCategory && selectedCategory !== 'all') {
        url += `${url.includes('?') ? '&' : '?'}category=${encodeURIComponent(selectedCategory)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.material && p.material.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header and Editorial Title */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-burgundy font-medium">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Curated Collection</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal tracking-tight">
          Devotional Catalogue &amp; Décor
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted font-light leading-relaxed">
          Select pieces to include in your bespoke enquiry. Our team confirms exact finish options, custom engraving, and shipping details personally.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-ivory-border shadow-subtle mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Categories Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-burgundy text-white shadow-sm'
                : 'bg-ivory text-charcoal hover:bg-ivory-muted'
            }`}
          >
            All Collections
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-burgundy text-white shadow-sm'
                  : 'bg-ivory text-charcoal hover:bg-ivory-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-charcoal-light absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, metal or style..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-ivory rounded-lg border border-ivory-border focus:outline-none focus:border-burgundy text-charcoal"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-xl border border-ivory-border p-4 space-y-4 animate-pulse">
              <div className="aspect-[4/5] bg-ivory-muted rounded-lg" />
              <div className="h-4 bg-ivory-muted rounded w-3/4" />
              <div className="h-3 bg-ivory-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              onViewDetails={slug => navigate(`/product/${slug}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ivory-border p-12 text-center max-w-lg mx-auto shadow-subtle space-y-3">
          <SlidersHorizontal className="w-8 h-8 text-gold mx-auto stroke-[1.5]" />
          <h3 className="font-serif text-lg font-semibold text-charcoal">No Matching Pieces Found</h3>
          <p className="text-xs text-charcoal-muted font-light leading-relaxed">
            {searchQuery
              ? `No products matched "${searchQuery}". Try broadening your search or resetting filters.`
              : 'Our studio is updating this collection category with newly photographed pieces.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 text-xs font-semibold text-burgundy hover:underline"
            >
              Reset Search &amp; Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
