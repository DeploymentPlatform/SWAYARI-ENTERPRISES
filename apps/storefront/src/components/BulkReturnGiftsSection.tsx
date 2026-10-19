import React from 'react';
import { Product } from '@swayari/shared';
import { ProductCard } from './ProductCard';
import { Link } from '../lib/router';
import { Gift, Users, Award, ShieldCheck, ArrowRight, MessageSquareQuote } from 'lucide-react';

interface BulkReturnGiftsSectionProps {
  products: Product[];
}

export const BulkReturnGiftsSection: React.FC<BulkReturnGiftsSectionProps> = ({ products }) => {
  // Filter products that explicitly support bulk return gifts
  const bulkItems = products.filter(p => p.supportsBulk || (p.minQuantity && p.minQuantity > 1) || (p.bulkTiers && p.bulkTiers.length > 0)).slice(0, 4);
  const displayItems = bulkItems.length > 0 ? bulkItems : products.slice(0, 4);

  return (
    <section aria-labelledby="bulk-gifting-title" className="py-10 sm:py-14 border-b border-[#E7DFD5] bg-[#FAF7F2]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner with proposition */}
        <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#571C2A] via-[#441420] to-[#2B1017] text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C49A45]/20 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B49155]/20 border border-[#B49155]/40 text-[#E8D29E] text-[11px] font-bold uppercase tracking-wider mb-2.5">
              <Users className="w-3.5 h-3.5 text-[#C49A45]" />
              <span>Bulk &amp; Return Gifting Concierge</span>
            </div>

            <h2 id="bulk-gifting-title" className="font-display text-[1.65rem] sm:text-[2.1rem] font-bold leading-tight">
              Thoughtful Favors for Your Cherished Guests
            </h2>

            <p className="mt-2 text-[13.5px] sm:text-[14.5px] text-[#F7F4EF]/90 leading-relaxed">
              Planning a wedding, griha pravesh, or family celebration? Enjoy tiered volume pricing, custom packaging options, and direct coordination with our team.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/shop?bulk=1"
                className="px-5 py-2.5 rounded-full bg-[#C49A45] hover:bg-[#b08736] text-[#24170E] text-[13px] font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Browse Bulk Return Gifts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              
              <Link
                to="/contact"
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[13px] font-semibold transition-all backdrop-blur-sm flex items-center gap-1.5"
              >
                <MessageSquareQuote className="w-3.5 h-3.5 text-[#E8D29E]" />
                <span>Request Custom Bulk Quotation</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Pillars of SWAYARI Bulk Gifting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white border border-[#E7DFD5] flex items-start gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E7DFD5] flex items-center justify-center text-[#571C2A] flex-shrink-0">
              <Award className="w-4 h-4 text-[#B49155]" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-[#292421]">Transparent Volume Pricing</h4>
              <p className="text-[11.5px] text-[#7A6E66] mt-0.5 leading-relaxed">
                Automatic tiered discounts for 10+, 25+, 50+ and 100+ units. No hidden markups.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E7DFD5] flex items-start gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E7DFD5] flex items-center justify-center text-[#571C2A] flex-shrink-0">
              <Gift className="w-4 h-4 text-[#B49155]" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-[#292421]">Packaging &amp; Personalisation</h4>
              <p className="text-[11.5px] text-[#7A6E66] mt-0.5 leading-relaxed">
                Organza pouches, raw silk potlis, velvet cases and custom blessing tags available.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E7DFD5] flex items-start gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E7DFD5] flex items-center justify-center text-[#571C2A] flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#B49155]" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-[#292421]">Safe, Insured Delivery</h4>
              <p className="text-[11.5px] text-[#7A6E66] mt-0.5 leading-relaxed">
                Crush-proof event delivery scheduled to arrive safely before your auspicious date.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Bulk Products Grid (4 across desktop, 2 across mobile) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-[1.25rem] font-bold text-[#292421]">
              Popular Return Gift Pieces
            </h3>
            <Link
              to="/shop?bulk=1"
              className="text-[12.5px] font-semibold text-[#571C2A] hover:underline flex items-center gap-1"
            >
              <span>See All Favors</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
