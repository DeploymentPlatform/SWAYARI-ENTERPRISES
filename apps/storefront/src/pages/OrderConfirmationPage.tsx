import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, MessageCircle, ShieldCheck, ClipboardList } from 'lucide-react';
import { formatDate, formatPrice } from '@swayari/shared';
import { useAuth } from '../context/AuthContext';
import { Link } from '../lib/router';
import { productImageSources } from '../lib/media';
import { usePageMeta } from '../lib/meta';
import { EmptyState, LoadError, Ornament, RequestSteps } from '../components/States';
import { EASE_LUXURY, Reveal } from '../components/motion';
import { Picture, PriceText } from '../components/ui';

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
const STEP_ICONS = [ClipboardList, MessageCircle, ShieldCheck];

/** Gold ring that draws itself, then a check mark — a quiet celebration. */
const AnimatedSeal: React.FC = () => (
  <div className="relative mx-auto h-28 w-28">
    <motion.div
      aria-hidden
      className="absolute inset-0 rounded-full bg-gold-light/40 blur-2xl"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1.1 }}
      transition={{ duration: 1.4, ease: EASE_LUXURY }}
    />
    <svg viewBox="0 0 112 112" className="relative h-full w-full" aria-hidden>
      <motion.circle
        cx="56"
        cy="56"
        r="50"
        fill="none"
        className="stroke-gold"
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: EASE_LUXURY }}
      />
      <motion.circle
        cx="56"
        cy="56"
        r="40"
        className="fill-burgundy"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE_LUXURY, delay: 0.45 }}
      />
      <motion.path
        d="M38 57.5 L50.5 70 L75 44"
        fill="none"
        className="stroke-gold-light"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: EASE_LUXURY, delay: 0.95 }}
      />
    </svg>
  </div>
);

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
    <div className="container-content max-w-4xl pb-20 pt-10 md:pb-28 md:pt-16">
      <div className="text-center">
        <AnimatedSeal />
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE_LUXURY, delay: 0.6 }}>
          <p className="eyebrow mt-8">Request received</p>
          <h1 className="display-title mx-auto mt-4 max-w-2xl">
            Thank you — we have <em>your request</em>
          </h1>
          <Ornament className="mt-6" />
          <p className="lede mx-auto mt-5 max-w-xl">It has been saved to your account. Our team will contact you to confirm the details.</p>
          <div className="mt-8 flex justify-center">
            <RequestSteps current={3} complete />
          </div>
        </motion.div>
      </div>

      <Reveal className="card-luxe relative mt-10 overflow-hidden p-5 sm:p-7" delay={0.1}>
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-light via-gold to-gold-light" />
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-dark">Your reference</p>
            <p className="mt-1.5 break-all font-mono text-[1.35rem] tracking-wide text-burgundy sm:text-2xl">{orderId}</p>
          </div>
          <button type="button" onClick={copy} className="btn-secondary btn-sm min-h-[44px]" aria-live="polite">
            {copied ? <Check className="h-4 w-4 text-emerald-700" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            {copied ? 'Copied' : 'Copy reference'}
          </button>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          {status === 'loading' && <div className="skeleton h-56 rounded-card" aria-busy="true" />}
          {status === 'error' && (
            <LoadError message="Your request was saved, but we couldn’t load its summary. You can see it under Your requests." />
          )}
          {status === 'ready' && order && (
            <Reveal className="card-luxe p-5 sm:p-7">
              <section aria-labelledby="summary">
                <h2 id="summary" className="font-display text-[1.75rem] leading-tight">
                  What you requested
                </h2>
                <p className="mt-1 text-sm text-ink-faint">
                  Sent {formatDate(order.createdAt)} · Delivery to {order.deliveryCity}, {order.deliveryState}
                </p>
                <ul className="mt-4 divide-y divide-stone-deep/70">
                  {order.items.map(it => {
                    const sources = productImageSources(it.imageUrl);
                    return (
                      <li key={it.id} className="flex items-center gap-4 py-3.5">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-stone-deep/60 bg-gradient-to-b from-ivory-light to-stone p-1">
                          {sources && <Picture sources={sources} sizes="64px" width={128} height={128} alt="" className="h-full w-full object-contain" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-[1.1rem] font-medium leading-snug">{it.name}</p>
                          <p className="text-[0.8125rem] text-ink-faint">
                            Qty {it.quantity}
                            {it.variant ? ` · ${it.variant}` : ''}
                          </p>
                        </div>
                        <PriceText value={it.indicativePrice === null ? null : it.indicativePrice * it.quantity} className="whitespace-nowrap text-sm font-medium text-ink" />
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 flex items-baseline justify-between border-t border-stone-deep/70 pt-4">
                  <span className="text-sm text-ink-soft">Estimated total</span>
                  <span className="font-display text-[1.6rem] font-semibold leading-none text-burgundy lining-nums">
                    {order.indicativeSubtotal === null ? 'Price on request' : formatPrice(order.indicativeSubtotal)}
                  </span>
                </p>
              </section>
            </Reveal>
          )}
        </div>

        <Reveal className="md:col-span-2" delay={0.15}>
          <section className="relative overflow-hidden rounded-card bg-gradient-to-b from-burgundy to-burgundy-deep p-6 text-ivory shadow-card sm:p-7" aria-labelledby="next">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
            <h2 id="next" className="relative font-display text-[1.75rem] leading-tight text-ivory">
              What happens <em className="text-gold-light">next</em>
            </h2>
            <ol className="relative mt-6 space-y-6">
              {NEXT_STEPS.map((step, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <li key={step} className="relative flex gap-4">
                    {i < NEXT_STEPS.length - 1 && <span aria-hidden className="absolute left-[17px] top-10 h-[calc(100%-1rem)] w-px bg-gold/40" />}
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gold-light/50 bg-white/10 text-gold-light">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="pt-1.5 text-[0.9375rem] leading-relaxed text-ivory/85">
                      <span className="sr-only">Step {i + 1}: </span>
                      {step}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        </Reveal>
      </div>

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
