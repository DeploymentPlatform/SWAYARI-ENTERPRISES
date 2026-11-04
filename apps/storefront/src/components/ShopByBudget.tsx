import React from 'react';
import { BRAND_TAGLINES, FRAME_PRICE_BANDS, FramePriceBandDefinition } from '@swayari/shared';
import { Link } from '../lib/router';
import { Sparkles, ArrowRight, Tag } from 'lucide-react';

/** The three price bands, then the whole collection (the API also accepts budget=under-2999). */
const WHOLE_COLLECTION: FramePriceBandDefinition = {
  id: 'under-2999',
  label: 'Everything under ₹2,999',
  shortLabel: 'All gifts',
  minPrice: 0,
  maxPrice: 2999,
  description: 'The full SWAYARI collection, from ₹89 god stands to grand pooja-room frames'
};
const BUDGET_CARDS = [...FRAME_PRICE_BANDS, WHOLE_COLLECTION];

interface ShopByBudgetProps {
  selectedBudget?: string;
  onSelectBudget?: (budgetId: string) => void;
  className?: string;
  isCompact?: boolean;
}

export const ShopByBudget: React.FC<ShopByBudgetProps> = ({
  selectedBudget,
  onSelectBudget,
  className = '',
  isCompact = false
}) => {
  return (
    <section aria-labelledby="budget-navigation-title" className={`w-full ${className}`}>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        {!isCompact && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6 gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B49155]/15 border border-[#B49155]/30 text-[#8F7138] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <Tag className="w-3 h-3 text-[#B49155]" />
                <span>Shop by Budget</span>
              </div>
              <h2 id="budget-navigation-title" className="font-display text-[1.5rem] sm:text-[1.875rem] font-bold text-[#292421] leading-tight">
                Gifting under ₹2,999
              </h2>
              <p className="text-[13px] sm:text-[14px] text-ink-soft mt-1 max-w-2xl">
                Every design on SWAYARI is under ₹2,999: return gifts from ₹39, god frames for every home and grand
                pieces for the pooja room. {BRAND_TAGLINES.priceNote}
              </p>
            </div>
            
            <Link
              to="/shop?budget=under-2999"
              className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] flex items-center gap-1.5 group transition-colors self-start sm:self-end"
            >
              <span>Shop gifts under ₹2,999</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}

        {/* 4 Prominent Budget Cards (4 across on desktop, 2 across on mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {BUDGET_CARDS.map((band: FramePriceBandDefinition, idx: number) => {
            const isSelected = selectedBudget === band.id;
            const isEntryLevel = band.id === 'under-299';
            const isWhole = band.id === WHOLE_COLLECTION.id;
            const tag = isEntryLevel ? 'Return gifts' : isWhole ? 'Full collection' : null;

            return (
              <div
                key={band.id}
                className={`relative group rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 border ${
                  isSelected
                    ? 'bg-[#571C2A] text-white border-[#571C2A] shadow-md ring-2 ring-[#B49155]'
                    : isEntryLevel
                    ? 'bg-gradient-to-br from-[#FFF9EE] to-[#FAF7F2] border-[#C49A45]/50 hover:border-[#571C2A] hover:shadow-hover text-[#292421]'
                    : 'bg-white border-[#E7DFD5] hover:border-[#B49155] hover:shadow-hover text-[#292421]'
                }`}
              >
                {/* Return-gift and premium tags */}
                {tag && !isSelected && (
                  <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-[#571C2A] text-white text-[10.5px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#E8D29E]" />
                    <span>{tag}</span>
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-[#E8D29E]' : 'text-[#8F7138]'
                      }`}
                    >
                      {band.shortLabel}
                    </span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                        isSelected ? 'bg-white/10 text-white/90' : 'bg-[#FAF7F2] text-ink-soft'
                      }`}
                    >
                      {isWhole ? 'All designs' : `Band ${idx + 1}`}
                    </span>
                  </div>

                  <h3
                    className={`font-display text-[1.35rem] sm:text-[1.5rem] font-bold leading-tight ${
                      isSelected ? 'text-white' : 'text-[#571C2A]'
                    }`}
                  >
                    {band.label}
                  </h3>

                  <p
                    className={`mt-2 text-[11.5px] sm:text-[12px] line-clamp-2 leading-relaxed ${
                      isSelected ? 'text-white/90' : 'text-ink-soft'
                    }`}
                  >
                    {band.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10">
                  {onSelectBudget ? (
                    <button
                      type="button"
                      onClick={() => onSelectBudget(band.id)}
                      className={`w-full py-2 px-3 rounded-lg text-[12px] font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-white text-[#571C2A] hover:bg-[#FAF7F2]'
                          : 'bg-[#FAF7F2] text-[#292421] group-hover:bg-[#571C2A] group-hover:text-white'
                      }`}
                    >
                      <span>{isSelected ? 'Showing' : 'Browse'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      to={`/shop?budget=${band.id}`}
                      className={`w-full py-2 px-3 rounded-lg text-[12px] font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-white text-[#571C2A] hover:bg-[#FAF7F2]'
                          : 'bg-[#FAF7F2] text-[#292421] group-hover:bg-[#571C2A] group-hover:text-white'
                      }`}
                    >
                      <span>{isWhole ? 'Shop all' : 'Explore'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
