import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Phone, MessageSquareQuote, ShieldCheck, Mail } from 'lucide-react';
import { Hero } from '../components/Hero';
import { InfoStrip } from '../components/InfoStrip';
import { BulkReturnGiftsSection } from '../components/BulkReturnGiftsSection';
import { OrderProcessExplanation } from '../components/OrderProcessExplanation';
import { ProductCard } from '../components/ProductCard';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { useProducts } from '../lib/products';
import { Product, BRAND_TAGLINES } from '@swayari/shared';

export const HomePage: React.FC = () => {
  usePageMeta(
    BRAND_TAGLINES.headline,
    `${BRAND_TAGLINES.supporting} Devotional god frames in gold and teak finishes for wedding return gifts, griha pravesh and auspicious celebrations. Shipping quoted separately.`
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
          .filter((p): p is Product => Boolean(p) && (p.indicativePrice === null || p.indicativePrice <= 99))
          .slice(0, 4);
        setRecentlyViewed(matches);
      }
    } catch {
      // Ignore local storage parse error
    }
  }, [products]);

  // Devotional god frames strictly <= ₹99
  const eligibleFrames = products.filter(
    (p) => p.indicativePrice !== null && p.indicativePrice <= 99
  );

  // Early Frame Collection: First 8 frames
  const featuredFrames = eligibleFrames.slice(0, 8);

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      
      {/* 1. Compact Campaign Carousel (~300–340px desktop, ~220px mobile) */}
      <Hero />

      {/* 2. Short Information Strip */}
      <InfoStrip />

      {/* 3. Devotional Frame Collection: Displayed early on page */}
      <section aria-labelledby="frames-collection-title" className="py-8 sm:py-12 border-b border-[#E6DDD5] bg-[#FAF7F2]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C49A45]/15 border border-[#C49A45]/30 text-[#8F7138] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 text-[#C49A45]" />
                <span>Devotional Collection</span>
              </div>
              <h2 id="frames-collection-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#2B2625] leading-tight">
                Devotional Frames ₹99 &amp; Under
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#6B6362] mt-0.5">
                Auspicious God frames in gold-relief &amp; teak finishes. Choose designs &amp; quantities for your celebrations.
              </p>
            </div>
            
            <Link
              to="/shop"
              className="text-[13px] font-semibold text-[#5C1D24] hover:text-[#4A161D] flex items-center gap-1.5 group transition-colors"
            >
              <span>Explore All Frames (≤ ₹99)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 4 Cards Across on Desktop, 2 on Mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
            {(featuredFrames.length > 0 ? featuredFrames : products.slice(0, 4)).map((prod, idx) => (
              <ProductCard key={prod.id} product={prod} priority={idx < 2} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-[#5C1D24] text-white text-[13px] font-semibold shadow-xs"
            >
              <span>View All Devotional Frames</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 4. Wedding Return-Gifting Section with "Plan Your Return Gifts" Action */}
      <BulkReturnGiftsSection products={eligibleFrames} />

      {/* 5. How Ordering Works: 1. Choose frames 2. Submit request 3. Team confirms details */}
      <OrderProcessExplanation />

      {/* 6. Compact Contact & Bulk Enquiry Section */}
      <section aria-labelledby="contact-strip-title" className="py-8 sm:py-10 bg-[#FFFFFF] border-b border-[#E6DDD5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl p-6 sm:p-8 bg-[#FAF7F2] border border-[#E6DDD5] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <span className="text-[11px] font-bold text-[#C49A45] uppercase tracking-wider block mb-1">
                Personal Coordination
              </span>
              <h3 id="contact-strip-title" className="font-display text-[1.35rem] sm:text-[1.6rem] font-bold text-[#2B2625]">
                Need assistance with bulk quantities or custom event dates?
              </h3>
              <p className="text-[13px] text-[#6B6362] mt-1.5 leading-relaxed">
                Our team is happy to guide you on deity selections, mixed design arrangements, safe packaging and courier timings.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="px-5 py-2.5 rounded-full bg-[#5C1D24] hover:bg-[#4A161D] text-white text-[13px] font-semibold transition-all shadow-xs flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#E8D29E]" />
                <span>Contact Our Team</span>
              </Link>
              <Link
                to="/shop?bulk=1"
                className="px-5 py-2.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E6DDD5] text-[#2B2625] text-[13px] font-semibold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Request a Bulk Quote</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Recently Viewed (if any) */}
      {recentlyViewed.length > 0 && (
        <section aria-labelledby="recent-title" className="py-8 sm:py-10 bg-[#FAF7F2]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            <h3 id="recent-title" className="text-[13px] font-bold uppercase tracking-wider text-[#6B6362] mb-4">
              Recently Viewed Frames
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
