import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShoppingBag, ShieldCheck, Truck, Sparkles, Phone, AlertCircle } from 'lucide-react';
import { Product, formatPrice, calculateEffectiveUnitPrice } from '@swayari/shared';
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
  
  if (!product) return null;

  const minQty = product.minQuantity || 1;
  const incQty = product.orderIncrement || 1;
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(minQty);
  const [added, setAdded] = useState(false);
  const [customNote, setCustomNote] = useState('');

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/assets/products/venkateswara-frame-960.webp'];

  // Calculate current applicable unit price based on quantity and bulk tiers
  const currentUnitPrice = calculateEffectiveUnitPrice(product.indicativePrice, product.bulkTiers, quantity);
  const itemsSubtotal = currentUnitPrice !== null ? currentUnitPrice * quantity : null;

  function handleQuantityChange(rawVal: number) {
    const raw = isNaN(rawVal) ? minQty : Math.max(minQty, rawVal);
    const rem = (raw - minQty) % incQty;
    const validVal = rem === 0 ? raw : raw + (incQty - rem);
    setQuantity(validVal);
  }

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
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E6DDD5] z-10 max-h-[92vh] flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-[#FAF7F2] text-[#2B2625] border border-[#E6DDD5] flex items-center justify-center transition-colors"
          aria-label="Close quick view"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Image Gallery */}
        <div className="md:w-1/2 p-6 bg-[#FAF7F2] border-b md:border-b-0 md:border-r border-[#E6DDD5] flex flex-col justify-between">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#E6DDD5] shadow-xs">
            <img
              src={images[selectedImgIdx]}
              alt={product.name}
              className="w-full h-full object-contain p-2"
            />
            {product.deity && (
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 text-[#5C1D24] text-[10.5px] font-bold uppercase tracking-wider border border-[#E6DDD5] shadow-xs">
                {product.deity}
              </span>
            )}
            {product.minQuantity > 1 && (
              <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#FAF7F2]/95 text-[#8F7138] text-[10px] font-bold uppercase tracking-wide border border-[#C49A45]/40 shadow-xs">
                Min. {product.minQuantity} frames
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
                    selectedImgIdx === idx ? 'border-[#5C1D24] shadow-xs' : 'border-[#E6DDD5] opacity-70 hover:opacity-100'
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
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#C49A45] uppercase tracking-wider">
                {product.dimensions || product.frameSize || 'Devotional Frame'}
              </span>
              {product.orientation && (
                <span className="text-[11px] font-medium text-[#8F7138] capitalize">
                  {product.orientation} format
                </span>
              )}
            </div>
            <h2 className="text-[1.25rem] sm:text-[1.35rem] font-bold text-[#2B2625] leading-snug mt-1">
              {product.name}
            </h2>
            <p className="text-[11px] text-[#6B6362] mt-0.5">SKU: {product.sku}</p>
          </div>

          {/* Pricing Row: Strict <= 99 */}
          <div className="mt-3 pb-3 border-b border-[#F4EFEB]">
            <div className="flex items-baseline gap-2">
              <span className="text-[1.4rem] font-bold text-[#5C1D24]">
                {formatPrice(currentUnitPrice)}
              </span>
              <span className="text-[12px] text-[#6B6362]">
                per frame
              </span>
            </div>

            {/* Calculations Breakdown */}
            {itemsSubtotal !== null && (
              <div className="mt-2 p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E6DDD5] space-y-1">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#6B6362]">Unit price × quantity:</span>
                  <span className="font-semibold text-[#2B2625]">
                    {formatPrice(currentUnitPrice)} × {quantity}
                  </span>
                </div>
                <div className="flex justify-between text-[12.5px] pt-1 border-t border-[#E6DDD5]/60">
                  <span className="font-bold text-[#5C1D24]">Items subtotal:</span>
                  <span className="font-bold text-[#5C1D24]">{formatPrice(itemsSubtotal)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#6B6362] pt-0.5">
                  <span>Shipping:</span>
                  <span className="italic font-medium text-[#8F7138]">to be confirmed by our team</span>
                </div>
              </div>
            )}

            <p className="text-[11px] text-[#6B6362] mt-2 leading-relaxed">
              Items subtotal is indicative. Submitting this request does not confirm a purchase or charge payment online.
            </p>
          </div>

          {/* Bulk Tiers if present */}
          {product.bulkTiers && product.bulkTiers.length > 0 && (
            <div className="mt-3 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E6DDD5]/80">
              <span className="text-[10.5px] font-bold text-[#8F7138] uppercase tracking-wider block mb-1">
                Volume Pricing Tiers:
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {product.bulkTiers.map((tier) => (
                  <div
                    key={tier.min_qty}
                    className={`p-1.5 rounded-lg border text-[11px] ${
                      quantity >= tier.min_qty
                        ? 'bg-[#5C1D24] text-white border-[#5C1D24]'
                        : 'bg-white text-[#2B2625] border-[#E6DDD5]'
                    }`}
                  >
                    <div className="font-bold">{formatPrice(tier.unit_price)}</div>
                    <div className="text-[9.5px] opacity-80">{tier.min_qty}+ frames</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications Table */}
          <div className="mt-3 text-[12px] space-y-1.5 bg-[#FAF7F2] p-3 rounded-xl border border-[#E6DDD5]/80">
            {product.dimensions && (
              <div className="flex justify-between">
                <span className="text-[#6B6362]">Dimensions:</span>
                <span className="font-semibold text-[#2B2625]">{product.dimensions}</span>
              </div>
            )}
            {product.borderFinish && (
              <div className="flex justify-between">
                <span className="text-[#6B6362]">Border Finish:</span>
                <span className="font-semibold text-[#2B2625]">{product.borderFinish}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#6B6362]">Mixed Designs:</span>
              <span className="font-semibold text-[#5C1D24]">Allowed across order</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B6362] pt-1 border-t border-[#E6DDD5]/60">
              <Truck className="w-3.5 h-3.5 text-[#C49A45] flex-shrink-0" />
              <span>Shipping charged separately &amp; confirmed before dispatch</span>
            </div>
          </div>

          {/* Quantity Selector with Editable Number Input + Plus/Minus Controls */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="qv-quantity-input" className="text-[12px] font-semibold text-[#2B2625] block">
                  Quantity:
                </label>
                <span className="text-[10px] text-[#6B6362]">
                  {product.minQuantity > 1 ? `Min. ${product.minQuantity} pcs` : 'Bulk or single'}
                  {incQty > 1 ? ` · Step ${incQty}` : ''}
                </span>
              </div>
              <div className="flex items-center border border-[#E6DDD5] rounded-lg bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - incQty)}
                  disabled={quantity <= minQty}
                  className="px-3 py-1.5 text-[#2B2625] hover:bg-[#FAF7F2] disabled:opacity-30 transition-colors font-bold text-[14px]"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  id="qv-quantity-input"
                  type="number"
                  min={minQty}
                  step={incQty}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
                  className="w-14 py-1 text-center font-bold text-[13px] text-[#2B2625] focus:outline-none focus:bg-[#FAF7F2]"
                  aria-label="Frame quantity"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + incQty)}
                  className="px-3 py-1.5 text-[#2B2625] hover:bg-[#FAF7F2] transition-colors font-bold text-[14px]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={added}
              className={`w-full py-2.5 rounded-xl font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-all shadow-md ${
                added 
                  ? 'bg-[#027A48] text-white' 
                  : 'bg-[#5C1D24] hover:bg-[#4A161D] text-white hover:shadow-lg'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Request!</span>
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
              className="block text-center text-[12px] text-[#5C1D24] font-semibold hover:underline"
            >
              View Full Product Details &rarr;
            </Link>
          </div>

          {/* Assurance Trust Badges */}
          <div className="mt-auto pt-3 border-t border-[#F4EFEB] flex items-center justify-between text-[11px] text-[#6B6362]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C49A45]" />
              <span>Authentic Frames</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#C49A45]" />
              <span>Insured Event Transit</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
