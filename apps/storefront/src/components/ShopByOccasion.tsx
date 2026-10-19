import React from 'react';
import { OCCASIONS } from '@swayari/shared';
import { Link } from '../lib/router';
import { Sparkles, ArrowRight, Calendar } from 'lucide-react';

export const ShopByOccasion: React.FC = () => {
  return (
    <section aria-labelledby="occasions-title" className="py-8 sm:py-12 border-b border-[#E7DFD5] bg-[#FFFFFF]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B49155]/15 border border-[#B49155]/30 text-[#8F7138] text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Calendar className="w-3 h-3 text-[#B49155]" />
              <span>Celebration Moments</span>
            </div>
            <h2 id="occasions-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#292421] leading-tight">
              Shop by Occasion
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#7A6E66] mt-1">
              Curated gift combinations and return favors tailored for every tradition and sacred celebration.
            </p>
          </div>

          <Link
            to="/shop"
            className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] flex items-center gap-1.5 group transition-colors self-start sm:self-end"
          >
            <span>Explore All Occasions</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Occasion Cards: Horizontal scrollable on mobile, 5 grid columns on desktop */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {OCCASIONS.map((occ) => (
            <Link
              key={occ.id}
              to={`/shop?occasion=${encodeURIComponent(occ.name)}`}
              className="flex-shrink-0 w-[240px] sm:w-auto group rounded-xl p-4 sm:p-5 bg-[#FAF7F2] border border-[#E7DFD5] hover:border-[#571C2A] hover:bg-white hover:shadow-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#B49155]/20 text-[#6B5018] text-[10px] font-bold uppercase tracking-wide">
                    {occ.badge}
                  </span>
                  <Sparkles className="w-3 h-3 text-[#B49155] opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </div>

                <h3 className="font-display text-[1.1rem] sm:text-[1.15rem] font-bold text-[#292421] group-hover:text-[#571C2A] leading-snug transition-colors">
                  {occ.name}
                </h3>

                <p className="mt-2 text-[11.5px] text-[#7A6E66] line-clamp-2 leading-relaxed">
                  {occ.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#E7DFD5]/60 flex items-center justify-between text-[11.5px] font-semibold text-[#571C2A]">
                <span>Discover Gifts</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
