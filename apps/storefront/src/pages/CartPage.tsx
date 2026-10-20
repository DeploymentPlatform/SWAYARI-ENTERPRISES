import React from 'react';
import { formatPrice } from '@swayari/shared';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../lib/router';
import { productImageSources } from '../lib/media';
import { usePageMeta } from '../lib/meta';
import { EmptyState, PageIntro } from '../components/States';
import { OrderDisclaimer, Picture, PriceText, QuantityStepper } from '../components/ui';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, subtotal, hasUnpricedItems, itemCount } = useCart();
  const { user, initiateGoogleSignIn } = useAuth();
  const { navigate } = useRouter();
  usePageMeta('Your bag', undefined, { noindex: true });

  if (items.length === 0) {
    return (
      <div className="container-content">
        <EmptyState
          title="Your bag is empty"
          body={<p>Add the pieces you like and send them to us as one request.</p>}
          action={{ to: '/shop', label: 'Explore the Collection' }}
        />
      </div>
    );
  }

  return (
    <div className="container-content pb-20 md:pb-28">
      <PageIntro eyebrow="Review" title="Your bag">
        {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}. Nothing is charged — you are preparing a request for our team.
      </PageIntro>

      <div className="grid gap-12 pt-10 lg:grid-cols-12 lg:gap-16">
        <ul className="divide-y divide-stone-deep border-y border-stone-deep lg:col-span-7">
          {items.map(item => {
            const sources = productImageSources(item.image);
            return (
              <li key={`${item.productId}-${item.selectedVariant || ''}`} className="grid grid-cols-[96px_1fr] gap-5 py-6 sm:grid-cols-[128px_1fr]">
                <Link to={`/product/${item.slug}`} className="block bg-stone" tabIndex={-1}>
                  {sources && <Picture sources={sources} sizes="128px" width={256} height={320} alt="" className="aspect-product w-full object-cover" />}
                </Link>
                <div className="flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link to={`/product/${item.slug}`} className="font-display text-[1.375rem] leading-snug hover:text-burgundy">
                        {item.name}
                      </Link>
                      {item.selectedVariant && <p className="text-sm text-ink-soft">{item.selectedVariant}</p>}
                      {item.customisationNote && <p className="mt-1 text-sm text-ink-soft">Note: {item.customisationNote}</p>}
                    </div>
                    <PriceText
                      value={item.indicativePrice === null ? null : item.indicativePrice * item.quantity}
                      className="whitespace-nowrap text-[0.9375rem] text-ink-soft"
                    />
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                    <QuantityStepper
                      size="sm"
                      value={item.quantity}
                      min={item.minQuantity || 1}
                      onChange={q => updateQuantity(item.productId, item.selectedVariant, q)}
                      label={`Quantity of ${item.name}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.selectedVariant)}
                      className="text-sm text-ink-soft underline underline-offset-4 hover:text-burgundy"
                      aria-label={`Remove ${item.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:col-span-5" aria-labelledby="summary-title">
          <div className="bg-stone p-6 md:p-8 lg:sticky lg:top-28">
            <h2 id="summary-title" className="text-[1.75rem]">
              Request summary
            </h2>
            <dl className="mt-5 space-y-3 text-[0.9375rem]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Pieces</dt>
                <dd>{itemCount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink font-medium">Items subtotal</dt>
                <dd className="text-right font-bold text-burgundy">
                  {subtotal === null ? 'Price on request' : formatPrice(subtotal)}
                  {subtotal !== null && hasUnpricedItems && <span className="block text-sm text-ink-soft">+ items priced on request</span>}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Shipping</dt>
                <dd className="text-right italic text-gold font-medium">To be confirmed by our team</dd>
              </div>
            </dl>
            <OrderDisclaimer className="mt-6 bg-ivory" compact />
            <button
              type="button"
              className="btn-primary mt-6 w-full"
              onClick={() => (user ? navigate('/checkout') : initiateGoogleSignIn(undefined, 'checkout'))}
            >
              {user ? 'Continue to request details' : 'Sign in to send request'}
            </button>
            <Link to="/shop" className="mt-4 block text-center text-sm text-ink-soft underline underline-offset-4 hover:text-burgundy">
              Continue browsing
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};
