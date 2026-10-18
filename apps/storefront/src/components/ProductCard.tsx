import React from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { Product, formatPrice } from '@swayari/shared';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { user, initiateGoogleSignIn } = useAuth();
  const { addItem } = useCart();

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : '/assets/demo/sample_product_1.jpeg';

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();

    const cartItem = {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      image: primaryImage,
      indicativePrice: product.indicativePrice,
      minQuantity: product.minQuantity || 1,
      quantity: product.minQuantity || 1
    };

    if (!user) {
      // User is signed out: Initiate Google Sign-In and register intended action
      initiateGoogleSignIn(cartItem);
    } else {
      addItem(cartItem);
    }
  }

  return (
    <div
      onClick={() => onViewDetails(product.slug)}
      className="group bg-white rounded-xl overflow-hidden border border-ivory-border shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Area with consistent aspect ratio */}
      <div className="relative aspect-[4/5] bg-ivory-muted overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-104"
          loading="lazy"
        />

        {/* Demo / Preview Badge if applicable */}
        {product.isDemo && (
          <div className="absolute top-3 left-3 bg-amber-800/90 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded">
            Preview Model
          </div>
        )}

        {/* Category Pill */}
        {product.categoryName && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-charcoal text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-sm">
            {product.categoryName}
          </div>
        )}

        {/* Hover Quick Action */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3 pointer-events-none">
          <span className="bg-white/95 text-charcoal px-3.5 py-2 rounded-full text-xs font-medium shadow-md flex items-center space-x-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </span>
        </div>
      </div>

      {/* Product Info Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-charcoal-light font-medium">{product.sku}</p>
          <h3 className="font-serif text-base sm:text-lg text-charcoal font-medium mt-1 line-clamp-2 group-hover:text-burgundy transition-colors leading-snug">
            {product.name}
          </h3>

          {product.material && (
            <p className="text-xs text-charcoal-muted mt-1.5 font-light line-clamp-1">
              {product.material}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-ivory-border/70 flex items-center justify-between">
          <div>
            <span className="text-xs text-charcoal-light block">Indicative:</span>
            <span className="font-serif text-base font-semibold text-burgundy">
              {formatPrice(product.indicativePrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-ivory-muted hover:bg-burgundy hover:text-white text-charcoal text-xs font-medium transition-all duration-200 border border-ivory-border group-hover:border-burgundy/40"
            title={user ? 'Add to Request List' : 'Sign in & Add to Request List'}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
