import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShoppingBag, ShieldCheck, Truck, Sparkles, ChevronRight, Phone } from 'lucide-react';
import { Product, formatPrice } from '@swayari/shared';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toCartItem } from '../lib/products';
import { Link } from '../lib/router';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addItem, openDrawer } = useCart();
  const { user, initiateGoogleSignIn } = useAuth();
  
  const minQty = product.minQuantity || 1;
  const incQty = product.orderIncrement || 1;
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(minQty);
  const [added, setAdded] = useState(false);
  const [customNote, setCustomNote] = useState('');

  if (!product) return null;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/assets/demo/sample_product_1.jpeg'];

  function handleAdd() {
    const item = toCartItem(product, quantity, { customisationNote: customNote || undefined });
    if (!user) {
      initiateGoogleSignIn(item, 'add');
      return;
    }

    addItem(item);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
      openDrawer();
    }, 600);
  }

  // Calculate current applicable unit price based on quantity and bulk tiers
  let currentUnitPrice = product.indicativePrice;
  if (product.bulkTiers && product.bulkTiers.length > 0) {
    const sortedTiers = [...product.bulkTiers].sort((a, b) => b.min_qty - a.min_qty);
    for (const tier of sortedTiers) {
      if (quantity >= tier.min_qty) {
        currentUnitPrice = tier.unit_price;
        break;
      }
    }
  }
  const calculatedTotal = currentUnitPrice !== null ? currentUnitPrice * quantity : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-modal overflow-hidden border border-[#E7DFD5] z-10 max-h-[90vh] flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-[#F4EFEA] text-[#292421] border border-[#E7DFD5] flex items-center justify-center transition-colors"
          aria-label="Close quick view"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Image Gallery */}
        <div className="md:w-1/2 p-6 bg-[#FAF7F2] border-b md:border-b-0 md:border-r border-[#E7DFD5] flex flex-col justify-between">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#E7DFD5] shadow-sm">
            <img
              src={images[selectedImgIdx]}
              alt={product.name}
              className="w-full h-full object-contain p-2"
            />
            {product.isDemo && (
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#B49155]/20 text-[#8F7138] text-[10px] font-bold uppercase tracking-wider border border-[#B49155]/40">
                Sample Piece
              </span>
            )}
            {product.minQuantity > 1 && (
              <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#C49A45]/20 text-[#6B5018] text-[10px] font-bold uppercase tracking-wide border border-[#C49A45]/40">
                Min. {product.minQuantity} pcs
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImgIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${
                    selectedImgIdx === idx ? 'border-[#571C2A] shadow-sm' : 'border-[#E7DFD5] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Order Request Actions */}
        <div className="md:w-1/2 p-6 flex flex-col overflow-y-auto">
          {/* Category & Title */}
          <div>
            <span className="text-[11px] font-bold text-[#B49155] uppercase tracking-wider">
              {product.categoryName || 'Bespoke Décor'}
            </span>
            <h2 className="text-[1.25rem] sm:text-[1.375rem] font-bold text-[#292421] leading-snug mt-1">
              {product.name}
            </h2>
            <p className="text-[11px] text-[#7A6E66] mt-0.5">SKU: {product.sku}</p>
          </div>

          {/* Indicative Price */}
          <div className="mt-3 pb-3 border-b border-[#F4EFEA]">
            {product.isQuoteOnly ? (
              <div>
                <span className="text-[1.25rem] font-bold text-[#8F7138]">
                  Price on Consultation
                </span>
                <p className="text-[11px] text-[#544A44] mt-1 leading-relaxed">
                  Bespoke commission crafted to your exact specifications. Final price confirmed upon specification review.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[1.375rem] font-bold text-[#571C2A]">
                    {formatPrice(currentUnitPrice)}
                  </span>
                  <span className="text-[12px] text-[#7A6E66]">
                    {product.priceType === 'set' ? '/ set' : '/ piece'}
                  </span>
                  {product.isDemo && (
                    <span className="text-[11px] text-[#7A6E66] font-medium">
                      (Sample)
                    </span>
                  )}
                </div>

                {calculatedTotal !== null && quantity > 1 && (
                  <p className="text-[12px] font-semibold text-[#571C2A] mt-1">
                    Indicative Subtotal: {formatPrice(calculatedTotal)} ({quantity} {product.priceType === 'set' ? 'sets' : 'pieces'})
                  </p>
                )}

                <p className="text-[11px] text-[#544A44] mt-1 leading-relaxed">
                  Final pricing and insured shipping confirmed personally by phone consultation.
                </p>
              </div>
            )}
          </div>

          {/* Bulk Tiers if present */}
          {product.bulkTiers && product.bulkTiers.length > 0 && (
            <div className="mt-3 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E7DFD5]/80">
              <span className="text-[10.5px] font-bold text-[#8F7138] uppercase tracking-wider block mb-1">
                Volume Pricing Tiers:
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {product.bulkTiers.map((tier) => (
                  <div
                    key={tier.min_qty}
                    className={`p-1.5 rounded-lg border text-[11px] ${
                      quantity >= tier.min_qty
                        ? 'bg-[#571C2A] text-white border-[#571C2A]'
                        : 'bg-white text-[#292421] border-[#E7DFD5]'
                    }`}
                  >
                    <div className="font-bold">{formatPrice(tier.unit_price)}</div>
                    <div className="text-[9.5px] opacity-80">{tier.min_qty}+ pcs</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications Table */}
          <div className="mt-3 text-[12px] space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#E7DFD5]/80">
            {product.setContents && (
              <div className="flex justify-between">
                <span className="text-[#7A6E66]">Set Contents:</span>
                <span className="font-semibold text-[#571C2A]">{product.setContents}</span>
              </div>
            )}
            {product.material && (
              <div className="flex justify-between">
                <span className="text-[#7A6E66]">Material:</span>
                <span className="font-semibold text-[#292421]">{product.material}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between">
                <span className="text-[#7A6E66]">Dimensions:</span>
                <span className="font-semibold text-[#292421]">{product.dimensions}</span>
              </div>
            )}
            {product.shippingInfo && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#544A44] pt-1 border-t border-[#E7DFD5]/60">
                <Truck className="w-3.5 h-3.5 text-[#B49155] flex-shrink-0" />
                <span>{product.shippingInfo}</span>
              </div>
            )}
          </div>

          {/* Quantity Selector & Add to Request */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="qv-qty" className="text-[12px] font-semibold text-[#292421]">
                Quantity {product.minQuantity > 1 ? `(Min. ${product.minQuantity}, Step ${incQty}):` : ':'}
              </label>
              <div className="flex items-center border border-[#E7DFD5] rounded-lg bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(minQty, quantity - incQty))}
                  disabled={quantity <= minQty}
                  className="px-3 py-1 text-[#292421] hover:bg-[#FAF7F2] disabled:opacity-30 transition-colors"
                >
                  -
                </button>
                <span id="qv-qty" className="px-3 py-1 text-[13px] font-bold text-[#292421] min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + incQty)}
                  className="px-3 py-1 text-[#292421] hover:bg-[#FAF7F2] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={added}
              className={`w-full py-3 rounded-xl font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-all shadow-md ${
                added 
                  ? 'bg-[#027A48] text-white' 
                  : 'bg-[#571C2A] hover:bg-[#441420] text-white hover:shadow-lg'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Request Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Order Request</span>
                </>
              )}
            </button>

            <Link
              to={`/product/${product.slug}`}
              onClick={onClose}
              className="block text-center text-[12px] text-[#571C2A] font-semibold hover:underline"
            >
              View Full Product Specifications &rarr;
            </Link>
          </div>

          {/* Assurance Trust Badges */}
          <div className="mt-auto pt-4 border-t border-[#F4EFEA] grid grid-cols-2 gap-2 text-[11px] text-[#7A6E66]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#B49155]" />
              <span>Authentic Craftsmanship</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#B49155]" />
              <span>Insured Transit</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
