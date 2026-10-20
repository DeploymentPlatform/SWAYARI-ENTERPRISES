import React from 'react';
import { Product } from '@swayari/shared';
import { ProductCard } from './ProductCard';
import { Link } from '../lib/router';
import { Heart, Users, Sparkles, Truck, ArrowRight, MessageSquareQuote, CheckCircle2 } from 'lucide-react';

interface BulkReturnGiftsSectionProps {
  products: Product[];
}

export const BulkReturnGiftsSection: React.FC<BulkReturnGiftsSectionProps> = ({ products }) => {
  // Real devotional frames for wedding return gifts (strictly <= 99)
  const displayItems = products
    .filter(p => p.indicativePrice !== null && p.indicativePrice <= 99)
    .slice(0, 4);

  return (
    <section aria-labelledby="wedding-return-title" className="py-10 sm:py-14 border-b border-[#E6DDD5] bg-[#FAF7F2]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner with Wedding Return Gifting Proposition */}
        <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#5C1D24] via-[#4A161D] to-[#2B1017] text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C49A45]/20 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C49A45]/20 border border-[#C49A45]/40 text-[#E8D29E] text-[11px] font-bold uppercase tracking-wider mb-2.5">
              <Heart className="w-3.5 h-3.5 text-[#C49A45]" />
              <span>Wedding &amp; Celebration Return Gifts</span>
            </div>

            <h2 id="wedding-return-title" className="font-display text-[1.65rem] sm:text-[2.1rem] font-bold leading-tight">
              Thoughtful Return Gifts for Your Cherished Guests
            </h2>

            <p className="mt-2 text-[13.5px] sm:text-[14.5px] text-[#FDFBF7]/90 leading-relaxed">
              Planning a wedding, griha pravesh, or family celebration? Choose auspicious devotional frames priced at ₹99 or less per frame. Mix designs or pick one sacred deity, specify your quantity, and let our team handle personal confirmation and safe dispatch.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/shop?bulk=1"
                className="px-5 py-2.5 rounded-full bg-[#C49A45] hover:bg-[#b08736] text-[#2B2625] text-[13px] font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Plan Your Return Gifts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              
              <Link
                to="/contact"
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[13px] font-semibold transition-all backdrop-blur-sm flex items-center gap-1.5"
              >
                <MessageSquareQuote className="w-3.5 h-3.5 text-[#E8D29E]" />
                <span>Enquire by Phone</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Pillars of Devotional Return Gifting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white border border-[#E6DDD5] flex items-start gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E6DDD5] flex items-center justify-center text-[#5C1D24] flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#C49A45]" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-[#2B2625]">Auspicious Deity Selection</h4>
              <p className="text-[11.5px] text-[#6B6362] mt-0.5 leading-relaxed">
                Choose Ganesha, Lakshmi, Balaji, Radha Krishna and Hanuman frames. Mix designs freely across your request.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E6DDD5] flex items-start gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E6DDD5] flex items-center justify-center text-[#5C1D24] flex-shrink-0">
              <Sparkles className="w-4 h-4 text-[#C49A45]" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-[#2B2625]">Strict ₹99 Price Ceiling</h4>
              <p className="text-[11.5px] text-[#6B6362] mt-0.5 leading-relaxed">
                Every frame and variant is ₹99 or less. Genuine quantity pricing tiers starting from ₹49 for mass favors.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E6DDD5] flex items-start gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E6DDD5] flex items-center justify-center text-[#5C1D24] flex-shrink-0">
              <Truck className="w-4 h-4 text-[#C49A45]" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-[#2B2625]">Separate Shipping Quote</h4>
              <p className="text-[11.5px] text-[#6B6362] mt-0.5 leading-relaxed">
                Shipping calculated accurately based on order volume and your destination PIN code. No hidden fees.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Return Gifts Grid (4 across desktop, 2 across mobile) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-[1.25rem] font-bold text-[#2B2625]">
              Popular Return Gift Designs
            </h3>
            <Link
              to="/shop?bulk=1"
              className="text-[13px] font-semibold text-[#5C1D24] hover:text-[#4A161D] flex items-center gap-1 group"
            >
              <span>View All Bulk Frames</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
            {displayItems.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
