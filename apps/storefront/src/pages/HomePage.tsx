import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, PhoneCall, Gift, Heart, Clock } from 'lucide-react';
import { Hero } from '../components/Hero';
import { CategoryShortcuts } from '../components/CategoryShortcuts';
import { ProductCard } from '../components/ProductCard';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { useProducts } from '../lib/products';
import { Product } from '@swayari/shared';

export const HomePage: React.FC = () => {
  usePageMeta(
    'Artisanal Indian Décor & Bespoke Gifting',
    'Explore handcrafted devotional frames, solid brass lamps, traditional urulis, and curated gift sets with personal consultation.'
  );

  const { products, status } = useProducts();
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Load recently viewed products from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('swayari_recently_viewed');
      if (stored && products.length > 0) {
        const ids: string[] = JSON.parse(stored);
        const matches = ids
          .map((id) => products.find((p) => p.id === id))
          .filter((p): p is Product => Boolean(p))
          .slice(0, 4);
        setRecentlyViewed(matches);
      }
    } catch {
      // Ignore local storage parse error
    }
  }, [products]);

  // Group products by category
  const devotionalFrames = products.filter((p) => p.categoryId === 'cat-devotional-frames').slice(0, 4);
  const decorativeLamps = products.filter((p) => p.categoryId === 'cat-decorative-lamps').slice(0, 4);
  const homeAccents = products.filter((p) => p.categoryId === 'cat-home-accents').slice(0, 4);
  const festiveDecor = products.filter((p) => p.categoryId === 'cat-festive-decor').slice(0, 4);
  const giftSets = products.filter((p) => p.categoryId === 'cat-gift-sets').slice(0, 4);

  // Featured row is visible immediately near the fold at 1440x900!
  const featuredRow = devotionalFrames.length > 0 ? devotionalFrames : products.slice(0, 4);

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      
      {/* 1. Multi-Slide Campaign Hero */}
      <Hero />

      {/* 2. Category Shortcuts */}
      <CategoryShortcuts />

      {/* 3. Featured Row: Curated Devotional & Sanctum Art (Visible near the fold at 1440x900) */}
      <section aria-labelledby="featured-title" className="py-8 sm:py-10 border-b border-[#E7DFD5] bg-[#FFFFFF]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
            <div>
              <span className="text-[11px] sm:text-[12px] font-bold text-[#B49155] uppercase tracking-wider">
                Sanctum &amp; Altar Collection
              </span>
              <h2 id="featured-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#292421] leading-tight mt-0.5">
                Devotional Sanctum Frames
              </h2>
            </div>
            <Link
              to="/shop?category=devotional-frames"
              className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] hover:underline flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All Frames</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Cards Across on Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {featuredRow.map((prod, idx) => (
              <ProductCard key={prod.id} product={prod} priority={idx < 2} />
            ))}
          </div>

        </div>
      </section>

      {/* 4. Section 2: Artisanal Lighting & Temple Lamps */}
      <section aria-labelledby="lamps-title" className="py-8 sm:py-10 border-b border-[#E7DFD5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
            <div>
              <span className="text-[11px] sm:text-[12px] font-bold text-[#B49155] uppercase tracking-wider">
                Heirloom Illumination
              </span>
              <h2 id="lamps-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#292421] leading-tight mt-0.5">
                Decorative Brass Lamps &amp; Deepams
              </h2>
            </div>
            <Link
              to="/shop?category=decorative-lamps"
              className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] hover:underline flex items-center gap-1.5 transition-colors"
            >
              <span>View All Lighting</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {(decorativeLamps.length > 0 ? decorativeLamps : products.slice(4, 8)).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

        </div>
      </section>

      {/* 5. Compact Gifting Promotional Banner */}
      <section aria-label="Bespoke consultation promo" className="py-8 bg-[#571C2A] text-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-[#441420] via-[#571C2A] to-[#6E2234] border border-[#B49155]/40 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-card">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B49155]/20 text-[#D8C29D] text-[11px] font-bold uppercase tracking-wider mb-2">
                <Gift className="w-3.5 h-3.5 text-[#B49155]" />
                <span>Wedding &amp; Corporate Gifting</span>
              </div>
              <h3 className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold leading-snug">
                Planning Ceremonial or Bespoke Gifting?
              </h3>
              <p className="mt-2 text-[13px] sm:text-[14px] text-[#F7F4EF]/85 leading-relaxed">
                From custom-engraved brass plaques to velvet gift-box packaging and insured pan-India delivery, our team coordinates every bespoke detail.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                to="/contact?topic=custom"
                className="px-6 py-3 rounded-full bg-[#B49155] hover:bg-[#8F7138] text-[#1B1310] font-semibold text-[13.5px] text-center shadow-md hover:shadow-lg transition-all"
              >
                Inquire for Custom Sets
              </Link>
              <Link
                to="/shop?category=gift-sets"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-[13.5px] text-center border border-white/20 transition-all"
              >
                Browse Ready Gift Sets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section 3: Solid Brass Home Accents & Sculptures */}
      <section aria-labelledby="accents-title" className="py-8 sm:py-10 border-b border-[#E7DFD5] bg-[#FFFFFF]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
            <div>
              <span className="text-[11px] sm:text-[12px] font-bold text-[#B49155] uppercase tracking-wider">
                Sculpted Masterpieces
              </span>
              <h2 id="accents-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#292421] leading-tight mt-0.5">
                Solid Brass &amp; Bell-Metal Accents
              </h2>
            </div>
            <Link
              to="/shop?category=home-accents"
              className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] hover:underline flex items-center gap-1.5 transition-colors"
            >
              <span>View All Accents</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {(homeAccents.length > 0 ? homeAccents : products.slice(8, 12)).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

        </div>
      </section>

      {/* 7. Section 4: Festive Urulis & Celebration Décor */}
      <section aria-labelledby="decor-title" className="py-8 sm:py-10 border-b border-[#E7DFD5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
            <div>
              <span className="text-[11px] sm:text-[12px] font-bold text-[#B49155] uppercase tracking-wider">
                Festive Entertaining
              </span>
              <h2 id="decor-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#292421] leading-tight mt-0.5">
                Traditional Urulis &amp; Festive Décor
              </h2>
            </div>
            <Link
              to="/shop?category=festive-decor"
              className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] hover:underline flex items-center gap-1.5 transition-colors"
            >
              <span>View All Festive Décor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {(festiveDecor.length > 0 ? festiveDecor : products.slice(12, 16)).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

        </div>
      </section>

      {/* 8. Section 5: Curated Gift Sets */}
      <section aria-labelledby="gifts-title" className="py-8 sm:py-10 border-b border-[#E7DFD5] bg-[#FFFFFF]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
            <div>
              <span className="text-[11px] sm:text-[12px] font-bold text-[#B49155] uppercase tracking-wider">
                Celebration Keepsakes
              </span>
              <h2 id="gifts-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#292421] leading-tight mt-0.5">
                Curated Ceremonial Gift Sets
              </h2>
            </div>
            <Link
              to="/shop?category=gift-sets"
              className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] hover:underline flex items-center gap-1.5 transition-colors"
            >
              <span>View All Gift Sets</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {(giftSets.length > 0 ? giftSets : products.slice(16, 20)).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

        </div>
      </section>

      {/* 9. Section 6: Recently Viewed (If history exists) */}
      {recentlyViewed.length > 0 && (
        <section aria-labelledby="recent-title" className="py-8 sm:py-10 border-b border-[#E7DFD5]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-4 h-4 text-[#B49155]" />
              <h2 id="recent-title" className="font-sans text-[15px] font-bold text-[#292421] uppercase tracking-wider">
                Recently Viewed
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
              {recentlyViewed.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. Short Process Strip (Choose items → Submit request → Our team confirms) */}
      <section aria-label="How SWAYARI ordering works" className="py-8 sm:py-10 bg-[#FAF7F2]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[11px] font-bold text-[#B49155] uppercase tracking-widest">
              Bespoke Order Assistance
            </span>
            <h2 className="font-display text-[1.375rem] sm:text-[1.625rem] font-bold text-[#292421] mt-0.5">
              How Our Order Request Model Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 rounded-xl bg-white border border-[#E7DFD5] shadow-xs flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#B49155]/40 text-[#571C2A] flex items-center justify-center font-bold text-[14px] mb-3">
                1
              </div>
              <h3 className="font-semibold text-[14px] text-[#292421]">Select Your Pieces</h3>
              <p className="text-[12px] text-[#544A44] mt-1.5 leading-relaxed">
                Browse our curated catalogue and add items to your request bag with customisation notes.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#E7DFD5] shadow-xs flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#B49155]/40 text-[#571C2A] flex items-center justify-center font-bold text-[14px] mb-3">
                2
              </div>
              <h3 className="font-semibold text-[14px] text-[#292421]">Submit Order Request</h3>
              <p className="text-[12px] text-[#544A44] mt-1.5 leading-relaxed">
                Provide contact and destination details with zero online payment or credit card capture.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#E7DFD5] shadow-xs flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#B49155]/40 text-[#571C2A] flex items-center justify-center font-bold text-[14px] mb-3">
                3
              </div>
              <h3 className="font-semibold text-[14px] text-[#292421]">Personal Consultation</h3>
              <p className="text-[12px] text-[#544A44] mt-1.5 leading-relaxed">
                Our team phones you to confirm piece dimensions, packaging, insured transit, and final pricing.
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/ordering-policy"
              className="text-[12px] font-semibold text-[#571C2A] hover:underline"
            >
              Read Full Ordering &amp; Customisation Policy &rarr;
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
