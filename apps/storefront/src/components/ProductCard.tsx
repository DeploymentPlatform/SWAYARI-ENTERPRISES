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
    : '/assets/products/venkateswara-frame-960.webp';

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
    : ['/assets/products/venkateswara-frame-960.webp'];
  
  const primaryImg = images[0];
  const href = `/product/${product.slug}`;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const minQ = product.minQuantity || 1;
    const item = toCartItem(product, minQ);
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
      <article className="group relative flex flex-col bg-white rounded-xl border border-[#E6DDD5] hover:border-[#C49A45]/60 hover:shadow-md transition-all duration-300 overflow-hidden">
        
        {/* 1. Consistent Product Image Container (1:1 Ratio) */}
        <div className="relative aspect-square w-full bg-[#FAF7F2] overflow-hidden p-3 flex items-center justify-center">
          <Link to={href} className="block w-full h-full" tabIndex={-1}>
            <img
              src={primaryImg}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              className="w-full h-full object-contain transition-transform duration-500 ease-luxury group-hover:scale-105"
            />
          </Link>

          {/* Deity / Dimension Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
            {product.deity && (
              <span className="px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#E6DDD5] text-[#5C1D24] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                {product.deity}
              </span>
            )}
            {product.isDemo && (
              <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2]/95 border border-[#C49A45]/30 text-[#8F7138] text-[9.5px] font-bold uppercase tracking-wider">
                Sample
              </span>
            )}
          </div>

          {/* Quick View Button on Image Hover */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
            <button
              type="button"
              onClick={handleOpenQuickView}
              className="w-full py-2 rounded-lg bg-white/95 hover:bg-white text-[#2B2625] text-[12px] font-semibold tracking-wide border border-[#E6DDD5] shadow-md flex items-center justify-center gap-1.5 backdrop-blur-sm transition-all hover:text-[#5C1D24]"
            >
              <Eye className="w-3.5 h-3.5 text-[#5C1D24]" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* 2. Product Info & Metadata */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
          
          <div>
            {/* Dimensions where known */}
            <div className="flex items-center justify-between text-[11px] text-[#6B6362] mb-1">
              <span>{product.dimensions || product.frameSize || 'Devotional Frame'}</span>
              {product.orientation && (
                <span className="capitalize text-[#8F7138] font-medium">{product.orientation}</span>
              )}
            </div>

            {/* Short Product Name */}
            <h3 className="font-sans font-semibold text-[13.5px] sm:text-[14px] text-[#2B2625] group-hover:text-[#5C1D24] transition-colors line-clamp-2 leading-snug min-h-[38px]">
              <Link to={href} className="hover:underline">
                {product.name}
              </Link>
            </h3>
          </div>

          {/* Price & Shipping Details */}
          <div className="mt-2.5 pt-2 border-t border-[#F4EFEB]">
            <div className="flex items-baseline justify-between gap-1.5">
              <div className="flex items-baseline gap-1">
                <span className="text-[14.5px] sm:text-[16px] font-bold text-[#5C1D24]">
                  {formatPrice(product.indicativePrice)}
                </span>
                <span className="text-[11px] text-[#6B6362] font-normal">
                  per frame
                </span>
              </div>
              
              {/* Mobile Quick View link */}
              <button
                type="button"
                onClick={handleOpenQuickView}
                className="sm:hidden text-[11px] text-[#5C1D24] font-medium underline"
              >
                Details
              </button>
            </div>

            {/* Minimum quantity if applicable */}
            <div className="text-[11px] text-[#8F7138] font-medium mt-1 flex items-center justify-between">
              <span>
                {product.minQuantity > 1 ? `Min. quantity: ${product.minQuantity}` : 'Available in bulk'}
              </span>
              <span className="text-[10px] text-[#6B6362] italic">
                Shipping quoted separately
              </span>
            </div>
          </div>

          {/* 3. Add to Request Action */}
          <div className="mt-3 pt-1">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={added}
              className={`w-full py-2 px-3 rounded-lg text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                added
                  ? 'bg-[#027A48] text-white'
                  : 'bg-[#5C1D24] hover:bg-[#4A161D] text-white hover:shadow-sm'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Request!</span>
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
