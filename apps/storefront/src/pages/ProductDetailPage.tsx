import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Product } from '@swayari/shared';
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

  usePageMeta(product?.name || (status === 'notfound' ? 'Piece not found' : null), product?.description?.slice(0, 155), {
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
        <div className="skeleton aspect-product md:col-span-7" />
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
          title="This piece is no longer listed"
          body={<p>It may have been updated or removed. Browse the collection, or ask us about it.</p>}
          action={{ to: '/shop', label: 'Browse the collection' }}
        />
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const requestable = canRequest(product);
  const specs: [string, string][] = [];
  if (product.categoryName) specs.push(['Category', product.categoryName]);
  if (product.material) specs.push(['Material', product.material]);
  if (product.dimensions) specs.push(['Dimensions', product.dimensions]);
  if ((product.minQuantity || 1) > 1) specs.push(['Minimum quantity', String(product.minQuantity)]);
  specs.push(['Reference', product.sku]);

  return (
    <div className="container-content pb-20 md:pb-28">
      <nav aria-label="Breadcrumb" className="py-5 text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/shop" className="hover:text-burgundy">
              The Collection
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 md:grid-cols-12 lg:gap-16">
        {/* Gallery */}
        <div className="md:col-span-7">
          <div className="relative bg-stone">
            {images.length > 0 ? (
              <Picture
                key={images[activeImage]}
                sources={productImageSources(images[activeImage])!}
                sizes="(min-width: 768px) 58vw, 100vw"
                width={960}
                height={1200}
                priority
                alt={`${product.name}${activeImage > 0 ? ' — as photographed' : ''}`}
                className="aspect-product w-full object-cover"
              />
            ) : (
              <div className="flex aspect-product items-center justify-center text-ink-soft">Photograph coming soon</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3" role="group" aria-label="Product photographs">
              {images.map((src, i) => {
                const sources = productImageSources(src)!;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-pressed={activeImage === i}
                    aria-label={i === 0 ? 'Show studio photograph' : `Show photograph ${i + 1}${src.includes('-photo-') ? ' (as photographed)' : ''}`}
                    className={`w-20 border-2 bg-stone transition-colors sm:w-24 ${activeImage === i ? 'border-ink' : 'border-transparent hover:border-stone-shade'}`}
                  >
                    <Picture sources={sources} sizes="96px" width={192} height={240} alt="" className="aspect-product w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
          {images.some(src => src.includes('-photo-')) && (
            <p className="mt-3 text-[0.8125rem] text-ink-soft">
              The first image shows the piece on a neutral surface; the second is the original photograph.
            </p>
          )}
        </div>

        {/* Details */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            {product.isDemo && (
              <p className="mb-5 flex items-start gap-3 border border-gold/50 bg-white px-4 py-3 text-sm text-ink-soft">
                <SampleTag className="flex-shrink-0" />
                <span>Preview sample — shown so you can see how the catalogue will look. Details are still to be confirmed.</span>
              </p>
            )}
            <h1 className="text-display-sm md:text-display-md">{product.name}</h1>
            <PriceText value={product.indicativePrice} className="mt-3 block text-xl" />
            <p className="mt-1 text-sm text-ink-soft">Final price, shipping and delivery are confirmed by our team.</p>

            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink-soft">{product.description}</p>

            <dl className="mt-8 divide-y divide-stone-deep border-y border-stone-deep text-[0.9375rem]">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {product.customisationInfo && <p className="mt-4 text-sm text-ink-soft">{product.customisationInfo}</p>}

            {requestable ? (
              <form
                className="mt-8 space-y-6"
                onSubmit={e => {
                  e.preventDefault();
                  add(product, quantity, { selectedVariant: variant, customisationNote: note.trim() || undefined });
                }}
              >
                {product.hasVariants && product.variants?.length > 0 && (
                  <fieldset>
                    <legend className="field-label">Option</legend>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map(v => (
                        <label
                          key={v.name}
                          className={`cursor-pointer border px-4 py-2.5 text-sm transition-colors ${variant === v.name ? 'border-ink bg-ink text-ivory' : 'border-stone-shade hover:border-ink'}`}
                        >
                          <input type="radio" name="variant" value={v.name} checked={variant === v.name} onChange={() => setVariant(v.name)} className="sr-only" />
                          {v.name}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                <div>
                  <label htmlFor="item-note" className="field-label">
                    Note for our team <span className="font-normal text-ink-soft">(optional)</span>
                  </label>
                  <input
                    id="item-note"
                    type="text"
                    maxLength={300}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="For example, an occasion or a question about this piece"
                    className="field-input"
                  />
                </div>

                <div className="flex items-stretch gap-3">
                  <QuantityStepper value={quantity} min={product.minQuantity || 1} onChange={q => setQuantity(Math.max(product.minQuantity || 1, q))} label="Quantity" />
                  <button type="submit" className="btn-primary flex-1">
                    Add to bag
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-8 border border-stone-deep bg-white p-5 text-sm text-ink-soft">
                This preview sample cannot be requested yet. To ask about a similar piece,{' '}
                <Link to={`/contact?product=${encodeURIComponent(product.name)}`} className="link-underline text-ink">
                  contact our team
                </Link>
                .
              </div>
            )}

            <OrderDisclaimer className="mt-6" compact />

            <Link to={`/contact?product=${encodeURIComponent(product.name)}`} className="text-link mt-6">
              Ask about this piece
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
