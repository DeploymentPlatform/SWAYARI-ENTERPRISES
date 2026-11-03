import React from 'react';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { Bullets, Note, PolicyLayout, SELLER, type PolicySection } from './TermsPage';

const STEPS: { title: string; text: React.ReactNode }[] = [
  {
    title: 'Browse and choose',
    text: 'Pick the products you like and choose a size. Prices are shown per piece for each quantity slab.'
  },
  {
    title: 'Add to cart',
    text: 'Add as many designs and pieces as you like. Nothing is locked or reserved, so you can change your cart freely.'
  },
  {
    title: 'Send request',
    text: 'Sign in with Google, add your phone number, delivery address, occasion and the date you need it, and press “Send request”.'
  },
  {
    title: 'We call or WhatsApp you',
    text: 'Our team confirms availability, the final amount and the delivery charges with you personally.'
  },
  {
    title: 'Confirmation and payment',
    text: 'We confirm your order in writing on WhatsApp or email and share payment details. Your order is confirmed once payment terms are agreed.'
  },
  {
    title: 'Packed and dispatched',
    text: 'We pack your order carefully, dispatch it by courier and send you the tracking details on WhatsApp.'
  }
];

const Steps: React.FC = () => (
  <ol className="space-y-4">
    {STEPS.map((step, i) => (
      <li key={step.title} className="flex gap-4">
        <span
          aria-hidden
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold-pale/70 font-display text-[1.1rem] font-semibold text-burgundy"
        >
          {i + 1}
        </span>
        <div className="min-w-0 pt-1">
          <p className="font-semibold text-ink">
            <span className="sr-only">Step {i + 1}: </span>
            {step.title}
          </p>
          <p className="mt-1">{step.text}</p>
        </div>
      </li>
    ))}
  </ol>
);

const SLAB_GROUPS = [
  { caption: 'Gift items', note: 'Stotram frames and flip frames, stotram cards, photo stands', slabs: ['1–9', '10–49', '50–99', '100+'] },
  { caption: 'God frames and wall frames', note: 'Silver foil and colour god frames, large wall frames', slabs: ['1–2', '3–9', '10–24', '25+'] }
];

const SlabTables: React.FC = () => (
  <div className="grid gap-5 sm:grid-cols-2">
    {SLAB_GROUPS.map(group => (
      <div key={group.caption}>
        <p className="font-semibold text-ink">{group.caption}</p>
        <p className="text-[0.875rem] leading-snug text-ink-soft">{group.note}</p>
        <div className="mt-2.5 overflow-hidden rounded-2xl border border-stone-deep/80 bg-white/80">
          <table className="w-full text-left text-[0.9375rem]">
            <caption className="sr-only">Quantity slabs for {group.caption.toLowerCase()}</caption>
            <thead>
              <tr className="bg-gold-pale/50">
                <th scope="col" className="px-4 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-gold-dark">
                  Slab
                </th>
                <th scope="col" className="px-4 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-gold-dark">
                  Total pieces
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-deep/70">
              {group.slabs.map((range, i) => (
                <tr key={range}>
                  <td className="px-4 py-2.5 text-ink/80">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-ink">{range} pcs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
);

const SECTIONS: PolicySection[] = [
  {
    id: 'steps',
    title: 'Ordering in six steps',
    content: <Steps />
  },
  {
    id: 'request',
    title: 'A request is not a purchase',
    content: (
      <>
        <p>
          <strong>No payment is taken on this website.</strong> Sending a request simply tells our team what you would like. It does not reserve stock or
          confirm a sale.
        </p>
        <Note>
          Your order is confirmed only when SWAYARI confirms it to you in writing (on WhatsApp or email) and payment terms are agreed.
        </Note>
        <p>
          You can see every request you have sent, and its status, under{' '}
          <Link to="/account/orders">Your requests</Link> after signing in.
        </p>
      </>
    )
  },
  {
    id: 'slabs',
    title: 'How slab pricing works',
    content: (
      <>
        <p>
          Prices are per piece, in Indian Rupees. Each product has <strong>four quantity slabs</strong> — the more pieces you order, the lower the price per
          piece.
        </p>
        <p>
          The slab is decided by the <strong>total quantity of the same product in the same size</strong> across your whole order. You can{' '}
          <strong>mix designs</strong> to reach a slab — for example, different deities or different stotrams of the same product and size all count together.
        </p>
        <SlabTables />
        <p>
          The price for each slab is shown on the product page. Where an MRP is shown struck through, the slab price is what you pay.
        </p>
      </>
    )
  },
  {
    id: 'example',
    title: 'A worked example',
    content: (
      <>
        <p>
          Say you want <strong>60 silver foil stotram cards</strong> as return gifts — 10 each of 6 different stotram designs, all the same size.
        </p>
        <div className="overflow-hidden rounded-2xl border border-gold/35 bg-white/85">
          <dl className="divide-y divide-stone-deep/70">
            {(
              [
                ['Total pieces', '6 designs × 10 = 60 cards'],
                ['Slab reached', '50–99 pcs'],
                ['Price per card in that slab', '₹49'],
                ['Product amount', '60 × ₹49 = ₹2,940']
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5 px-5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <dt className="text-ink/80">{label}</dt>
                <dd className="font-semibold text-ink">{value}</dd>
              </div>
            ))}
            <div className="flex flex-col gap-0.5 bg-gold-pale/45 px-5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <dt className="font-semibold text-ink">You pay</dt>
              <dd className="font-display text-[1.35rem] font-semibold text-burgundy">₹2,940 + delivery</dd>
            </div>
          </dl>
        </div>
        <p>
          Even though no single design reaches 50 pieces, all 60 cards count together, so every card gets the 50–99 slab price. (₹49 is used here only as an
          example; the current price is always on the product page.)
        </p>
      </>
    )
  },
  {
    id: 'large',
    title: 'Very large orders',
    content: (
      <p>
        The last slab (100+ pieces for gift items, 25+ for god frames and wall frames) is the best listed price. For larger quantities — weddings, functions,
        shops and corporate gifting — ask us for a <strong>special quote</strong>. Mention the products, quantities and the date you need them by.
      </p>
    )
  },
  {
    id: 'prices',
    title: 'Prices, taxes and delivery',
    content: (
      <Bullets
        items={[
          'Prices are inclusive of applicable taxes unless stated otherwise.',
          <>
            <strong>Delivery is extra.</strong> It is charged at actual cost based on your location and parcel size, and confirmed with you before dispatch. See
            our <Link to="/shipping-policy">Shipping &amp; Delivery policy</Link>.
          </>,
          'Prices on the website may change. The price we confirm to you in writing for your order is final for that order.'
        ]}
      />
    )
  },
  {
    id: 'payment',
    title: 'Paying for your order',
    content: (
      <>
        <p>
          After confirmation, our team shares payment details with you on WhatsApp or email. For bulk orders we may ask for an advance, with the balance before
          dispatch, as agreed in writing.
        </p>
        <p>
          Pay only to the details shared by SWAYARI from our official contact ({SELLER.email}). We will never ask for your OTP, card PIN or UPI PIN.
        </p>
      </>
    )
  },
  {
    id: 'changes',
    title: 'Changing or cancelling',
    content: (
      <p>
        Until we confirm your order, you can change or withdraw your request at no cost — just reply to us with your request reference. Once an order is
        confirmed, our <Link to="/refund-policy">Cancellation, Returns &amp; Refunds policy</Link> applies.
      </p>
    )
  }
];

export const OrderingPolicyPage: React.FC = () => {
  usePageMeta(
    'How ordering works',
    'How to order from SWAYARI: add to cart, send a request, we confirm by call or WhatsApp, then share payment details. Slab pricing explained; delivery extra.'
  );
  return (
    <PolicyLayout
      eyebrow="Help"
      title={
        <>
          How ordering <em>works</em>
        </>
      }
      intro="Add to cart, send a request, and our team confirms everything with you personally. No payment is taken on this website."
      sections={SECTIONS}
      current="/ordering-policy"
    />
  );
};
