import React from 'react';
import { Product } from '@swayari/shared';
import { Link } from '../lib/router';
import { productImageSources } from '../lib/media';
import { useAddToBag } from '../lib/products';
import { Picture, PriceText, SampleTag } from './ui';

export const ProductImage: React.FC<{ product: Product; sizes: string; priority?: boolean; className?: string }> = ({
  product,
  sizes,
  priority,
  className = ''
}) => {
  const sources = productImageSources(product.images?.[0]);
  return (
    <div className={`relative aspect-product overflow-hidden bg-stone ${className}`}>
      {sources ? (
        <Picture
          sources={sources}
          sizes={sizes}
          width={960}
          height={1200}
          priority={priority}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-ink-soft">Photograph coming soon</div>
      )}
    </div>
  );
};

export const ProductCard: React.FC<{ product: Product; sizes?: string; priority?: boolean }> = ({
  product,
  sizes = '(min-width: 1024px) 25vw, 50vw',
  priority
}) => {
  const { add, canRequest } = useAddToBag();
  const href = `/product/${product.slug}`;
  const requestable = canRequest(product);

  return (
    <article className="group flex flex-col">
      <Link to={href} className="block" aria-label={product.name} tabIndex={-1}>
        <ProductImage product={product} sizes={sizes} priority={priority} />
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <h3 className="font-display text-[1.1875rem] leading-snug sm:text-[1.375rem]">
          <Link to={href} className="transition-colors hover:text-burgundy">
            {product.name}
          </Link>
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <PriceText value={product.indicativePrice} className="text-[0.9375rem] text-ink-soft" />
          {product.isDemo && <SampleTag />}
        </div>
        <div className="mt-auto pt-4">
          {requestable ? (
            <button
              type="button"
              onClick={() => add(product)}
              className="inline-flex min-h-[44px] w-full items-center justify-center border border-ink/80 px-4 text-label uppercase text-ink transition-colors hover:bg-ink hover:text-ivory"
              style={{ fontWeight: 500 }}
            >
              Add to bag
            </button>
          ) : (
            <Link to={href} className="inline-flex min-h-[44px] w-full items-center justify-center border border-stone-shade px-4 text-label uppercase text-ink-soft">
              View sample
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
