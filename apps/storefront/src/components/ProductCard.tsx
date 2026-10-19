import React, { useState } from 'react';
import { Eye, ShoppingBag, Check } from 'lucide-react';
import { Product, formatPrice } from '@swayari/shared';
import { Link } from '../lib/router';
import { toCartItem } from '../lib/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  sizes?: string;
}

export const ProductImage: React.FC<{ product: Product; sizes?: string; priority?: boolean; className?: string }> = ({
  product,
  sizes,
  priority,
  className = ''
}) => {
  const primaryImg = product.images && product.images.length > 0
    ? product.images[0]
    : '/assets/demo/sample_product_1.jpeg';

  return (
    <div className={`relative aspect-square w-full bg-[#FAF7F2] overflow-hidden p-3 flex items-center justify-center ${className}`}>
      <img
        src={primaryImg}
        alt={product.name}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
        className="w-full h-full object-contain transition-transform duration-500 ease-luxury group-hover:scale-105"
      />
    </div>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority }) => {
  const { addItem, openDrawer } = useCart();
  const { user, initiateGoogleSignIn } = useAuth();
  
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['/assets/demo/sample_product_1.jpeg'];
  
  const primaryImg = images[0];
  const href = `/product/${product.slug}`;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const item = toCartItem(product, 1);
    if (!user) {
      initiateGoogleSignIn(item, 'add');
      return;
    }

    addItem(item);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openDrawer();
    }, 500);
  }

  function handleOpenQuickView(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  }

  return (
    <>
      <article className="group relative flex flex-col bg-white rounded-xl border border-[#E7DFD5] hover:border-[#B49155]/60 hover:shadow-hover transition-all duration-300 overflow-hidden">
        
        {/* 1. Product Image Container (1:1 Ratio, ~180-220px desktop) */}
        <div className="relative aspect-square w-full bg-[#FAF7F2] overflow-hidden p-3 flex items-center justify-center">
          <Link to={href} className="block w-full h-full" tabIndex={-1}>
            <img
              src={primaryImg}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              className="w-full h-full object-contain transition-transform duration-500 ease-luxury group-hover:scale-105"
            />
          </Link>

          {/* Category / Sample / MOQ Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
            {product.isDemo && (
              <span className="px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#E7DFD5] text-[#8F7138] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                Sample
              </span>
            )}
            {product.isQuoteOnly ? (
              <span className="px-2 py-0.5 rounded-full bg-[#571C2A]/90 text-white text-[9.5px] font-semibold tracking-wider uppercase shadow-xs">
                Bespoke Quote
              </span>
            ) : product.minQuantity > 1 ? (
              <span className="px-2 py-0.5 rounded-full bg-[#C49A45]/20 backdrop-blur-sm border border-[#C49A45]/40 text-[#6B5018] text-[9.5px] font-bold uppercase tracking-wide shadow-xs">
                Min. {product.minQuantity} pcs
              </span>
            ) : product.priceType === 'set' ? (
              <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2]/95 border border-[#E7DFD5] text-[#571C2A] text-[9.5px] font-semibold tracking-wide shadow-xs">
                Gift Set
              </span>
            ) : null}
          </div>

          {/* Quick View Button on Image Hover */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
            <button
              type="button"
              onClick={handleOpenQuickView}
              className="w-full py-2 rounded-lg bg-white/95 hover:bg-white text-[#292421] text-[12px] font-semibold tracking-wide border border-[#E7DFD5] shadow-md flex items-center justify-center gap-1.5 backdrop-blur-sm transition-all hover:text-[#571C2A]"
            >
              <Eye className="w-3.5 h-3.5 text-[#571C2A]" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* 2. Product Info & Metadata */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1">
          
          {/* Category Label */}
          <span className="text-[10.5px] font-semibold text-[#B49155] uppercase tracking-wider truncate mb-1">
            {product.categoryName || 'Bespoke Décor'}
          </span>

          {/* Product Title (2-Line Clamp to keep heights aligned) */}
          <h3 className="font-sans font-semibold text-[13.5px] sm:text-[14px] text-[#292421] group-hover:text-[#571C2A] transition-colors line-clamp-2 leading-snug min-h-[38px]">
            <Link to={href} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          {/* Set contents or material */}
          {product.setContents ? (
            <p className="text-[11px] text-[#571C2A] font-medium truncate mt-1">
              ✨ {product.setContents}
            </p>
          ) : (
            <p className="text-[11px] text-[#7A6E66] truncate mt-1">
              {product.material || product.dimensions || 'Handcrafted solid brass'}
            </p>
          )}

          {/* Price Row */}
          <div className="mt-2.5 pt-2 border-t border-[#F4EFEA] flex flex-col justify-between">
            <div className="flex items-baseline justify-between gap-1.5">
              {product.isQuoteOnly ? (
                <span className="text-[12.5px] sm:text-[13px] font-bold text-[#8F7138]">
                  Price on Consultation
                </span>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-[14px] sm:text-[15.5px] font-bold text-[#571C2A]">
                    {formatPrice(product.indicativePrice)}
                  </span>
                  <span className="text-[11px] text-[#7A6E66] font-normal">
                    {product.priceType === 'set' ? '/ set' : '/ piece'}
                  </span>
                </div>
              )}
              
              {/* Mobile Quick View link */}
              <button
                type="button"
                onClick={handleOpenQuickView}
                className="sm:hidden text-[11px] text-[#571C2A] font-medium underline"
              >
                Details
              </button>
            </div>

            {/* Bulk MOQ condition note */}
            {product.minQuantity > 1 && product.indicativePrice !== null && (
              <div className="text-[10.5px] text-[#8F7138] font-medium mt-0.5">
                Bulk order only · Min. {product.minQuantity} pcs ({formatPrice(product.indicativePrice * product.minQuantity)} min.)
              </div>
            )}
          </div>

          {/* 3. Add to Cart / Request Action */}
          <div className="mt-3 pt-1">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={added}
              className={`w-full py-2 px-3 rounded-lg text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                added
                  ? 'bg-[#027A48] text-white'
                  : 'bg-[#571C2A] hover:bg-[#441420] text-white hover:shadow-sm'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Request</span>
                </>
              )}
            </button>
          </div>

        </div>
      </article>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal
          product={product}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
};
