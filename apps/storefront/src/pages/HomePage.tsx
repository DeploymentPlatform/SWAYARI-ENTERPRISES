import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Gift } from 'lucide-react';
import { Hero } from '../components/Hero';
import { ShopByBudget } from '../components/ShopByBudget';
import { BulkReturnGiftsSection } from '../components/BulkReturnGiftsSection';
import { ShopByOccasion } from '../components/ShopByOccasion';
import { OrderProcessExplanation } from '../components/OrderProcessExplanation';
import { ProductCard } from '../components/ProductCard';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { useProducts } from '../lib/products';
import { Product } from '@swayari/shared';

export const HomePage: React.FC = () => {
  usePageMeta(
    'Thoughtful gifts. Beautifully priced.',
    'Discover gifts for celebrations, return gifting and everyday moments. Gifts ₹999 & under, dedicated ₹99 & under return favors, and heirloom artisanal décor.'
  );

  const { products } = useProducts();
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

  // Budget-specific collections with visible confirmed prices (strictly no quote-only items in budget bands)
  const under99Items = products
    .filter((p) => !p.isQuoteOnly && p.indicativePrice !== null && p.indicativePrice <= 99)
    .slice(0, 4);

  const midRangeItems = products
    .filter((p) => !p.isQuoteOnly && p.indicativePrice !== null && p.indicativePrice >= 100 && p.indicativePrice <= 499)
    .slice(0, 4);

  const festiveItems = products
    .filter((p) => !p.isQuoteOnly && p.indicativePrice !== null && p.indicativePrice >= 500 && p.indicativePrice <= 999)
    .slice(0, 4);

  // Preserve existing high-value heirloom inventory
  const heirloomFrames = products
    .filter((p) => p.indicativePrice !== null && p.indicativePrice >= 1000)
    .slice(0, 4);

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      
      {/* 1. Compact Campaign Carousel (~300–340px desktop, ~220px mobile) */}
      <Hero />

      {/* 2. Shop by Budget Shortcuts */}
      <section className="py-8 sm:py-10 border-b border-[#E7DFD5] bg-[#FFFFFF]">
        <ShopByBudget />
      </section>

      {/* 3. Selected Gift Collections with Visible Prices */}

      {/* Collection A: Dedicated Entry-Level "₹99 & under" */}
      <section aria-labelledby="under-99-title" className="py-8 sm:py-12 border-b border-[#E7DFD5] bg-[#FAF7F2]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B49155]/15 border border-[#B49155]/30 text-[#8F7138] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 text-[#B49155]" />
                <span>Dedicated Entry Collection</span>
              </div>
              <h2 id="under-99-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#292421] leading-tight">
                Gifts ₹99 &amp; Under
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#7A6E66] mt-0.5">
                Brocade potli bags, solid brass kumkum boxes, and fragrant dhoop burners from ₹49.
              </p>
            </div>
            
            <Link
              to="/shop?budget=under-99"
              className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] flex items-center gap-1.5 group transition-colors"
            >
              <span>Explore All ₹99 &amp; Under</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 4 Cards Across on Desktop, 2 on Mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
            {(under99Items.length > 0 ? under99Items : products.slice(0, 4)).map((prod, idx) => (
              <ProductCard key={prod.id} product={prod} priority={idx < 2} />
            ))}
          </div>

        </div>
      </section>

      {/* Collection B: Popular Gifts ₹100–₹499 */}
      <section aria-labelledby="mid-gifts-title" className="py-8 sm:py-12 border-b border-[#E7DFD5] bg-[#FFFFFF]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B49155]/15 border border-[#B49155]/30 text-[#8F7138] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <Gift className="w-3 h-3 text-[#B49155]" />
                <span>Celebration Favorites</span>
              </div>
              <h2 id="mid-gifts-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#292421] leading-tight">
                Curated Gifts: ₹100–₹499
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#7A6E66] mt-0.5">
                Classic brass akhand diyas, meenakari peacock boxes, and silver-plated bowls.
              </p>
            </div>
            
            <Link
              to="/shop?budget=100-299"
              className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] flex items-center gap-1.5 group transition-colors"
            >
              <span>Browse ₹100–₹499</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
            {(midRangeItems.length > 0 ? midRangeItems : products.slice(4, 8)).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

        </div>
      </section>

      {/* 4. Bulk & Return Gifts Concierge Section */}
      <BulkReturnGiftsSection products={products} />

      {/* Collection C: Festive Gifts ₹500–₹999 */}
      <section aria-labelledby="festive-title" className="py-8 sm:py-12 border-b border-[#E7DFD5] bg-[#FFFFFF]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B49155]/15 border border-[#B49155]/30 text-[#8F7138] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 text-[#B49155]" />
                <span>Festive Elegance</span>
              </div>
              <h2 id="festive-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#292421] leading-tight">
                Festive Centerpieces: ₹500–₹999
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#7A6E66] mt-0.5">
                Hand-hammered brass urulis with floating diyas, Lakshmi-Ganesh pairs &amp; luxury gift sets.
              </p>
            </div>
            
            <Link
              to="/shop?budget=500-999"
              className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] flex items-center gap-1.5 group transition-colors"
            >
              <span>Explore ₹500–₹999</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
            {(festiveItems.length > 0 ? festiveItems : products.slice(8, 12)).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

        </div>
      </section>

      {/* 5. Shop by Occasion */}
      <ShopByOccasion />

      {/* Preserved Heirloom Section: For Sanctum Frames & High-Value Heritage */}
      {heirloomFrames.length > 0 && (
        <section aria-labelledby="heirloom-title" className="py-8 sm:py-12 border-b border-[#E7DFD5] bg-[#FAF7F2]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
              <div>
                <span className="text-[11px] font-bold text-[#B49155] uppercase tracking-wider">
                  Heirloom Sanctum &amp; Temple Relinquary
                </span>
                <h2 id="heirloom-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#292421] leading-tight">
                  Heirloom Devotional Frames
                </h2>
                <p className="text-[13px] text-[#7A6E66] mt-0.5">
                  Large hand-embossed gold and silver foil frames for prayer rooms and prestigious dedications.
                </p>
              </div>
              <Link
                to="/shop?category=devotional-frames"
                className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] flex items-center gap-1.5 group transition-colors"
              >
                <span>View Heirloom Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
              {heirloomFrames.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Simple Explanation of the Order-Request Process */}
      <OrderProcessExplanation />

      {/* Recently Viewed (if any) */}
      {recentlyViewed.length > 0 && (
        <section aria-labelledby="recent-title" className="py-8 sm:py-10 bg-[#FAF7F2]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            <h3 id="recent-title" className="text-[14px] font-bold uppercase tracking-wider text-[#7A6E66] mb-4">
              Recently Viewed Pieces
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5">
              {recentlyViewed.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
