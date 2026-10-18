import React, { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { formatDate, formatPrice } from '@swayari/shared';
import { useAuth } from '../context/AuthContext';
import { Link } from '../lib/router';
import { productImageSources } from '../lib/media';
import { usePageMeta } from '../lib/meta';
import { EmptyState, LoadError } from '../components/States';
import { LotusMark, Picture, PriceText } from '../components/ui';

interface OrderView {
  id: string;
  status: string;
  createdAt: string;
  indicativeSubtotal: number | null;
  deliveryCity: string;
  deliveryState: string;
  items: { id: string; name: string; quantity: number; variant: string | null; indicativePrice: number | null; imageUrl: string | null }[];
}

const NEXT_STEPS = [
  'Our team reviews your request.',
  'We contact you to confirm availability, final pricing, shipping charges and delivery details.',
  'Nothing is confirmed or charged until you agree with our team.'
];

export const OrderConfirmationPage: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { user, isLoading } = useAuth();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'missing'>('loading');
  const [copied, setCopied] = useState(false);
  usePageMeta('Request received', undefined, { noindex: true });

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setStatus('missing');
      return;
    }
    fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then(async res => {
        if (res.status === 404 || res.status === 403) return setStatus('missing');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOrder(data.order);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [orderId, user, isLoading]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the reference stays visible to copy manually */
    }
  }

  if (status === 'missing') {
    return (
      <div className="container-content">
        <EmptyState
          title="We couldn’t find that request"
          body={<p>Sign in with the account you used to send it, or see all of your requests.</p>}
          action={{ to: '/orders', label: 'Your requests' }}
        />
      </div>
    );
  }

  return (
    <div className="container-content max-w-3xl pb-20 pt-12 md:pb-28 md:pt-16">
      <div className="text-center">
        <LotusMark className="mx-auto h-7 w-12 text-gold" />
        <p className="eyebrow mt-6">Request received</p>
        <h1 className="mt-3 text-display-sm md:text-display-lg">Thank you — we have your request</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
          It has been saved to your account. Our team will contact you to confirm the details.
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-y border-stone-deep py-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="text-sm text-ink-soft">Your reference</p>
          <p className="mt-1 font-mono text-xl tracking-wide text-burgundy">{orderId}</p>
        </div>
        <button type="button" onClick={copy} className="btn-secondary">
          {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? 'Copied' : 'Copy reference'}
        </button>
      </div>

      {status === 'loading' && <div className="skeleton mt-10 h-40" aria-busy="true" />}
      {status === 'error' && (
        <div className="mt-10">
          <LoadError message="Your request was saved, but we couldn’t load its summary. You can see it under Your requests." />
        </div>
      )}
      {status === 'ready' && order && (
        <section className="mt-10" aria-labelledby="summary">
          <h2 id="summary" className="text-[1.75rem]">
            What you requested
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Sent {formatDate(order.createdAt)} · Delivery to {order.deliveryCity}, {order.deliveryState}
          </p>
          <ul className="mt-5 divide-y divide-stone-deep border-y border-stone-deep">
            {order.items.map(it => {
              const sources = productImageSources(it.imageUrl);
              return (
                <li key={it.id} className="flex items-center gap-4 py-4">
                  <div className="w-16 flex-shrink-0 bg-stone">
                    {sources && <Picture sources={sources} sizes="64px" width={128} height={160} alt="" className="aspect-product w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg">{it.name}</p>
                    <p className="text-sm text-ink-soft">
                      Qty {it.quantity}
                      {it.variant ? ` · ${it.variant}` : ''}
                    </p>
                  </div>
                  <PriceText value={it.indicativePrice === null ? null : it.indicativePrice * it.quantity} className="text-sm text-ink-soft" />
                </li>
              );
            })}
          </ul>
          <p className="mt-4 flex justify-between text-[0.9375rem]">
            <span className="text-ink-soft">Estimated total</span>
            <span>{order.indicativeSubtotal === null ? 'Price on request' : formatPrice(order.indicativeSubtotal)}</span>
          </p>
        </section>
      )}

      <section className="mt-12 bg-stone p-6 md:p-8" aria-labelledby="next">
        <h2 id="next" className="text-[1.75rem]">
          What happens next
        </h2>
        <ol className="mt-5 space-y-4">
          {NEXT_STEPS.map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="font-display text-2xl leading-none text-gold">{i + 1}</span>
              <span className="text-ink-soft">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/orders" className="btn-primary">
          View your requests
        </Link>
        <Link to="/shop" className="btn-secondary">
          Continue browsing
        </Link>
      </div>
    </div>
  );
};
