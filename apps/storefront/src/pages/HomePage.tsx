import React, { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { Product } from '@swayari/shared';
import { ArrowRight, Sparkles, Gift, Shield, Compass } from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      // In local preview/dev mode, check if we need to include demo products so the page is visually rich
      const isDev = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
      const url = isDev ? '/api/products?include_demo=1' : '/api/products';
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

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. High-Impact Editorial Hero Section */}
      <Hero onExplore={() => navigate('/shop')} onAbout={() => navigate('/about')} />

      {/* 2. Curated Signature Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 border-b border-ivory-border/70 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-burgundy font-medium">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Curated Catalogue</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-charcoal mt-1 tracking-tight">
              Signature Devotional Art
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1 font-light max-w-xl">
              Each piece represents hours of hand-engraving, traditional alloy casting, and bespoke surface finishing.
            </p>
          </div>

          <button
            onClick={() => navigate('/shop')}
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-burgundy hover:text-burgundy-hover group transition-colors"
          >
            <span>View All Pieces</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Product Grid or Graceful Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-xl border border-ivory-border p-4 space-y-4 animate-pulse">
                <div className="aspect-[4/5] bg-ivory-muted rounded-lg" />
                <div className="h-4 bg-ivory-muted rounded w-3/4" />
                <div className="h-3 bg-ivory-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {products.slice(0, 8).map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewDetails={slug => navigate(`/product/${slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-ivory-border p-12 text-center max-w-xl mx-auto shadow-subtle space-y-4">
            <Compass className="w-10 h-10 text-gold mx-auto stroke-[1.5]" />
            <h3 className="font-serif text-xl font-semibold text-charcoal">Catalogue Under Handcrafted Curation</h3>
            <p className="text-xs sm:text-sm text-charcoal-muted font-light leading-relaxed">
              We are currently photographing and documenting our physical inventory. Contact our studio directly for private viewing or custom commissioned pieces.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-md bg-burgundy text-white text-xs font-medium hover:bg-burgundy-hover transition-colors shadow-sm"
            >
              <span>Contact Studio Directly</span>
            </button>
          </div>
        )}
      </section>

      {/* 3. Editorial Artisanal Craft Section */}
      <section className="bg-gradient-to-r from-ivory-muted via-white to-ivory-muted py-16 border-y border-ivory-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-card border-4 border-white">
                <img
                  src="/assets/brand/swayari_brand_card.jpeg"
                  alt="SWAYARI Artisanal Brand Card"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-burgundy font-medium">
                <Shield className="w-3.5 h-3.5 text-gold" />
                <span>The SWAYARI Heritage</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-charcoal leading-tight">
                Where Sacred Devotion Meets <br />
                <span className="italic text-burgundy">Uncompromising Artistry</span>
              </h2>

              <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed font-light">
                Every sacred idol and ornate frame in our collection is created following authentic iconographic proportions. Handcrafted by generational metal artisans in India, our works honor the rich cultural fabric of sanctified spaces while offering refined aesthetic permanence.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="border-l-2 border-gold pl-4">
                  <h4 className="font-serif text-base font-semibold text-charcoal">Sacred Iconography</h4>
                  <p className="text-xs text-charcoal-muted mt-1 font-light">
                    Proportions and postures sculpted with traditional reverence and exact detail.
                  </p>
                </div>
                <div className="border-l-2 border-gold pl-4">
                  <h4 className="font-serif text-base font-semibold text-charcoal">Generational Casting</h4>
                  <p className="text-xs text-charcoal-muted mt-1 font-light">
                    Hand-cast brass and solid bell metal alloys designed to endure for centuries.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Bespoke Corporate & Festive Gifting Enquiry Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-burgundy text-white rounded-2xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-card">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-gold-light text-xs tracking-wider uppercase font-medium">
              <Gift className="w-3.5 h-3.5" />
              <span>Bespoke Gifting &amp; Bulk Enquiries</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight text-ivory-light">
              Elevate Weddings, Housewarmings &amp; Festive Occasions
            </h2>

            <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed font-light">
              We collaborate with families, architects, and institutions to curate commemorative gifts with customized gift boxes, velvet encasings, and engraved plates.
            </p>

            <div className="pt-4">
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-md bg-gold hover:bg-gold-light text-charcoal text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md"
              >
                <span>Initiate Gifting Consultation</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
