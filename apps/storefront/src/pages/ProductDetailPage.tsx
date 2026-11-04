import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, MessageCircle, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import { Product, formatPrice } from '@swayari/shared';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { useAddToBag, useProducts } from '../lib/products';
import { withPreview } from '../lib/preview';
import { EmptyState, LoadError, Ornament } from '../components/States';
import { ProductCard } from '../components/ProductCard';
import { EASE_LUXURY, Reveal, StaggerGroup, StaggerItem } from '../components/motion';
import { OrderDisclaimer, SampleTag } from '../components/ui';
import { BuyBox } from '../components/BuyBox';
import { productPricing } from '../components/Price';

type Status = 'loading' | 'ready' | 'notfound' | 'error';

const FALLBACK_IMAGE = '/assets/products/gf-venkateswara-studio.webp';

/** Some listings carry the same photograph twice (.webp and .jpg); show each picture once. */
function uniqueImages(images: string[] | undefined): string[] {
  const list = images && images.length > 0 ? images : [FALLBACK_IMAGE];
  const seen = new Set<string>();
  return list.filter(src => {
    const key = src.replace(/\.(webp|jpe?g|png|avif)$/i, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const ProductDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [note, setNote] = useState('');
  const { canRequest } = useAddToBag();
  const formActionsRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

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
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [slug, attempt]);

  // Mobile: reveal the sticky add-to-request bar once the in-page button has scrolled away.
  useEffect(() => {
    const update = () => {
      const node = formActionsRef.current;
      setShowStickyBar(Boolean(node) && node.getBoundingClientRect().bottom < 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [status, product?.id]);

  usePageMeta(
    product ? `${product.name}${product.indicativePrice != null ? ` — ₹${product.indicativePrice.toLocaleString('en-IN')}` : ''}` : status === 'notfound' ? 'Design not found' : null,
    product?.description?.slice(0, 155),
    {
      noindex: status === 'notfound' || Boolean(product?.isDemo)
    }
  );
  // Product and breadcrumb structured data are written into the page HTML by the server
  // (functions/_middleware.js), so every crawler sees them without running the app.

  if (status === 'loading') {
    return (
      <div className="container-content pb-20 pt-6" aria-busy="true">
        <div className="skeleton h-4 w-56" />
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="skeleton aspect-square rounded-card" />
            <div className="mt-4 flex gap-3">
              <div className="skeleton h-20 w-20" />
              <div className="skeleton h-20 w-20" />
            </div>
          </div>
          <div className="space-y-4 lg:col-span-5">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton h-12 w-4/5" />
            <div className="skeleton h-10 w-1/3" />
            <div className="skeleton h-32 w-full rounded-card" />
            <div className="skeleton h-12 w-full rounded-full" />
          </div>
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
          body={<p>It may have been updated or archived. Browse our devotional collection, or ask our team about it.</p>}
          action={{ to: '/shop', label: 'Browse Devotional Frames' }}
        />
      </div>
    );
  }

  const images = uniqueImages(product.images);
  const requestable = canRequest(product);
  const pricing = productPricing(product);

  const details: { id: string; title: string; rows: [string, string][]; text?: string }[] = [
    {
      id: 'craft',
      title: 'Material & craft',
      rows: [
        product.material ? ['Craft / Materials', product.material] : null,
        product.borderFinish ? ['Border Finish', product.borderFinish] : null,
        product.setContents ? ['Contents', product.setContents] : null
      ].filter(Boolean) as [string, string][],
      text: product.customisationInfo || undefined
    },
    {
      id: 'dimensions',
      title: 'Dimensions & format',
      rows: [
        product.deity ? ['Deity', product.deity] : null,
        product.dimensions ? ['Dimensions', product.dimensions] : null,
        product.frameSize ? ['Frame size', product.frameSize] : null,
        product.orientation ? ['Orientation', product.orientation.charAt(0).toUpperCase() + product.orientation.slice(1)] : null
      ].filter(Boolean) as [string, string][]
    },
    {
      id: 'packaging',
      title: 'Packaging & mixing designs',
      rows: [
        ...(product.packagingOptions || []).map(
          o => [o.name, o.included ? 'Included' : o.price ? `${formatPrice(o.price)} per piece` : 'On request'] as [string, string]
        ),
        ['Mixed designs', 'Designs of the same product and size count together for the slab'] as [string, string]
      ]
    },
    {
      id: 'shipping',
      title: 'Shipping & ordering',
      rows: [
        ['Delivery', 'Extra, charged at actual cost for your PIN code'] as [string, string],
        ['Minimum order', 'From 1 piece — mix designs of a product to reach a bulk slab'] as [string, string]
      ],
      text: product.shippingInfo || undefined
    }
  ].filter(d => d.rows.length > 0 || d.text);

  return (
    <div className="pb-16 lg:pb-8">
      <div className="container-content">
        <nav aria-label="Breadcrumb" className="py-5 text-[0.8125rem] text-ink-faint md:py-7">
          <ol className="flex min-w-0 items-center gap-1.5">
            <li className="flex-shrink-0">
              <Link to="/shop" className="link-underline transition-colors">
                Shop
              </Link>
            </li>
            <li aria-hidden className="flex-shrink-0">
              <ChevronRight className="h-3.5 w-3.5 text-gold" />
            </li>
            {product.categorySlug && (
              <>
                <li className="flex-shrink-0">
                  <Link to={`/shop?category=${product.categorySlug}`} className="link-underline transition-colors">
                    {product.categoryName}
                  </Link>
                </li>
                <li aria-hidden className="flex-shrink-0">
                  <ChevronRight className="h-3.5 w-3.5 text-gold" />
                </li>
              </>
            )}
            <li aria-current="page" className="min-w-0 truncate font-medium text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-14 xl:gap-20">
          {/* Gallery */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_LUXURY }}
          >
            <div className="lg:sticky lg:top-28">
              <Gallery images={images} name={product.name} active={activeImage} onChange={setActiveImage} isDemo={product.isDemo} />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_LUXURY }}
          >
            {product.isDemo && (
              <p className="mb-6 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold-pale/40 p-3.5 text-[0.8125rem] leading-relaxed text-gold-dark">
                <SampleTag className="mt-0.5 flex-shrink-0" />
                <span>Sample preview item — shown for catalogue verification. Dimensions and frame specifications confirmed upon enquiry.</span>
              </p>
            )}

            <p className="eyebrow">{product.categoryName || 'Devotional gift'}</p>

            <h1 className="mt-4 font-display text-[2.25rem] font-medium leading-[1.04] text-ink sm:text-[2.75rem] xl:text-[3.25rem]">{product.name}</h1>

            <p className="lede mt-5 whitespace-pre-line">{product.description}</p>

            {requestable ? (
              <div ref={formActionsRef} className="mt-7 scroll-mt-28" id="buy">
                <BuyBox
                  product={product}
                  customisationNote={note.trim()}
                  beforeAdd={
                    <div>
                      <label htmlFor="item-note" className="field-label">
                        Event note or custom tags <span className="font-normal text-ink-soft">(optional)</span>
                      </label>
                      <input
                        id="item-note"
                        type="text"
                        maxLength={300}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Wedding date, names for a sticker, or packing preference"
                        className="field-input text-[0.9375rem]"
                      />
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-stone-deep bg-white/80 p-4 text-sm leading-relaxed text-ink-soft">
                This preview sample cannot be requested online yet. To ask about a similar piece,{' '}
                <Link to={`/contact?product=${encodeURIComponent(product.name)}`} className="font-semibold text-burgundy underline underline-offset-4">
                  contact our team
                </Link>
                .
              </div>
            )}

            <ul className="mt-7 grid grid-cols-3 gap-2 text-center text-[0.75rem] leading-snug text-ink-soft">
              <li className="flex flex-col items-center gap-2 rounded-2xl border border-stone-deep/70 bg-white/60 px-2 py-3.5">
                <Sparkles className="h-4 w-4 text-gold" aria-hidden />
                Mixed designs welcome
              </li>
              <li className="flex flex-col items-center gap-2 rounded-2xl border border-stone-deep/70 bg-white/60 px-2 py-3.5">
                <Truck className="h-4 w-4 text-gold" aria-hidden />
                Delivery at actual cost
              </li>
              <li className="flex flex-col items-center gap-2 rounded-2xl border border-stone-deep/70 bg-white/60 px-2 py-3.5">
                <MessageCircle className="h-4 w-4 text-gold" aria-hidden />
                Confirmed personally
              </li>
            </ul>

            <div className="mt-6">
              <OrderDisclaimer compact />
            </div>

            {/* Details accordion */}
            <div className="mt-8 border-t border-stone-deep">
              {details.map((d, i) => (
                <AccordionItem key={d.id} id={d.id} title={d.title} defaultOpen={i === 0}>
                  {d.rows.length > 0 && (
                    <dl className="divide-y divide-stone-deep/60 text-sm">
                      {d.rows.map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-4 py-2.5">
                          <dt className="text-ink-faint">{k}</dt>
                          <dd className="font-medium text-ink">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {d.text && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{d.text}</p>}
                </AccordionItem>
              ))}
            </div>

            <Link
              to={`/contact?product=${encodeURIComponent(product.name)}`}
              className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-burgundy"
            >
              <span className="link-underline">Need assistance with this design? Contact our team</span>
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </div>
      </div>

      <RelatedProducts product={product} />

      {/* Mobile sticky add-to-cart bar */}
      {requestable && (
        <AnimatePresence>
          {showStickyBar && (
            <motion.div
              className="glass fixed inset-x-0 bottom-[calc(56px+max(0.75rem,env(safe-area-inset-bottom)))] z-30 pb-3 md:bottom-0 md:pb-safe border-t border-stone-deep/70 px-4 pt-3 shadow-[0_-12px_30px_-18px_rgba(23,15,12,0.35)] lg:hidden"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '110%' }}
              transition={{ duration: 0.5, ease: EASE_LUXURY }}
            >
              <div className="mx-auto flex max-w-xl items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-ink-soft">
                    {pricing.best != null && pricing.basePrice != null && pricing.best < pricing.basePrice
                      ? `Bulk price from ${formatPrice(pricing.best)}`
                      : 'Price per piece'}
                  </p>
                  <p className="font-display text-[1.4rem] font-semibold leading-tight text-burgundy lining-nums">
                    {(product.variants?.length || 0) > 1 ? 'from ' : ''}
                    {formatPrice(pricing.basePrice)}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary px-6"
                  onClick={() => document.getElementById('buy')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden />
                  Add to cart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ Gallery */

const Gallery: React.FC<{ images: string[]; name: string; active: number; onChange: (i: number) => void; isDemo: boolean }> = ({
  images,
  name,
  active,
  onChange,
  isDemo
}) => {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const canHover = useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches, []);
  const go = (delta: number) => onChange((active + delta + images.length) % images.length);

  return (
    <div>
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-card border border-stone-deep/80 bg-gradient-to-b from-ivory-light to-stone shadow-card"
        onMouseMove={e => {
          if (!canHover) return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <div aria-hidden className="pointer-events-none absolute inset-4 rounded-[14px] border border-gold/20 sm:inset-6" />
        <div
          className="absolute inset-0 transition-transform duration-500 ease-luxury"
          style={{
            transform: zoom ? 'scale(1.75)' : 'scale(1)',
            transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : 'center',
            cursor: canHover ? 'zoom-in' : undefined
          }}
        >
          <AnimatePresence initial={false}>
            <motion.img
              key={images[active]}
              src={images[active]}
              alt={`${name}${active > 0 ? ' — view ' + (active + 1) : ''}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE_LUXURY }}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          </AnimatePresence>
        </div>
        {isDemo && <SampleTag className="absolute left-4 top-4" />}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photograph"
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-ink shadow-soft backdrop-blur transition-all duration-300 hover:text-burgundy lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photograph"
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-ink shadow-soft backdrop-blur transition-all duration-300 hover:text-burgundy lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <p className="absolute bottom-3 right-4 rounded-full bg-white/80 px-2.5 py-0.5 text-[0.6875rem] font-medium tabular-nums text-ink-soft backdrop-blur">
              {active + 1} / {images.length}
            </p>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="Product photographs">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onChange(i)}
              aria-pressed={active === i}
              aria-label={`Show photograph ${i + 1}`}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border bg-white p-1.5 transition-all duration-300 ease-luxury ${
                active === i ? 'border-burgundy shadow-[0_0_0_3px_rgba(94,26,40,0.12)]' : 'border-stone-deep opacity-70 hover:border-gold hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ Pieces */

const TierCard: React.FC<{ label: string; price: string; active: boolean; reached?: boolean; onClick: () => void }> = ({
  label,
  price,
  active,
  reached,
  onClick
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    aria-label={`${label} at ${price} per frame`}
    className={`relative min-h-[64px] rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 ease-luxury ${
      active
        ? 'border-burgundy bg-gradient-to-b from-burgundy-accent to-burgundy text-ivory-light shadow-[0_10px_24px_-14px_rgba(94,26,40,0.8)]'
        : reached
          ? 'border-gold/50 bg-gold-pale/50 text-ink hover:border-gold'
          : 'border-stone-deep bg-white/80 text-ink hover:-translate-y-0.5 hover:border-gold'
    }`}
  >
    <span className={`block font-display text-[1.35rem] font-semibold leading-none ${active ? 'text-ivory-light' : 'text-burgundy'} lining-nums`}>{price}</span>
    <span className={`mt-1 block text-[0.6875rem] font-medium uppercase tracking-[0.1em] ${active ? 'text-gold-light' : 'text-ink-faint'}`}>{label}</span>
  </button>
);

const AccordionItem: React.FC<{ id: string; title: string; defaultOpen?: boolean; children: React.ReactNode }> = ({
  id,
  title,
  defaultOpen,
  children
}) => {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="border-b border-stone-deep">
      <h2>
        <button
          type="button"
          id={`acc-${id}-button`}
          aria-expanded={open}
          aria-controls={`acc-${id}-panel`}
          onClick={() => setOpen(o => !o)}
          className="flex min-h-[56px] w-full items-center justify-between gap-4 py-3 text-left font-display text-[1.3rem] font-medium text-ink transition-colors hover:text-burgundy"
        >
          {title}
          <ChevronDown className={`h-5 w-5 flex-shrink-0 text-gold transition-transform duration-500 ease-luxury ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`acc-${id}-panel`}
            role="region"
            aria-labelledby={`acc-${id}-button`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_LUXURY }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RelatedProducts: React.FC<{ product: Product }> = ({ product }) => {
  const { products, status } = useProducts();
  const related = useMemo(() => {
    const others = products.filter(p => p.id !== product.id);
    const same = others.filter(p => product.deity && p.deity === product.deity);
    const rest = others.filter(p => !same.includes(p));
    return [...same, ...rest].slice(0, 4);
  }, [products, product.id, product.deity]);

  if (status !== 'ready' || related.length === 0) return null;

  return (
    <section className="container-content section" aria-labelledby="related-title">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <p className="eyebrow mb-4">Complete your gifting</p>
        <h2 id="related-title" className="display-title">
          You may also <em>love</em>
        </h2>
        <Ornament className="mt-5" />
      </Reveal>
      <StaggerGroup className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:mt-14 lg:grid-cols-4">
        {related.map(p => (
          <StaggerItem key={p.id} className="h-full">
            <ProductCard product={p} sizes="(min-width: 1024px) 25vw, 50vw" />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
};
