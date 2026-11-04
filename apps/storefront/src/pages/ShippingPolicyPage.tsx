import React from 'react';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { Bullets, Note, PolicyLayout, SELLER, type PolicySection } from './TermsPage';

const SECTIONS: PolicySection[] = [
  {
    id: 'where',
    title: 'Where we deliver',
    content: (
      <p>
        We deliver across India through trusted courier partners. A complete address with a valid 6-digit PIN code is needed. For some remote PIN codes, delivery
        can take longer or may need a different courier — we will tell you when we confirm your order.
      </p>
    )
  },
  {
    id: 'dispatch',
    title: 'When we dispatch',
    content: (
      <>
        <p>Dispatch time starts once your order is confirmed in writing and payment (or the agreed advance) is received.</p>
        <Bullets
          items={[
            <>
              <strong>Ready stock:</strong> usually dispatched within 2–4 working days.
            </>,
            <>
              <strong>Bulk, wholesale and specially sourced orders:</strong> dispatched on the date we confirm with you in writing, as these depend on supplier
              stock.
            </>,
            'Working days are Monday to Saturday, not counting public holidays.'
          ]}
        />
      </>
    )
  },
  {
    id: 'delivery-time',
    title: 'How long delivery takes',
    content: (
      <>
        <p>
          After dispatch, most parcels reach cities within about 3–7 working days, depending on your location and the courier. Smaller towns and remote areas can
          take longer. These are estimates from the courier, not guaranteed dates.
        </p>
        <Note>
          Need it for a wedding, griha pravesh or other function? Tell us the date when you send your request. We will tell you honestly whether it can reach you
          in time, and we suggest ordering at least two weeks before the event for bulk orders.
        </Note>
      </>
    )
  },
  {
    id: 'charges',
    title: 'Delivery charges',
    content: (
      <>
        <p>
          <strong>Delivery is not included in the product price.</strong> It is charged at actual cost, based on your location and the size and weight of the
          parcel. Large frames and big bulk orders cost more to send safely.
        </p>
        <p>Our team tells you the exact delivery charge before dispatch, along with the final amount. You pay it only after you have agreed to it.</p>
      </>
    )
  },
  {
    id: 'packing',
    title: 'Packing',
    content: (
      <p>
        Every order is packed with protective material for safe travel. Frames, and large frames in particular, get extra padding and corner
        protection. Big orders may be sent in more than one box, which can arrive on different days.
      </p>
    )
  },
  {
    id: 'tracking',
    title: 'Tracking your parcel',
    content: (
      <p>
        Once your order is dispatched, we share the courier name and tracking number with you on WhatsApp (or by email if you prefer). If tracking has not
        moved for a few days, message us and we will follow up with the courier.
      </p>
    )
  },
  {
    id: 'address',
    title: 'Your address and phone number',
    content: (
      <Bullets
        items={[
          'Please give a complete address — house number, street, landmark, city, state and PIN code — and a phone number that will be reachable on delivery.',
          'Check the address carefully when we confirm your order. Once a parcel is dispatched, the address usually cannot be changed.',
          'If a parcel comes back to us because the address was wrong or incomplete, or no one was available to receive it, the cost of sending it again is payable by you.'
        ]}
      />
    )
  },
  {
    id: 'receiving',
    title: 'When your parcel arrives',
    content: (
      <>
        <p>
          Please check that the outer box is sealed and undamaged. If it is badly damaged or looks opened, you may refuse it and tell us straight away.
        </p>
        <p>
          <strong>Record a clear, uncut unboxing video</strong> from the sealed box to the last piece. If anything is damaged, broken or missing, report it to us
          within <strong>48 hours of delivery</strong> with photos and the video. See our{' '}
          <Link to="/refund-policy">Cancellation, Returns &amp; Refunds policy</Link> for what happens next.
        </p>
      </>
    )
  },
  {
    id: 'delays',
    title: 'Delays outside our control',
    content: (
      <p>
        Sometimes deliveries are delayed by things we cannot control — heavy rain or floods, festivals and peak seasons, strikes, government restrictions, courier
        network problems or supplier delays. If this happens, we will keep you informed and help find the best way forward. We are not responsible for losses
        caused by such delays, but you may cancel an order that has not been dispatched, free of charge.
      </p>
    )
  },
  {
    id: 'questions',
    title: 'Questions about delivery',
    content: (
      <p>
        Write to <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>
        {SELLER.whatsapp ? <> or WhatsApp us on {SELLER.whatsapp}</> : null} with your request reference, or reply on the WhatsApp chat where we confirmed your
        order.
      </p>
    )
  }
];

export const ShippingPolicyPage: React.FC = () => {
  usePageMeta(
    'Shipping & Delivery',
    'SWAYARI delivers across India by courier. Ready stock dispatched in 2–4 working days; delivery charged at actual cost and confirmed before dispatch.'
  );
  return (
    <PolicyLayout
      title={
        <>
          Shipping &amp; <em>Delivery</em>
        </>
      }
      intro="How and when your order is packed, sent and delivered across India."
      sections={SECTIONS}
      current="/shipping-policy"
    />
  );
};
