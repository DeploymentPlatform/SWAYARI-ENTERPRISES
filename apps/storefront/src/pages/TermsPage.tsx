import React, { useEffect } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { PageIntro } from '../components/States';
import { LotusMark } from '../components/ui';

/* ------------------------------------------------------------------ Shared policy layout
 * The five policy pages (terms, privacy, shipping, refunds, ordering) share this layout and the
 * seller details below, so a change here updates every page at once.
 */

export const POLICY_LAST_UPDATED = { label: '4 November 2026', iso: '2026-11-04' };

/**
 * Seller details shown on the policy pages. Fill in `phone`, `whatsapp` or `address` once confirmed —
 * they then appear automatically (empty values are simply not shown).
 */
export const SELLER: {
  legalName: string;
  brand: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  website: string;
} = {
  legalName: 'SWAYARI ENTERPRISES',
  brand: 'SWAYARI — Décor & Gifting',
  email: 'swayarienterprises@gmail.com',
  phone: '',
  whatsapp: '',
  address: '',
  website: 'https://swayari.com'
};

export const POLICY_PAGES = [
  { to: '/terms', label: 'Terms & Conditions' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/shipping-policy', label: 'Shipping & Delivery' },
  { to: '/refund-policy', label: 'Cancellation, Returns & Refunds' },
  { to: '/ordering-policy', label: 'How ordering works' }
];

export interface PolicySection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const BODY =
  'mt-4 space-y-4 text-[1.0625rem] leading-[1.8] text-ink/90 [&_a]:font-medium [&_a]:text-burgundy [&_a]:underline [&_a]:decoration-gold/60 [&_a]:underline-offset-4 [&_a:hover]:decoration-burgundy [&_strong]:font-semibold [&_strong]:text-ink';

const pad = (n: number) => String(n).padStart(2, '0');

/** Bulleted list with the small gold diamond used across the site. */
export const Bullets: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="space-y-2.5">
    {items.map((item, i) => (
      <li key={i} className="relative pl-6">
        <span aria-hidden className="absolute left-0.5 top-[0.75em] h-1.5 w-1.5 rotate-45 bg-gold" />
        {item}
      </li>
    ))}
  </ul>
);

/** Soft gold call-out for the one line a reader must not miss. */
export const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl border border-gold/35 bg-gold-pale/45 px-5 py-4 text-[1rem] leading-relaxed text-ink">{children}</div>
);

/** Label / value pairs (seller details, grievance officer). */
export const DetailList: React.FC<{ rows: [string, React.ReactNode][] }> = ({ rows }) => (
  <dl className="divide-y divide-stone-deep/80 overflow-hidden rounded-2xl border border-stone-deep/80 bg-white/80">
    {rows.map(([label, value]) => (
      <div key={label} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
        <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-gold-dark">{label}</dt>
        <dd className="min-w-0 break-words text-[1rem] text-ink">{value}</dd>
      </div>
    ))}
  </dl>
);

/** Seller / grievance contact rows; phone, WhatsApp and address appear only once filled in above. */
export function sellerContactRows(): [string, React.ReactNode][] {
  const rows: [string, React.ReactNode][] = [['Email', <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>]];
  if (SELLER.phone) rows.push(['Phone', <a href={`tel:${SELLER.phone.replace(/[^\d+]/g, '')}`}>{SELLER.phone}</a>]);
  if (SELLER.whatsapp) rows.push(['WhatsApp', <a href={`https://wa.me/${SELLER.whatsapp.replace(/\D/g, '')}`}>{SELLER.whatsapp}</a>]);
  if (SELLER.address) rows.push(['Address', SELLER.address]);
  return rows;
}

function scrollToSection(id: string, instant = false) {
  const target = document.getElementById(id);
  if (!target) return;
  // Clicks: `html { scroll-behavior: smooth }` animates this (reduced-motion users get a jump).
  // Deep links on load jump instantly, since a long smooth scroll is cut short while the page settles.
  target.scrollIntoView({ block: 'start', behavior: (instant ? 'instant' : 'auto') as ScrollBehavior });
  const heading = document.getElementById(`${id}-title`);
  heading?.focus({ preventScroll: true });
}

/** In-page link to another section; plain hash links would make the site router jump to the top. */
export const SectionLink: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <a
    href={`#${id}`}
    onClick={event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      scrollToSection(id);
      try {
        window.history.replaceState(window.history.state, '', `#${id}`);
      } catch {
        // Safari rate-limits history writes; the scroll already happened.
      }
    }}
  >
    {children}
  </a>
);

export const PolicyLayout: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  intro: React.ReactNode;
  sections: PolicySection[];
  /** Path of the current page, left out of the "other policies" links. */
  current: string;
  /** Optional block between the table of contents and the first section. */
  lead?: React.ReactNode;
}> = ({ eyebrow = 'Policies', title, intro, sections, current, lead }) => {
  // Visitors arriving on a link like /terms#payment: the page renders after load, so scroll once it exists.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const timer = window.setTimeout(() => scrollToSection(id, true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  // Plain hash links would fire `popstate`, which the site router treats as "go back to the top".
  const onTocClick = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    scrollToSection(id);
    try {
      window.history.replaceState(window.history.state, '', `#${id}`);
    } catch {
      // Safari rate-limits history writes; the scroll already happened.
    }
  };

  return (
    <div className="container-content max-w-3xl pb-20 md:pb-28">
      <PageIntro eyebrow={eyebrow} title={title} align="center">
        <p className="text-ink/85">{intro}</p>
        <p className="mt-5 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Last updated <time dateTime={POLICY_LAST_UPDATED.iso}>{POLICY_LAST_UPDATED.label}</time>
        </p>
      </PageIntro>

      <nav aria-label="On this page" className="card-luxe p-6 sm:p-8">
        <p className="eyebrow">On this page</p>
        <ol className="mt-4 grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={onTocClick(s.id)}
                className="group flex items-baseline gap-3 py-1.5 text-[0.9375rem] leading-snug text-ink/85 transition-colors duration-300 hover:text-burgundy"
              >
                <span aria-hidden className="w-6 flex-shrink-0 font-display text-[1.05rem] italic text-gold-dark">
                  {pad(i + 1)}
                </span>
                <span className="decoration-gold/60 underline-offset-4 group-hover:underline">{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {lead && <div className="mt-8">{lead}</div>}

      <div className="mt-10 md:mt-14">
        {sections.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            aria-labelledby={`${s.id}-title`}
            className="grid scroll-mt-28 gap-3 border-t border-stone-deep/80 py-8 first:border-t-0 first:pt-0 sm:grid-cols-[4.5rem_1fr] sm:gap-6 md:py-10"
          >
            <span aria-hidden className="font-display text-[2.4rem] font-medium italic leading-none text-gold">
              {pad(i + 1)}
            </span>
            <div className="min-w-0">
              <h2 id={`${s.id}-title`} tabIndex={-1} className="font-display text-[1.75rem] font-medium leading-tight outline-none sm:text-[2rem]">
                {s.title}
              </h2>
              <div className={BODY}>{s.content}</div>
            </div>
          </section>
        ))}
      </div>

      <aside
        aria-labelledby="policy-contact"
        className="mt-4 rounded-card border border-gold/30 bg-gradient-to-br from-gold-pale/60 to-ivory-light px-6 py-10 text-center sm:px-10"
      >
        <LotusMark className="mx-auto h-6 w-10 text-gold-dark" />
        <h2 id="policy-contact" className="mt-4 font-display text-[1.9rem] font-medium leading-tight sm:text-[2.2rem]">
          Questions? <em className="text-burgundy">We are happy to help.</em>
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink/85">
          Write to us about this policy, a request or an order. Please mention your request reference if you have one. Our team replies personally.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={`mailto:${SELLER.email}`} className="btn-primary">
            <Mail className="h-4 w-4" aria-hidden />
            Email us
          </a>
          {SELLER.whatsapp ? (
            <a href={`https://wa.me/${SELLER.whatsapp.replace(/\D/g, '')}`} className="btn-secondary" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp us
            </a>
          ) : (
            <Link to="/contact" className="btn-secondary">
              Contact page
            </Link>
          )}
        </div>
        <p className="mt-5 break-all text-[0.9375rem] text-ink/80">{SELLER.email}</p>
      </aside>

      <nav aria-label="Other policies" className="mt-10 text-center">
        <p className="eyebrow">Other policies</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {POLICY_PAGES.filter(p => p.to !== current).map(p => (
            <li key={p.to}>
              <Link to={p.to} className="link-underline text-[0.9375rem] font-medium text-ink/85">
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

/* ------------------------------------------------------------------ Terms & Conditions */

const SECTIONS: PolicySection[] = [
  {
    id: 'about',
    title: 'About these terms',
    content: (
      <>
        <p>
          This website, <strong>swayari.com</strong>, is run by <strong>{SELLER.legalName}</strong>, a business based in India that trades under the brand “
          {SELLER.brand}”. In these terms, “SWAYARI”, “we”, “us” and “our” mean {SELLER.legalName}. “You” means anyone who visits the website or sends us a
          request.
        </p>
        <p>
          By using this website or sending us a request, you agree to these terms. They work together with our{' '}
          <Link to="/privacy-policy">Privacy Policy</Link>, <Link to="/shipping-policy">Shipping &amp; Delivery policy</Link>,{' '}
          <Link to="/refund-policy">Cancellation, Returns &amp; Refunds policy</Link> and <Link to="/ordering-policy">How ordering works</Link>. If you do not
          agree, please do not use the website.
        </p>
      </>
    )
  },
  {
    id: 'seller',
    title: 'Seller details',
    content: (
      <>
        <p>All products on this website are sold by:</p>
        <DetailList
          rows={[
            ['Legal name', SELLER.legalName],
            ['Brand', SELLER.brand],
            ['Type of business', 'Reseller of devotional gift products (retail and wholesale)'],
            ['Country', 'India'],
            ['Website', <a href={SELLER.website}>swayari.com</a>],
            ...sellerContactRows()
          ]}
        />
        <p>
          Our Grievance Officer’s details are under <SectionLink id="grievance">Complaints and Grievance Officer</SectionLink> below.
        </p>
      </>
    )
  },
  {
    id: 'what-we-do',
    title: 'What we sell, and how',
    content: (
      <>
        <p>
          SWAYARI is a <strong>reseller</strong>. We do not manufacture products. We source devotional gift products from manufacturers and suppliers and sell
          them to individual customers and to businesses — pooja stores, gift shops, return-gift buyers, families planning functions and companies looking for
          corporate gifts.
        </p>
        <p>Our range includes:</p>
        <Bullets
          items={[
            'Silver foil stotram frames and flip frames (Telugu stotrams)',
            'Silver foil stotram cards with red gift covers',
            'Silver foil god photo stands (acrylic)',
            'Silver foil god frames, including embossed designs',
            'Colour god frames'
          ]}
        />
      </>
    )
  },
  {
    id: 'descriptions',
    title: 'Product descriptions and images',
    content: (
      <>
        <p>We take care to describe every product honestly and accurately.</p>
        <Note>
          ‘Silver foil’ describes the decorative foil used in the artwork. Our products are decorative devotional articles; they are not precious-metal
          articles and are not sold by metal weight or purity.
        </Note>
        <Bullets
          items={[
            'Printed text on supplier packaging is part of the original product design.',
            'Photos are for representation. Foil work and handcrafted finishes can vary slightly in colour, shine and finish from piece to piece, and colours can look different on different screens.',
            'Sizes are approximate and may differ slightly from the listed measurements.',
            'Designs, frames and packaging can change when our suppliers update them. If a design you asked for has changed, we will tell you before you pay.'
          ]}
        />
        <p>If a detail matters to you, ask us before you confirm. We would rather answer directly than have you guess.</p>
      </>
    )
  },
  {
    id: 'prices',
    title: 'Prices and quantity slabs',
    content: (
      <>
        <Bullets
          items={[
            <>
              Prices are <strong>per piece, in Indian Rupees (₹)</strong>. Prices are inclusive of applicable taxes unless stated otherwise.
            </>,
            <>
              Each product has four quantity slabs. The slab is decided by the <strong>total quantity of that product in that size</strong> in your order, and
              you can mix designs to reach a slab. Gift items (including colour god frames): 1–9, 10–49, 50–99 and 100+ pieces. Silver foil god frames: 1–2, 3–9, 10–24 and 25+ pieces.
            </>,
            'Where an MRP is shown struck through, it is the maximum retail price printed by the supplier or set for the product; the price you pay is the slab price.',
            'For quantities larger than the last slab, ask us for a special quote.',
            <>
              <strong>Delivery charges are extra.</strong> They are charged at actual cost based on your location and confirmed before dispatch.
            </>,
            'Prices on the website may change without notice. The price we confirm to you in writing (on WhatsApp or email) for your order is final for that order.'
          ]}
        />
        <p>
          If a price on the website is clearly wrong because of a typing or technical error, we will tell you before you pay and you can choose whether to go
          ahead at the correct price. A worked example is on the <Link to="/ordering-policy">How ordering works</Link> page.
        </p>
      </>
    )
  },
  {
    id: 'requests',
    title: 'Order requests and confirmation',
    content: (
      <>
        <p>
          You can add products to your cart freely — nothing is locked or reserved. When you press <strong>“Send request”</strong>, your request reaches our team.
          We then call or WhatsApp you to confirm availability, the final amount and the delivery charges.
        </p>
        <Note>
          A request is not a confirmed sale. Your order is confirmed only when SWAYARI confirms it to you in writing (on WhatsApp or email) and payment terms are
          agreed.
        </Note>
        <p>
          We may accept a request in full or in part, suggest alternatives, or decline it (for example if a product is out of stock or we cannot deliver to the
          address). If we cannot fulfil any part of an order after you have paid, we will refund the amount for that part.
        </p>
      </>
    )
  },
  {
    id: 'payment',
    title: 'Payment',
    content: (
      <>
        <p>
          <strong>No payment is taken on this website.</strong> After your order is confirmed, our team shares payment details with you on WhatsApp or email.
          For bulk or wholesale orders we may ask for an advance, with the balance before dispatch, as agreed in writing.
        </p>
        <p>
          Pay only to the details shared by SWAYARI from our official contact ({SELLER.email}
          {SELLER.whatsapp ? ` or WhatsApp ${SELLER.whatsapp}` : ''}). We will <strong>never</strong> ask for your OTP, card PIN, UPI PIN or banking password. If
          anyone asks for these in SWAYARI’s name, do not share them and please tell us.
        </p>
      </>
    )
  },
  {
    id: 'delivery',
    title: 'Delivery',
    content: (
      <p>
        We deliver across India through courier partners. Dispatch times, delivery charges and tracking are explained in our{' '}
        <Link to="/shipping-policy">Shipping &amp; Delivery policy</Link>. Delivery dates given by couriers are estimates, not guarantees.
      </p>
    )
  },
  {
    id: 'cancellations',
    title: 'Cancellations, returns and refunds',
    content: (
      <>
        <p>In short:</p>
        <Bullets
          items={[
            'You can cancel free of charge before dispatch. After dispatch, delivery charges are not refundable.',
            'Damage in transit must be reported within 48 hours of delivery, with photos and an unboxing video. After checking, we replace or refund the damaged pieces.',
            'We do not accept returns for a change of mind on devotional items, or on bulk, custom or personalised orders.',
            'Approved refunds go to the original payment method within 7–10 working days.'
          ]}
        />
        <p>
          The full details are in our <Link to="/refund-policy">Cancellation, Returns &amp; Refunds policy</Link>.
        </p>
      </>
    )
  },
  {
    id: 'business',
    title: 'Wholesale and business orders',
    content: (
      <>
        <p>
          We welcome orders from pooja stores, gift shops, event planners and companies. Quantities, prices, timelines, invoice details and payment terms for
          these orders are agreed in writing for each order. Please share your business name and GST number (if you have one) when you confirm.
        </p>
        <p>If you resell our products, you are responsible for following the laws that apply to your own sale, including how you describe the products.</p>
      </>
    )
  },
  {
    id: 'account',
    title: 'Your account and Google Sign-In',
    content: (
      <>
        <p>
          You sign in with your Google account. This lets you send requests and see them later. Please give correct contact and delivery details, and keep your
          Google account secure — you are responsible for requests sent from your account.
        </p>
        <p>
          We may suspend or close an account, or refuse a request, if the website is misused, if details are false, or if we are required to by law. How we
          handle your information is explained in our <Link to="/privacy-policy">Privacy Policy</Link>.
        </p>
      </>
    )
  },
  {
    id: 'use',
    title: 'Using this website',
    content: (
      <>
        <p>Please use the website only for lawful purposes. You must not:</p>
        <Bullets
          items={[
            'send false, misleading or fake requests;',
            'try to break into, overload or interfere with the website, its database or other users’ accounts;',
            'copy, scrape or reuse our content, photos or prices for commercial purposes without our written permission.'
          ]}
        />
        <p>We try to keep the website available and correct, but we cannot promise it will always be free of interruptions or errors.</p>
      </>
    )
  },
  {
    id: 'ip',
    title: 'Content, designs and trademarks',
    content: (
      <>
        <p>
          The SWAYARI name, logo, website design, text and our own photographs belong to {SELLER.legalName} or are used with permission. You may share links to
          our pages, but please do not copy our content without permission.
        </p>
        <p>
          Product artwork, designs, brand names and marks of the manufacturers and suppliers whose products we resell belong to their respective owners. Showing
          them on this website does not mean those owners endorse or are connected with SWAYARI, other than as suppliers. If you believe something on this
          website uses your rights wrongly, please write to us and we will look into it promptly.
        </p>
      </>
    )
  },
  {
    id: 'liability',
    title: 'Our responsibility to you',
    content: (
      <>
        <p>
          We are responsible for supplying the products we confirm to you as described. To the extent the law allows, our total responsibility for any order is
          limited to the amount you paid for the products concerned in that order. We are not responsible for indirect losses, such as lost business or profit,
          or for delays and failures caused by events outside our reasonable control — for example natural disasters, extreme weather, strikes, government
          orders, courier disruptions or network outages.
        </p>
        <p>
          Nothing in these terms takes away your rights as a consumer under the Consumer Protection Act, 2019 or any other law that cannot be excluded.
        </p>
      </>
    )
  },
  {
    id: 'grievance',
    title: 'Complaints and Grievance Officer',
    content: (
      <>
        <p>
          If you are unhappy with anything, please tell us first — most issues are fixed quickly. As required by the Consumer Protection (E-Commerce) Rules, 2020,
          and the Information Technology Act, 2000 and its rules, our Grievance Officer is:
        </p>
        <DetailList rows={[['Name', `Grievance Officer, ${SELLER.legalName}`], ...sellerContactRows()]} />
        <p>
          We will <strong>acknowledge your complaint within 48 hours</strong> and aim to <strong>resolve it within 30 days</strong> of receiving it. Please
          include your name, phone number, request reference (if any) and a short description, with photos where useful.
        </p>
        <p>
          If you are not satisfied with our response, you can contact the National Consumer Helpline (dial 1915 or visit consumerhelpline.gov.in) or approach
          the appropriate Consumer Commission.
        </p>
      </>
    )
  },
  {
    id: 'law',
    title: 'Governing law and jurisdiction',
    content: (
      <p>
        These terms are governed by the laws of India. Subject to your rights as a consumer, any dispute will be decided by the courts having jurisdiction over{' '}
        {SELLER.legalName}’ registered place of business in India.
      </p>
    )
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    content: (
      <p>
        We may update these terms from time to time. The “Last updated” date at the top shows when they last changed. The terms that apply to an order are the
        ones shown on the website when that order was confirmed.
      </p>
    )
  }
];

export const TermsPage: React.FC = () => {
  usePageMeta(
    'Terms & Conditions',
    'Terms & Conditions for SWAYARI — Décor & Gifting by SWAYARI ENTERPRISES: order requests, slab pricing, payment, delivery, returns and grievance redressal.'
  );
  return (
    <PolicyLayout
      title={
        <>
          Terms &amp; <em>Conditions</em>
        </>
      }
      intro="The simple rules for using swayari.com and ordering from us, written in plain English."
      sections={SECTIONS}
      current="/terms"
    />
  );
};
