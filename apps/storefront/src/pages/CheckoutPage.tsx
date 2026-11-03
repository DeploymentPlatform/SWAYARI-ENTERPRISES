import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Lock, Mail } from 'lucide-react';
import { formatPrice, OCCASIONS, validateOrderSubmission } from '@swayari/shared';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../lib/router';
import { productImageSources } from '../lib/media';
import { usePageMeta } from '../lib/meta';
import { EmptyState, PageIntro, RequestSteps } from '../components/States';
import { EASE_LUXURY } from '../components/motion';
import { OrderDisclaimer, Picture, PriceText, Spinner } from '../components/ui';

const KEY_STORAGE = 'swayari_request_key';

/** One idempotency key per cart: retries after a network error reuse it, so nothing is duplicated. */
function requestKey(): string {
  try {
    const existing = sessionStorage.getItem(KEY_STORAGE);
    if (existing) return existing;
    const created = `req-${crypto.randomUUID()}`;
    sessionStorage.setItem(KEY_STORAGE, created);
    return created;
  } catch {
    return `req-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

type Fields = 'customerName' | 'customerPhone' | 'deliveryAddress' | 'deliveryCity' | 'deliveryState' | 'deliveryPincode' | 'customerNotes';

const LABELS: Record<Fields, string> = {
  customerName: 'Full name',
  customerPhone: 'Mobile number',
  deliveryAddress: 'Address',
  deliveryCity: 'City',
  deliveryState: 'State',
  deliveryPincode: 'PIN code',
  customerNotes: 'Anything else we should know?'
};

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, hasUnpricedItems, clearCart } = useCart();
  const { user, isLoading, initiateGoogleSignIn } = useAuth();
  const { navigate } = useRouter();
  usePageMeta('Send your request', undefined, { noindex: true });

  const isBulkCart = items.some(it => it.quantity >= 10 || (it.minQuantity && it.minQuantity >= 10));

  const [values, setValues] = useState<Record<Fields, string>>({
    customerName: user?.name || '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryPincode: '',
    customerNotes: ''
  });
  const [occasion, setOccasion] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [isBulkRequest, setIsBulkRequest] = useState(isBulkCart);

  useEffect(() => {
    if (isBulkCart) {
      setIsBulkRequest(true);
    }
  }, [isBulkCart]);

  const [errors, setErrors] = useState<Partial<Record<Fields | 'items', string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Pre-fill the name once the session has loaded (never overwrite what the customer typed).
  useEffect(() => {
    if (user?.name) setValues(v => (v.customerName ? v : { ...v, customerName: user.name }));
  }, [user?.name]);

  if (isLoading) {
    return (
      <div className="container-content flex items-center justify-center gap-3 py-28 text-ink-soft" role="status">
        <Spinner className="h-5 w-5 text-gold" /> Checking your account…
      </div>
    );
  }
  if (!user) {
    return (
      <div className="container-content">
        <EmptyState
          title="Sign in to send your request"
          body={<p>We use your verified Google email to keep track of your request and its updates.</p>}
          secondary={
            <button type="button" className="btn-primary" onClick={() => initiateGoogleSignIn(undefined, 'checkout')}>
              Sign in with Google
            </button>
          }
        />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="container-content">
        <EmptyState title="Your cart is empty" body={<p>Add pieces to your cart before sending a request.</p>} action={{ to: '/shop', label: 'Explore the Collection' }} />
      </div>
    );
  }

  const set = (field: Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues(v => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors(err => ({ ...err, [field]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setServerError(null);

    const payload = {
      idempotencyKey: requestKey(),
      ...values,
      occasion: occasion.trim() || undefined,
      requiredDate: requiredDate.trim() || undefined,
      isBulkRequest: Boolean(isBulkRequest),
      items: items.map(it => ({
        productId: it.productId,
        productSku: it.sku,
        productName: it.name,
        selectedVariant: it.selectedVariant || null,
        quantity: it.quantity,
        customisationNote: it.customisationNote
      }))
    };

    const validation = validateOrderSubmission(payload);
    if (!validation.isValid) {
      const map: Partial<Record<Fields | 'items', string>> = {};
      validation.errors.forEach(err => {
        const key = (err.field.startsWith('items') ? 'items' : err.field) as Fields | 'items';
        if (!map[key]) map[key] = err.message;
      });
      setErrors(map);
      window.setTimeout(() => errorSummaryRef.current?.focus(), 0);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.orderId) {
        throw new Error(data.error || 'We could not save your request. Your cart has been kept — please try again.');
      }
      // Only after the server has saved the request do we clear the cart and show success.
      try {
        sessionStorage.removeItem(KEY_STORAGE);
      } catch {
        /* ignore */
      }
      clearCart();
      navigate(`/order-confirmation/${encodeURIComponent(data.orderId)}`);
    } catch (err: any) {
      setServerError(err.message || 'We could not save your request. Your cart has been kept — please try again.');
      window.setTimeout(() => errorSummaryRef.current?.focus(), 0);
    } finally {
      setSubmitting(false);
    }
  }

  const errorEntries = Object.entries(errors).filter(([, v]) => v) as [Fields | 'items', string][];

  const field = (name: Fields, opts: { type?: string; autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; maxLength?: number; className?: string; hint?: string; textarea?: boolean; optional?: boolean } = {}) => (
    <div className={opts.className}>
      <label htmlFor={name} className="field-label">
        {LABELS[name]} {opts.optional && <span className="font-normal text-ink-faint">(optional)</span>}
      </label>
      {opts.textarea ? (
        <textarea
          id={name}
          rows={name === 'deliveryAddress' ? 3 : 3}
          value={values[name]}
          onChange={set(name)}
          autoComplete={opts.autoComplete}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : opts.hint ? `${name}-hint` : undefined}
          className="field-input"
          maxLength={opts.maxLength}
        />
      ) : (
        <input
          id={name}
          type={opts.type || 'text'}
          value={values[name]}
          onChange={set(name)}
          autoComplete={opts.autoComplete}
          inputMode={opts.inputMode}
          maxLength={opts.maxLength}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : opts.hint ? `${name}-hint` : undefined}
          className="field-input"
        />
      )}
      {opts.hint && !errors[name] && (
        <p id={`${name}-hint`} className="mt-1.5 text-[0.8125rem] text-ink-faint">
          {opts.hint}
        </p>
      )}
      {errors[name] && (
        <p id={`${name}-error`} className="field-error">
          {errors[name]}
        </p>
      )}
    </div>
  );


  const sectionTitle = (n: number, title: string, sub?: string) => (
    <legend className="mb-1 flex w-full items-start gap-4">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold-pale/60 font-display text-[1.15rem] font-semibold text-gold-dark lining-nums">
        {n}
      </span>
      <span>
        <span className="block font-display text-[1.75rem] font-medium leading-tight text-ink">{title}</span>
        {sub && <span className="mt-1 block text-sm text-ink-soft">{sub}</span>}
      </span>
    </legend>
  );

  return (
    <div className="container-content pb-20 md:pb-28">
      <PageIntro eyebrow="Order request" title={<>Send your <em>request</em></>} after={<RequestSteps current={2} />}>
        Share where to reach you and where the pieces would go. Our team will contact you before anything is confirmed.
      </PageIntro>

      <div className="grid gap-8 pt-8 lg:grid-cols-12 lg:gap-14 lg:pt-10">
        <form onSubmit={submit} noValidate className="space-y-6 lg:col-span-7" aria-describedby="request-disclaimer">
          {(errorEntries.length > 0 || serverError) && (
            <motion.div
              ref={errorSummaryRef}
              tabIndex={-1}
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_LUXURY }}
              className="rounded-2xl border border-red-800/20 border-l-4 border-l-red-800 bg-red-50/80 px-5 py-4 text-sm text-red-900"
            >
              {serverError ? (
                <p>{serverError}</p>
              ) : (
                <>
                  <p className="font-semibold">Please check the following:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {errorEntries.map(([k, msg]) => (
                      <li key={k}>
                        {k === 'items' ? (
                          msg
                        ) : (
                          <a href={`#${k}`} className="underline underline-offset-2">
                            {LABELS[k as Fields]}: {msg}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </motion.div>
          )}

          <div className="card-luxe p-5 sm:p-7">
          <fieldset className="space-y-5">
            {sectionTitle(1, 'Your details')}
            <div className="grid gap-5 sm:grid-cols-2">
              {field('customerName', { autoComplete: 'name', maxLength: 120 })}
              {field('customerPhone', { type: 'tel', autoComplete: 'tel-national', inputMode: 'numeric', maxLength: 14, hint: '10-digit Indian mobile number' })}
            </div>
            <div>
              <p className="field-label">Email</p>
              <p className="flex items-center gap-3 rounded-xl border border-stone-deep bg-stone/70 px-4 py-3 text-ink-soft">
                <Mail className="h-4 w-4 flex-shrink-0 text-gold-dark" aria-hidden />
                <span className="min-w-0 break-all">{user.email}</span>
                <Lock className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-ink-faint" aria-hidden />
              </p>
              <p className="mt-1.5 text-[0.8125rem] text-ink-faint">From your Google account.</p>
            </div>
          </fieldset>
          </div>

          <div className="card-luxe p-5 sm:p-7">
          <fieldset className="space-y-5">
            {sectionTitle(2, 'Delivery address')}
            {field('deliveryAddress', { textarea: true, autoComplete: 'street-address', maxLength: 500, hint: 'House or flat, building, street and landmark' })}
            <div className="grid gap-5 sm:grid-cols-3">
              {field('deliveryCity', { autoComplete: 'address-level2', maxLength: 80 })}
              {field('deliveryState', { autoComplete: 'address-level1', maxLength: 80 })}
              {field('deliveryPincode', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6 })}
            </div>
            {field('customerNotes', { textarea: true, optional: true, maxLength: 1000, hint: 'Special packaging instructions, notes, or gift card message' })}
          </fieldset>
          </div>

          <div className="card-luxe p-5 sm:p-7">
          <fieldset className="space-y-5">
            {sectionTitle(
              3,
              'Occasion & Celebration details',
              'Help our team prepare the most accurate quote, dispatch timeline, and bespoke packaging recommendation for your celebration.'
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="occasion-select" className="field-label">
                  Occasion or celebration <span className="font-normal text-ink-faint">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    id="occasion-select"
                    value={occasion}
                    onChange={e => setOccasion(e.target.value)}
                    className="field-input cursor-pointer appearance-none pr-11"
                  >
                    <option value="">Select an occasion</option>
                    {OCCASIONS.map(o => (
                      <option key={o.id} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                    <option value="Birthday & Milestone">Birthday & Milestone</option>
                    <option value="Festive Pooja">Festive Pooja</option>
                    <option value="Personal Gifting">Personal Gifting</option>
                    <option value="Other">Other celebration</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
                </div>
              </div>
              <div>
                <label htmlFor="required-date" className="field-label">
                  Required by date <span className="font-normal text-ink-faint">(optional)</span>
                </label>
                <input id="required-date" type="date" value={requiredDate} onChange={e => setRequiredDate(e.target.value)} className="field-input min-h-[50px]" />
                <p className="mt-1.5 text-[0.8125rem] text-ink-faint">We suggest placing bulk orders at least 5–7 days prior to your celebration.</p>
              </div>
            </div>
            <label
              className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 text-sm transition-all duration-300 ease-luxury ${
                isBulkRequest ? 'border-gold/60 bg-gold-pale/40 shadow-gold' : 'border-stone-deep bg-ivory-light hover:border-gold/50'
              }`}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer accent-burgundy"
                checked={isBulkRequest}
                onChange={e => setIsBulkRequest(e.target.checked)}
              />
              <span>
                <span className="font-semibold text-ink">This is a bulk or return gifting request</span>
                <span className="mt-0.5 block text-[0.8125rem] text-ink-soft">
                  Our team will plan packing and delivery timing around your function date.
                </span>
              </span>
            </label>
          </fieldset>
          </div>

          <div id="request-disclaimer">
            <OrderDisclaimer />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button type="submit" className="btn-primary w-full sm:w-auto sm:min-w-[260px]" disabled={submitting} aria-busy={submitting}>
              {submitting ? (
                <>
                  <Spinner /> Sending your request…
                </>
              ) : (
                'Send request'
              )}
            </button>
            <p className="flex items-center justify-center gap-2 text-[0.8125rem] text-ink-faint sm:justify-start">
              <Lock className="h-3.5 w-3.5" aria-hidden /> No payment is taken online.
            </p>
          </div>
        </form>

        <aside className="order-first lg:order-none lg:col-span-5" aria-labelledby="checkout-summary">
          <div className="card-luxe relative overflow-hidden p-5 sm:p-7 lg:sticky lg:top-28">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-light via-gold to-gold-light" />
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="checkout-summary" className="font-display text-[1.75rem] leading-tight">
                Your cart
              </h2>
              <Link to="/cart" className="link-underline text-sm font-semibold text-burgundy">
                Edit
              </Link>
            </div>

            <button
              type="button"
              className="mt-3 flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border border-stone-deep bg-ivory-light px-4 text-sm text-ink-soft lg:hidden"
              aria-expanded={summaryOpen}
              aria-controls="checkout-items"
              onClick={() => setSummaryOpen(o => !o)}
            >
              <span>
                {summaryOpen ? 'Hide' : 'Show'} {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
              <ChevronDown className={`h-4 w-4 text-gold transition-transform duration-500 ease-luxury ${summaryOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>

            <ul id="checkout-items" className={`mt-4 divide-y divide-stone-deep/70 ${summaryOpen ? 'block' : 'hidden'} lg:block`}>
              {items.map(it => {
                const sources = productImageSources(it.image);
                return (
                  <li key={`${it.productId}-${it.selectedVariant || ''}`} className="flex items-center gap-4 py-3.5">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-stone-deep/60 bg-gradient-to-b from-ivory-light to-stone p-1">
                      {sources && <Picture sources={sources} sizes="64px" width={128} height={128} alt="" className="h-full w-full object-contain" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[1.1rem] font-medium leading-snug">{it.name}</p>
                      <p className="text-[0.8125rem] text-ink-faint">
                        Qty {it.quantity}
                        {it.selectedVariant ? ` · ${it.selectedVariant}` : ''}
                      </p>
                    </div>
                    <PriceText value={it.indicativePrice === null ? null : it.indicativePrice * it.quantity} className="whitespace-nowrap text-sm font-medium text-ink" />
                  </li>
                );
              })}
            </ul>
            <dl className="mt-4 space-y-2.5 border-t border-stone-deep/70 pt-4 text-[0.9375rem]">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-medium text-ink">Items subtotal</dt>
                <dd className="text-right font-display text-[1.6rem] font-semibold leading-none text-burgundy lining-nums">
                  {subtotal === null ? 'Price on request' : formatPrice(subtotal)}
                  {subtotal !== null && hasUnpricedItems && <span className="mt-1 block font-sans text-sm font-normal text-ink-soft">+ items priced on request</span>}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Delivery</dt>
                <dd className="text-right font-medium text-ink">Extra, at actual cost</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Payment</dt>
                <dd className="text-right text-ink-soft">Not taken online</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
};
