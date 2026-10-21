import React from 'react';
import { BUDGET_BANDS, BudgetBandDefinition } from '@swayari/shared';
import { Link } from '../lib/router';
import { Sparkles, ArrowRight, Tag } from 'lucide-react';

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
                Devotional Frames ≤ ₹99
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#7A6E66] mt-1">
                Explore auspicious deity frames strictly under ₹99 with transparent unit pricing and bulk volume tiers.
              </p>
            </div>
            
            <Link
              to="/shop"
              className="text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] flex items-center gap-1.5 group transition-colors self-start sm:self-end"
            >
              <span>View All Frames ≤ ₹99</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}

        {/* 4 Prominent Budget Cards (4 across on desktop, 2 across on mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {BUDGET_BANDS.map((band: BudgetBandDefinition, idx: number) => {
            const isSelected = selectedBudget === band.id;
            const isEntryLevel = band.id === 'under-99';

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
                {/* Entry-level / Best Proposition Tag */}
                {isEntryLevel && !isSelected && (
                  <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-[#571C2A] text-white text-[9.5px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#E8D29E]" />
                    <span>Starter Favors</span>
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
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        isSelected ? 'bg-white/10 text-white/90' : 'bg-[#FAF7F2] text-[#7A6E66]'
                      }`}
                    >
                      Tier {idx + 1}
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
                      isSelected ? 'text-white/80' : 'text-[#7A6E66]'
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
                      <span>{isSelected ? 'Filtered' : 'Browse Band'}</span>
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
                      <span>Explore Collection</span>
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
