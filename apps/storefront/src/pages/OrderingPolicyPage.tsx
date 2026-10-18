import React from 'react';
import { usePageMeta } from '../lib/meta';
import { PageIntro } from '../components/States';
import { OrderDisclaimer } from '../components/ui';

const SECTIONS = [
  {
    title: 'Requests, not online purchases',
    body: 'SWAYARI does not take card, UPI or bank payments on this website and has no online payment gateway. Adding pieces to your bag and sending a request lets our team know what you are interested in. It does not confirm a purchase or reserve stock.'
  },
  {
    title: 'What happens after you send a request',
    body: 'Your request is saved to your account with a reference beginning “SW-”. Our team reviews it and contacts you on the mobile number or email you provided to confirm availability, final pricing, shipping charges and delivery details. You can see each request and its status under “Your requests”.'
  },
  {
    title: 'Prices',
    body: 'Where a price is shown it is indicative. Many pieces are listed as “Price on request”. The final price is confirmed by our team. If we send you a quotation, it appears in your account; any later revision is added as a new version rather than changing the original request.'
  },
  {
    title: 'Delivery',
    body: 'Requests can be sent for delivery addresses in India (a 6-digit PIN code is required). Packing, courier, charges and timing are discussed and confirmed with you for each request.'
  },
  {
    title: 'Changing or cancelling a request',
    body: 'Because nothing is confirmed until you agree it with our team, you can change or withdraw a request by replying to us or writing to swayarienterprises@gmail.com with your reference.'
  }
];

export const OrderingPolicyPage: React.FC = () => {
  usePageMeta('How ordering works', 'How SWAYARI order requests work: no online payment, personal confirmation of availability, pricing and delivery.');
  return (
    <div className="container-content max-w-3xl pb-20 md:pb-28">
      <PageIntro eyebrow="Help" title="How ordering works" />
      <OrderDisclaimer className="mt-10" />
      <div className="mt-12 space-y-10">
        {SECTIONS.map((s, i) => (
          <section key={s.title} aria-labelledby={`policy-${i}`}>
            <h2 id={`policy-${i}`} className="text-[1.75rem] leading-tight">
              {s.title}
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
};
