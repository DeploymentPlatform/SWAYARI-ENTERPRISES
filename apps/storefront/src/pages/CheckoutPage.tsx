import React, { useEffect, useRef, useState } from 'react';
import { formatPrice, OCCASIONS, validateOrderSubmission } from '@swayari/shared';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../lib/router';
import { productImageSources } from '../lib/media';
import { usePageMeta } from '../lib/meta';
import { EmptyState, PageIntro } from '../components/States';
import { OrderDisclaimer, Picture, PriceText, Spinner } from '../components/ui';

const KEY_STORAGE = 'swayari_request_key';

/** One idempotency key per bag: retries after a network error reuse it, so nothing is duplicated. */
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
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Pre-fill the name once the session has loaded (never overwrite what the customer typed).
  useEffect(() => {
    if (user?.name) setValues(v => (v.customerName ? v : { ...v, customerName: user.name }));
  }, [user?.name]);

  if (isLoading) {
    return <div className="container-content py-24 text-center text-ink-soft">Checking your account…</div>;
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
        <EmptyState title="Your bag is empty" body={<p>Add pieces to your bag before sending a request.</p>} action={{ to: '/shop', label: 'Explore the Collection' }} />
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
        throw new Error(data.error || 'We could not save your request. Your bag has been kept — please try again.');
      }
      // Only after the server has saved the request do we clear the bag and show success.
      try {
        sessionStorage.removeItem(KEY_STORAGE);
      } catch {
        /* ignore */
      }
      clearCart();
      navigate(`/order-confirmation/${encodeURIComponent(data.orderId)}`);
    } catch (err: any) {
      setServerError(err.message || 'We could not save your request. Your bag has been kept — please try again.');
      window.setTimeout(() => errorSummaryRef.current?.focus(), 0);
    } finally {
      setSubmitting(false);
    }
  }

  const errorEntries = Object.entries(errors).filter(([, v]) => v) as [Fields | 'items', string][];

  const field = (name: Fields, opts: { type?: string; autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; maxLength?: number; className?: string; hint?: string; textarea?: boolean; optional?: boolean } = {}) => (
    <div className={opts.className}>
      <label htmlFor={name} className="field-label">
        {LABELS[name]} {opts.optional && <span className="font-normal text-ink-soft">(optional)</span>}
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
        <p id={`${name}-hint`} className="mt-1.5 text-sm text-ink-soft">
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

  return (
    <div className="container-content pb-20 md:pb-28">
      <PageIntro eyebrow="Order request" title="Send your request">
        Share where to reach you and where the pieces would go. Our team will contact you before anything is confirmed.
      </PageIntro>

      <div className="grid gap-12 pt-10 lg:grid-cols-12 lg:gap-16">
        <form onSubmit={submit} noValidate className="space-y-10 lg:col-span-7" aria-describedby="request-disclaimer">
          {(errorEntries.length > 0 || serverError) && (
            <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="border-l-2 border-red-800 bg-red-50 px-5 py-4 text-sm text-red-900">
              {serverError ? (
                <p>{serverError}</p>
              ) : (
                <>
                  <p className="font-medium">Please check the following:</p>
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
            </div>
          )}

          <fieldset className="space-y-5">
            <legend className="mb-2 font-display text-[1.75rem]">Your details</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              {field('customerName', { autoComplete: 'name', maxLength: 120 })}
              {field('customerPhone', { type: 'tel', autoComplete: 'tel-national', inputMode: 'numeric', maxLength: 14, hint: '10-digit Indian mobile number' })}
            </div>
            <div>
              <p className="field-label">Email</p>
              <p className="border border-stone-deep bg-stone px-3.5 py-3 text-ink-soft">{user.email}</p>
              <p className="mt-1.5 text-sm text-ink-soft">From your Google account.</p>
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="mb-2 font-display text-[1.75rem]">Delivery address</legend>
            {field('deliveryAddress', { textarea: true, autoComplete: 'street-address', maxLength: 500, hint: 'House or flat, building, street and landmark' })}
            <div className="grid gap-5 sm:grid-cols-3">
              {field('deliveryCity', { autoComplete: 'address-level2', maxLength: 80 })}
              {field('deliveryState', { autoComplete: 'address-level1', maxLength: 80 })}
              {field('deliveryPincode', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6 })}
            </div>
            {field('customerNotes', { textarea: true, optional: true, maxLength: 1000, hint: 'Special packaging instructions, notes, or gift card message' })}
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="mb-2 font-display text-[1.75rem]">Occasion & Celebration details</legend>
            <p className="text-sm text-ink-soft">
              Help our team prepare the most accurate quote, dispatch timeline, and bespoke packaging recommendation for your celebration.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="occasion-select" className="field-label">
                  Occasion or celebration <span className="font-normal text-ink-soft">(optional)</span>
                </label>
                <select
                  id="occasion-select"
                  value={occasion}
                  onChange={e => setOccasion(e.target.value)}
                  className="field-input"
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
              </div>
              <div>
                <label htmlFor="required-date" className="field-label">
                  Required by date <span className="font-normal text-ink-soft">(optional)</span>
                </label>
                <input
                  id="required-date"
                  type="date"
                  value={requiredDate}
                  onChange={e => setRequiredDate(e.target.value)}
                  className="field-input"
                />
                <p className="mt-1.5 text-xs text-ink-soft">
                  We suggest placing bulk orders at least 5–7 days prior to your celebration.
                </p>
              </div>
            </div>
            <label className="flex items-start gap-3 rounded border border-stone-deep bg-[#FAF8F5] p-3.5 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-burgundy"
                checked={isBulkRequest}
                onChange={e => setIsBulkRequest(e.target.checked)}
              />
              <span>
                <span className="font-medium text-ink">This is a bulk or return gifting request</span>
                <span className="block text-xs text-ink-soft">
                  Our team will check special volume packaging, customized tags, and tiered pricing for your celebration.
                </span>
              </span>
            </label>
          </fieldset>

          <div id="request-disclaimer">
            <OrderDisclaimer />
          </div>

          <button type="submit" className="btn-primary w-full sm:w-auto sm:min-w-[260px]" disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <>
                <Spinner /> Sending your request…
              </>
            ) : (
              'Send request'
            )}
          </button>
        </form>

        <aside className="lg:col-span-5" aria-labelledby="checkout-summary">
          <div className="bg-stone p-6 md:p-8 lg:sticky lg:top-28">
            <div className="flex items-baseline justify-between">
              <h2 id="checkout-summary" className="text-[1.75rem]">
                Your bag
              </h2>
              <Link to="/cart" className="text-sm text-ink-soft underline underline-offset-4 hover:text-burgundy">
                Edit
              </Link>
            </div>
            <ul className="mt-5 divide-y divide-stone-deep">
              {items.map(it => {
                const sources = productImageSources(it.image);
                return (
                  <li key={`${it.productId}-${it.selectedVariant || ''}`} className="flex gap-4 py-4">
                    <div className="w-16 flex-shrink-0 bg-ivory">
                      {sources && <Picture sources={sources} sizes="64px" width={128} height={160} alt="" className="aspect-product w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg leading-snug">{it.name}</p>
                      <p className="text-sm text-ink-soft">
                        Qty {it.quantity}
                        {it.selectedVariant ? ` · ${it.selectedVariant}` : ''}
                      </p>
                    </div>
                    <PriceText value={it.indicativePrice === null ? null : it.indicativePrice * it.quantity} className="whitespace-nowrap text-sm text-ink-soft" />
                  </li>
                );
              })}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-stone-deep pt-4 text-[0.9375rem]">
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
