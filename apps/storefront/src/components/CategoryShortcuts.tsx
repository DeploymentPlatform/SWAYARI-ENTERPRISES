import React from 'react';
import { Link } from '../lib/router';
import { ArrowRight } from 'lucide-react';

const SHORTCUTS = [
  {
    slug: 'devotional-frames',
    name: 'Devotional Frames',
    count: '4 Pieces',
    image: '/assets/categories/cat-devotional-frames.webp',
    href: '/shop?category=devotional-frames'
  },
  {
    slug: 'decorative-lamps',
    name: 'Decorative Lamps',
    count: '4 Pieces',
    image: '/assets/categories/cat-decorative-lamps.webp',
    href: '/shop?category=decorative-lamps'
  },
  {
    slug: 'home-accents',
    name: 'Home Accents',
    count: '4 Pieces',
    image: '/assets/categories/cat-home-accents.webp',
    href: '/shop?category=home-accents'
  },
  {
    slug: 'festive-decor',
    name: 'Festive Décor',
    count: '4 Pieces',
    image: '/assets/categories/cat-festive-decor.webp',
    href: '/shop?category=festive-decor'
  },
  {
    slug: 'gift-sets',
    name: 'Gift Sets',
    count: '4 Pieces',
    image: '/assets/categories/cat-gift-sets.webp',
    href: '/shop?category=gift-sets'
  }
];

export const CategoryShortcuts: React.FC = () => {
  return (
    <section aria-label="Product categories" className="bg-[#FFFFFF] border-b border-[#E7DFD5] py-4 sm:py-6">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header line for categories */}
        <div className="flex items-center justify-between mb-3.5 sm:mb-4">
          <h2 className="text-[13px] sm:text-[14px] font-bold text-[#292421] uppercase tracking-[0.14em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B49155]" />
            <span>Explore Collections</span>
          </h2>
          <Link
            to="/shop"
            className="text-[12px] sm:text-[13px] font-semibold text-[#571C2A] hover:text-[#441420] hover:underline flex items-center gap-1 transition-colors"
          >
            <span>All 20 Pieces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5-Column Category Shortcuts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {SHORTCUTS.map((item) => (
            <Link
              key={item.slug}
              to={item.href}
              className="group flex flex-col items-center p-2.5 sm:p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#E7DFD5]/80 hover:border-[#B49155]/60 transition-all hover:shadow-card text-center"
            >
              {/* Circular/Squircle Thumbnail with Micro-zoom */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white p-1 border border-[#E7DFD5] shadow-sm group-hover:scale-105 transition-transform duration-300">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Title & Count */}
              <h3 className="mt-2 text-[12.5px] sm:text-[13.5px] font-semibold text-[#292421] group-hover:text-[#571C2A] transition-colors leading-snug">
                {item.name}
              </h3>
              <span className="text-[11px] text-[#7A6E66] mt-0.5">
                {item.count}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
