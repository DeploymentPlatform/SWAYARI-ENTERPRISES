import React, { useEffect, useState } from 'react';
import { ChevronRight, Truck, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Product, formatPrice } from '@swayari/shared';
import { Link } from '../lib/router';
import { productImageSources } from '../lib/media';
import { usePageMeta, useStructuredData } from '../lib/meta';
import { useAddToBag } from '../lib/products';
import { withPreview } from '../lib/preview';
import { EmptyState, LoadError } from '../components/States';
import { OrderDisclaimer, Picture, PriceText, QuantityStepper, SampleTag } from '../components/ui';

type Status = 'loading' | 'ready' | 'notfound' | 'error';

export const ProductDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const { add, canRequest } = useAddToBag();

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetch(withPreview(`/api/products/${encodeURIComponent(slug)}`))
      .then(async res => {
        if (res.status === 404) return { notFound: true };
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        if (data.notFound || !data.product) {
          setStatus('notfound');
          return;
        }
        const p: Product = data.product;
        setProduct(p);
        setActiveImage(0);
        setQuantity(p.minQuantity || 1);
        setVariant(p.hasVariants && p.variants?.length ? p.variants[0].name : null);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [slug, attempt]);

  usePageMeta(product?.name || (status === 'notfound' ? 'Frame not found' : null), product?.description?.slice(0, 155), {
    noindex: status === 'notfound' || Boolean(product?.isDemo)
  });
  useStructuredData(
    'product-jsonld',
    product && !product.isDemo
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          sku: product.sku,
          description: product.description,
          image: product.images?.map(src => new URL(src, window.location.origin).href),
          brand: { '@type': 'Brand', name: 'SWAYARI' },
          ...(product.indicativePrice !== null
            ? { offers: { '@type': 'Offer', priceCurrency: 'INR', price: product.indicativePrice, availability: 'https://schema.org/InStock' } }
            : {})
        }
      : null
  );

  if (status === 'loading') {
    return (
      <div className="container-content grid gap-10 py-10 md:grid-cols-12 md:py-14" aria-busy="true">
        <div className="skeleton aspect-square md:col-span-7" />
        <div className="space-y-4 md:col-span-5">
          <div className="skeleton h-10 w-3/4" />
          <div className="skeleton h-5 w-1/3" />
          <div className="skeleton h-28 w-full" />
        </div>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="container-content py-16">
        <LoadError onRetry={() => setAttempt(a => a + 1)} />
      </div>
    );
  }
  if (status === 'notfound' || !product) {
    return (
      <div className="container-content">
        <EmptyState
          title="This devotional frame is no longer listed"
          body={<p className="text-[13px] text-[#6B6362]">It may have been updated or archived. Browse our devotional collection, or ask our team about it.</p>}
          action={{ to: '/shop', label: 'Browse Devotional Frames' }}
        />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['/assets/products/venkateswara-frame-960.webp'];
  const specs = [
    product.deity ? ['Deity', product.deity] : null,
    product.dimensions ? ['Dimensions', product.dimensions] : null,
    product.borderFinish ? ['Border Finish', product.borderFinish] : null,
    product.orientation ? ['Orientation', product.orientation] : null,
    product.material ? ['Craft / Materials', product.material] : null,
    ['Mixed Designs', 'Allowed across complete request'],
    ['Shipping', 'Quoted separately based on order size and delivery PIN']
  ].filter((s): s is [string, string] => Boolean(s));

  const requestable = canRequest(product);

  // Bulk tier pricing calculation (strictly <= 99)
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

  if (currentUnitPrice !== null && currentUnitPrice > 99) {
    currentUnitPrice = 99;
  }

  const calculatedSubtotal = currentUnitPrice !== null ? currentUnitPrice * quantity : null;

  return (
    <div className="container-content pb-20 md:pb-28">
      <nav aria-label="Breadcrumb" className="py-5 text-sm text-[#6B6362]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/shop" className="hover:text-[#5C1D24]">
              All Frames
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          {product.deity && (
            <>
              <li>
                <Link to={`/shop?deity=${encodeURIComponent(product.deity.toLowerCase())}`} className="hover:text-[#5C1D24]">
                  {product.deity}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
            </>
          )}
          <li aria-current="page" className="text-[#2B2625] font-medium">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 md:grid-cols-12 lg:gap-16">
        {/* Gallery */}
        <div className="md:col-span-7">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E6DDD5] p-4 flex items-center justify-center">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={`${product.name}${activeImage > 0 ? ' — view ' + (activeImage + 1) : ''}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-[#6B6362]">Photograph coming soon</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3" role="group" aria-label="Product photographs">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-pressed={activeImage === i}
                  aria-label={`Show photograph ${i + 1}`}
                  className={`w-20 h-20 rounded-xl p-1.5 border-2 bg-white transition-colors flex items-center justify-center ${activeImage === i ? 'border-[#5C1D24]' : 'border-[#E6DDD5] hover:border-[#C49A45]'}`}
                >
                  <img src={src} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            {product.isDemo && (
              <p className="mb-4 flex items-start gap-2.5 border border-[#C49A45]/50 bg-[#FAF7F2] p-3 text-xs text-[#8F7138] rounded-xl">
                <SampleTag className="flex-shrink-0 mt-0.5" />
                <span>Sample preview item — shown for catalogue verification. Dimensions and frame specifications confirmed upon enquiry.</span>
              </p>
            )}
            
            <div className="flex items-center gap-2 mb-1 text-xs text-[#C49A45] font-bold uppercase tracking-wider">
              <span>{product.dimensions || product.frameSize || 'Devotional Frame'}</span>
              {product.orientation && <span>· {product.orientation}</span>}
            </div>

            <h1 className="font-display text-[1.65rem] md:text-[2rem] font-bold text-[#2B2625] leading-tight">
              {product.name}
            </h1>
            
            {/* Price section */}
            <div className="mt-3 pb-3 border-b border-[#E6DDD5]">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#5C1D24]">
                  {formatPrice(currentUnitPrice)}
                </span>
                <span className="text-sm text-[#6B6362]">
                  per frame
                </span>
              </div>

              {calculatedSubtotal !== null && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DDD5] space-y-1">
                  <div className="flex justify-between text-xs text-[#6B6362]">
                    <span>Unit price × quantity:</span>
                    <span className="font-medium text-[#2B2625]">{formatPrice(currentUnitPrice)} × {quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#5C1D24] pt-1 border-t border-[#E6DDD5]/60">
                    <span>Items subtotal:</span>
                    <span>{formatPrice(calculatedSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#6B6362] pt-0.5">
                    <span>Shipping:</span>
                    <span className="font-medium text-[#8F7138] italic">to be confirmed by our team</span>
                  </div>
                </div>
              )}

              <p className="mt-2 text-xs text-[#6B6362] leading-relaxed">
                Items subtotal is indicative. Submitting this request does not confirm a purchase or charge payment online.
              </p>
            </div>

            {/* Minimum quantity and bulk conditions */}
            {product.minQuantity > 1 && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#C49A45]/40 text-[#8F7138] text-xs font-semibold">
                Bulk order frame · Minimum quantity: {product.minQuantity} frames
                {product.orderIncrement > 1 ? ` · Multiples of ${product.orderIncrement}` : ''}
              </div>
            )}

            {/* Bulk Volume Tiers Table */}
            {product.bulkTiers && product.bulkTiers.length > 0 && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E6DDD5]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8F7138] mb-2">
                  Volume Pricing Tiers:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {product.bulkTiers.map((t) => (
                    <div
                      key={t.min_qty}
                      className={`p-2 rounded-lg border ${
                        quantity >= t.min_qty
                          ? 'bg-[#5C1D24] text-white border-[#5C1D24]'
                          : 'bg-white text-[#2B2625] border-[#E6DDD5]'
                      }`}
                    >
                      <div className="font-bold">{formatPrice(t.unit_price)}</div>
                      <div className="text-[10px] opacity-80">{t.min_qty}+ frames</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-5 whitespace-pre-line text-[14px] leading-relaxed text-[#6B6362]">{product.description}</p>

            <dl className="mt-6 divide-y divide-[#E6DDD5] border-y border-[#E6DDD5] text-xs">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-4 py-2.5">
                  <dt className="text-[#6B6362] font-medium">{k}</dt>
                  <dd className="text-[#2B2625] font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            {product.customisationInfo && <p className="mt-3 text-xs text-[#8F7138] font-medium">✨ {product.customisationInfo}</p>}

            {requestable ? (
              <form
                className="mt-6 space-y-4"
                onSubmit={e => {
                  e.preventDefault();
                  add(product, quantity, { selectedVariant: variant, customisationNote: note.trim() || undefined });
                }}
              >
                <div>
                  <label htmlFor="item-note" className="text-xs font-semibold text-[#2B2625] block mb-1">
                    Event note or custom tags <span className="font-normal text-[#6B6362]">(optional)</span>
                  </label>
                  <input
                    id="item-note"
                    type="text"
                    maxLength={300}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="For example, wedding date, couple names for sticker, or preferred packaging"
                    className="w-full h-10 px-3 rounded-lg border border-[#E6DDD5] bg-[#FAF7F2] text-xs text-[#2B2625] placeholder-[#6B6362] focus:outline-none focus:border-[#5C1D24] focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <QuantityStepper
                    value={quantity}
                    min={product.minQuantity || 1}
                    onChange={q => setQuantity(Math.max(product.minQuantity || 1, q))}
                    label="Frame quantity"
                  />
                  <button type="submit" className="btn-primary flex-1 py-3 text-sm font-semibold">
                    Add to Request
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 border border-[#E6DDD5] bg-white p-4 text-xs text-[#6B6362] rounded-xl">
                This preview sample cannot be requested online yet. To ask about a similar frame,{' '}
                <Link to={`/contact?product=${encodeURIComponent(product.name)}`} className="underline font-semibold text-[#5C1D24]">
                  contact our team
                </Link>
                .
              </div>
            )}

            <div className="mt-6">
              <OrderDisclaimer compact />
            </div>

            <Link to={`/contact?product=${encodeURIComponent(product.name)}`} className="inline-block mt-4 text-xs font-semibold text-[#5C1D24] hover:underline">
              Need assistance with this design? Contact our team &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
