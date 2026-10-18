import React from 'react';
import { Product } from '@swayari/shared';
import { Link } from '../lib/router';
import { useAddToBag } from '../lib/products';
import { ProductCard, ProductImage } from './ProductCard';
import { PriceText, SampleTag } from './ui';

/**
 * Lays out real inventory according to how much of it there is:
 *  1 item  → a broad featured composition (never a lonely card in an empty grid)
 *  2–3     → a balanced row that fills the width
 *  4+      → a consistent grid (2 columns on phones, 3 on tablets, 4 on desktop)
 */
export const ProductCollection: React.FC<{ products: Product[]; priorityFirst?: boolean }> = ({ products, priorityFirst }) => {
  if (products.length === 1) return <FeaturedProduct product={products[0]} />;

  if (products.length <= 3) {
    return (
      <div className={`grid gap-x-6 gap-y-12 sm:grid-cols-2 ${products.length === 3 ? 'lg:grid-cols-3' : 'lg:gap-x-10'}`}>
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            priority={priorityFirst && i === 0}
            sizes={products.length === 3 ? '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw' : '(min-width: 640px) 50vw, 100vw'}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-14">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={priorityFirst && i < 2} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
      ))}
    </div>
  );
};

export const FeaturedProduct: React.FC<{ product: Product }> = ({ product }) => {
  const { add, canRequest } = useAddToBag();
  const href = `/product/${product.slug}`;
  return (
    <article className="group grid items-center gap-8 md:grid-cols-12 md:gap-12">
      <Link to={href} className="block md:col-span-7" tabIndex={-1} aria-label={product.name}>
        <ProductImage product={product} sizes="(min-width: 768px) 58vw, 100vw" priority />
      </Link>
      <div className="md:col-span-5">
        {product.categoryName && <p className="eyebrow mb-3">{product.categoryName}</p>}
        <div className="flex items-start gap-3">
          <h3 className="text-display-sm md:text-display-md">
            <Link to={href} className="transition-colors hover:text-burgundy">
              {product.name}
            </Link>
          </h3>
          {product.isDemo && <SampleTag className="mt-3" />}
        </div>
        <PriceText value={product.indicativePrice} className="mt-3 block text-lg text-ink-soft" />
        <p className="mt-5 max-w-prose text-base leading-relaxed text-ink-soft">{product.description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {canRequest(product) && (
            <button type="button" className="btn-primary" onClick={() => add(product)}>
              Add to bag
            </button>
          )}
          <Link to={href} className="btn-secondary">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
};
