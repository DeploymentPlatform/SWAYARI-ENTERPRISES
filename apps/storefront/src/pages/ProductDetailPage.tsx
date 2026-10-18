import React, { useState, useEffect } from 'react';
import { Product, formatPrice, ORDER_DISCLAIMER_TEXT } from '@swayari/shared';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowLeft, ShieldCheck, HeartHandshake, Truck, AlertCircle, Plus, Minus } from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, navigate }) => {
  const { user, initiateGoogleSignIn } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customisationNote, setCustomisationNote] = useState<string>('');

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  async function fetchProduct() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        const p: Product = data.product;
        setProduct(p);
        const firstImg = p.images && p.images.length > 0 ? p.images[0] : '/assets/demo/sample_product_1.jpeg';
        setSelectedImage(firstImg);
        setQuantity(p.minQuantity || 1);
        if (p.hasVariants && p.variants && p.variants.length > 0) {
          setSelectedVariant(p.variants[0].name);
        }
      } else {
        setProduct(null);
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    if (!product) return;

    const cartItem = {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      image: selectedImage,
      indicativePrice: product.indicativePrice,
      minQuantity: product.minQuantity || 1,
      quantity,
      selectedVariant,
      customisationNote: customisationNote.trim() || undefined
    };

    if (!user) {
      // User is signed out: Initiate Google Sign-In and register intended addition
      initiateGoogleSignIn(cartItem);
    } else {
      addItem(cartItem);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-6 bg-ivory-muted rounded w-48 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-[4/5] bg-ivory-muted rounded-2xl" />
          <div className="space-y-4 text-left">
            <div className="h-8 bg-ivory-muted rounded w-3/4" />
            <div className="h-5 bg-ivory-muted rounded w-1/3" />
            <div className="h-24 bg-ivory-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Piece Not Found</h2>
        <p className="text-xs sm:text-sm text-charcoal-muted font-light">
          The requested catalogue piece may have been updated, relocated, or temporarily reserved.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-md bg-burgundy text-white text-xs font-medium hover:bg-burgundy-hover"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalogue</span>
        </button>
      </div>
    );
  }

  const imagesList =
    product.images && product.images.length > 0
      ? product.images
      : ['/assets/demo/sample_product_1.jpeg', '/assets/demo/sample_product_2.jpeg'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <button
        onClick={() => navigate('/shop')}
        className="inline-flex items-center space-x-1.5 text-xs text-charcoal-muted hover:text-burgundy transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Catalogue</span>
      </button>

      {/* Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        
        {/* Left Gallery Section */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Visual Frame */}
          <div className="relative aspect-[4/5] bg-ivory-muted rounded-2xl overflow-hidden border border-ivory-border shadow-card">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.isDemo && (
              <div className="absolute top-4 left-4 bg-amber-800/90 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded">
                Sample Preview Photograph
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {imagesList.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img ? 'border-burgundy shadow-sm' : 'border-ivory-border hover:border-gold'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Details & Action Area */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-charcoal-light font-medium">{product.sku}</span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-ivory-muted text-charcoal-muted">
                {product.availabilityLabel || 'Available on Request'}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal mt-2 leading-tight">
              {product.name}
            </h1>

            <div className="mt-4 pb-4 border-b border-ivory-border">
              <span className="text-xs text-charcoal-light block">Indicative Pricing:</span>
              <span className="font-serif text-2xl font-bold text-burgundy">
                {formatPrice(product.indicativePrice)}
              </span>
              <span className="text-xs text-charcoal-muted block mt-0.5">
                (Subject to availability &amp; delivery location confirmation)
              </span>
            </div>
          </div>

          {/* Narrative Description */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-charcoal">Description</h3>
            <p className="text-xs sm:text-sm text-charcoal-muted font-light leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Confirmed Material and Dimensions */}
          <div className="bg-white p-4 rounded-xl border border-ivory-border space-y-2.5 text-xs">
            {product.material && (
              <div className="flex justify-between py-1 border-b border-ivory-border/50">
                <span className="text-charcoal-light font-medium">Material &amp; Alloy:</span>
                <span className="text-charcoal font-semibold">{product.material}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between py-1 border-b border-ivory-border/50">
                <span className="text-charcoal-light font-medium">Dimensions &amp; Weight:</span>
                <span className="text-charcoal font-semibold">{product.dimensions}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-charcoal-light font-medium">Packaging:</span>
              <span className="text-charcoal">Festive Gift-Ready Foam Encasement</span>
            </div>
          </div>

          {/* Variants selector if configured */}
          {product.hasVariants && product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-charcoal block">
                Select Option / Finish:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(v.name)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      selectedVariant === v.name
                        ? 'border-burgundy bg-burgundy-light text-burgundy font-semibold'
                        : 'border-ivory-border bg-white text-charcoal hover:bg-ivory'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal">Quantity:</span>
            <div className="flex items-center border border-ivory-border rounded-lg bg-white">
              <button
                onClick={() => setQuantity(Math.max(product.minQuantity || 1, quantity - 1))}
                className="p-2 text-charcoal hover:text-burgundy"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 text-sm font-semibold text-charcoal min-w-[32px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 text-charcoal hover:text-burgundy"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Customisation note input */}
          <div className="space-y-1.5">
            <label className="text-xs text-charcoal-muted block">
              Special request or customisation requirements (optional):
            </label>
            <input
              type="text"
              value={customisationNote}
              onChange={e => setCustomisationNote(e.target.value)}
              placeholder="E.g. Antique lacquer polish, gift message, or express courier..."
              className="w-full text-xs p-2.5 rounded-lg border border-ivory-border bg-white focus:outline-none focus:border-burgundy"
            />
          </div>

          {/* Main Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center space-x-2 py-4 rounded-md bg-burgundy hover:bg-burgundy-hover text-white text-sm font-semibold tracking-wide shadow-card hover:shadow-card-hover transition-all duration-200"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{user ? 'Add to Order Request List' : 'Sign in & Add to Request List'}</span>
          </button>

          {/* Mandatory Order Model Disclaimer */}
          <div className="bg-ivory-muted/80 rounded-xl p-4 border border-ivory-border flex items-start space-x-3 text-xs text-charcoal-muted leading-relaxed">
            <AlertCircle className="w-4 h-4 text-burgundy flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-light">
              {ORDER_DISCLAIMER_TEXT}
            </p>
          </div>

          {/* Studio Assurances */}
          <div className="pt-2 grid grid-cols-3 gap-3 text-center border-t border-ivory-border text-charcoal-muted text-[11px]">
            <div>
              <ShieldCheck className="w-4 h-4 mx-auto text-gold mb-1" />
              <span>Authentic Metal</span>
            </div>
            <div>
              <HeartHandshake className="w-4 h-4 mx-auto text-gold mb-1" />
              <span>Personal Follow-Up</span>
            </div>
            <div>
              <Truck className="w-4 h-4 mx-auto text-gold mb-1" />
              <span>Protective Transit</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
