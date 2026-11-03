import React from 'react';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { Bullets, Note, PolicyLayout, SELLER, type PolicySection } from './TermsPage';

const SECTIONS: PolicySection[] = [
  {
    id: 'summary',
    title: 'In short',
    content: (
      <Bullets
        items={[
          'Change or withdraw a request any time before we confirm it — nothing is charged.',
          'Cancel a confirmed order free of charge before dispatch.',
          'Report damage in transit within 48 hours of delivery, with photos and an unboxing video. We replace or refund the damaged pieces after checking.',
          'No returns for a change of mind on devotional items, or on bulk, custom or personalised orders.',
          'Approved refunds reach your original payment method within 7–10 working days.'
        ]}
      />
    )
  },
  {
    id: 'requests',
    title: 'Changing or withdrawing a request',
    content: (
      <p>
        A request is not an order until we confirm it in writing and payment terms are agreed. Until then you can change it or withdraw it at no cost — just
        reply on WhatsApp or email us with your request reference.
      </p>
    )
  },
  {
    id: 'cancel',
    title: 'Cancelling a confirmed order',
    content: (
      <>
        <Bullets
          items={[
            <>
              <strong>Before dispatch:</strong> you can cancel free of charge. Anything you have paid is refunded in full.
            </>,
            <>
              <strong>After dispatch:</strong> delivery charges are not refundable. If the parcel comes back to us unopened and in its original condition, we
              refund the product amount once it reaches us, less the delivery charges (including the cost of the return trip).
            </>,
            'For specially sourced or personalised orders, we will tell you when we confirm the order if any part of the payment cannot be refunded once sourcing or work has started. Nothing is held back unless we told you beforehand.'
          ]}
        />
        <p>To cancel, message us on the WhatsApp chat where we confirmed your order, or email us with your request reference.</p>
      </>
    )
  },
  {
    id: 'damage',
    title: 'Damaged, wrong or missing items',
    content: (
      <>
        <p>We pack every order carefully, but if something reaches you damaged, wrong or short in quantity, we will make it right.</p>
        <Note>
          Report it within <strong>48 hours of delivery</strong>, with clear photos of the damaged pieces and the box, and an{' '}
          <strong>uncut unboxing video</strong> that starts from the sealed parcel.
        </Note>
        <Bullets
          items={[
            'Send the photos and video on WhatsApp or by email, with your request reference.',
            'We check them, usually within 2 working days. We may ask for a few more photos.',
            'Once verified, we replace the damaged, wrong or missing pieces, or refund them if a replacement is not available or if you prefer a refund.',
            'Please keep the damaged pieces and packing until we tell you otherwise — we may ask for them to be returned, at our cost.'
          ]}
        />
        <p>
          The unboxing video protects both of us and helps us settle your claim with the courier quickly. Without it, or after 48 hours, we will still look at
          your report, but we may not be able to approve it.
        </p>
      </>
    )
  },
  {
    id: 'not-covered',
    title: 'What we cannot accept for return',
    content: (
      <>
        <p>For reasons of hygiene, sanctity and sourcing, we do not accept returns or exchanges for:</p>
        <Bullets
          items={[
            'a change of mind on devotional items (god frames, stotram frames and cards, photo stands);',
            'bulk, wholesale, custom or personalised orders;',
            'small differences in colour, shine or finish — photos are for representation, foil and handcrafted finishes vary slightly from piece to piece, and screens show colours differently;',
            'damage caused after delivery, for example by falls, moisture or improper handling.'
          ]}
        />
        <p>None of this affects a genuine claim for damaged, wrong or missing items, which we always handle as described above.</p>
      </>
    )
  },
  {
    id: 'refunds',
    title: 'How refunds are paid',
    content: (
      <>
        <p>
          Approved refunds are sent to your <strong>original payment method</strong> (for example, the same UPI ID or bank account you paid from) within{' '}
          <strong>7–10 working days</strong> of approval. We will share the transaction reference with you. Your bank may take a little longer to show it.
        </p>
        <p>We never ask for your OTP, card PIN or UPI PIN to send a refund.</p>
      </>
    )
  },
  {
    id: 'how',
    title: 'How to raise a request',
    content: (
      <>
        <Bullets
          items={[
            <>
              Email <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>
              {SELLER.whatsapp ? <> or WhatsApp {SELLER.whatsapp}</> : <> or reply on the WhatsApp chat where we confirmed your order</>}.
            </>,
            'Include your name, phone number, request reference, what went wrong, and the photos and unboxing video.',
            'We acknowledge within 48 hours and keep you updated until it is resolved.'
          ]}
        />
        <p>
          If you are not satisfied with how we handled it, you can raise it with our Grievance Officer — details are in our{' '}
          <Link to="/terms">Terms &amp; Conditions</Link>.
        </p>
      </>
    )
  },
  {
    id: 'rights',
    title: 'Your rights',
    content: (
      <p>
        This policy does not take away any of your rights as a consumer under the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules,
        2020. If a product is defective or not as described, you are entitled to a remedy under the law.
      </p>
    )
  }
];

export const RefundPolicyPage: React.FC = () => {
  usePageMeta(
    'Cancellation, Returns & Refunds',
    'SWAYARI cancellation, returns and refund policy: free cancellation before dispatch, 48-hour damage reporting with unboxing video, refunds in 7–10 working days.'
  );
  return (
    <PolicyLayout
      title={
        <>
          Cancellation, Returns &amp; <em>Refunds</em>
        </>
      }
      intro="What you can cancel, what we replace or refund, and how quickly — fair and simple."
      sections={SECTIONS}
      current="/refund-policy"
    />
  );
};
