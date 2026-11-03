import React from 'react';
import { Link } from '../lib/router';
import { Mail, Phone, ShieldCheck, ArrowUpRight, ArrowUp } from 'lucide-react';
import { LOGO_ON_DARK, LOGO_SIZE } from './ui';

const COLLECTIONS = [
  { label: 'God Frames', to: '/shop?category=god-frames' },
  { label: 'Stotram Frames', to: '/shop?category=stotram-frames' },
  { label: 'God Stands', to: '/shop?category=god-stands' },
  { label: 'Stotram Cards', to: '/shop?category=stotram-cards' },
  { label: 'Wall Frames', to: '/shop?category=wall-frames' },
  { label: 'Wedding return gifts', to: '/shop?occasion=wedding-return-gifts' }
];

const SUPPORT = [
  { label: 'My order requests', to: '/account/orders' },
  { label: 'Our story', to: '/about' },
  { label: 'Contact & assistance', to: '/contact' }
];

const POLICIES = [
  { label: 'How ordering works', to: '/ordering-policy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Privacy policy', to: '/privacy-policy' },
  { label: 'Shipping policy', to: '/shipping-policy' },
  { label: 'Cancellation & Refunds', to: '/refund-policy' }
];

const FooterLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="group inline-flex items-center gap-1.5 py-1 text-[0.875rem] text-ivory-light/85 transition-colors duration-300 hover:text-gold-light"
    >
      <span className="h-px w-0 bg-gold-light transition-all duration-500 ease-luxury group-hover:w-3" />
      {children}
    </Link>
  </li>
);

export const Footer: React.FC = () => (
  <footer className="relative overflow-hidden bg-umber text-ivory-light">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
    <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-burgundy/40 blur-[120px]" />

    <div className="container-content relative pb-28 pt-16 md:pb-10 md:pt-20">
      {/* Signature */}
      <div className="flex flex-col items-center text-center">
        <img src={LOGO_ON_DARK} alt="SWAYARI — Décor & Gifting" {...LOGO_SIZE} loading="lazy" className="h-24 w-auto sm:h-32" draggable={false} />
        <p className="mt-6 max-w-xl font-display text-[1.25rem] italic leading-snug text-ivory-light/90 sm:text-[1.45rem]">
          Devotional gifting under ₹2,999 — silver foil god frames, stotram frames and return gifts from ₹39, for weddings, griha pravesh and every festival.
        </p>
      </div>

      <div className="mt-14 grid gap-10 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">How we take orders</h2>
          <p className="mt-4 max-w-sm text-[0.875rem] leading-relaxed text-ivory-light/85">
            Order from 1 piece and mix designs to unlock bulk prices. Sending a request takes no payment and does not reserve stock — our team
            contacts you to confirm availability and final price. Delivery is extra, at actual cost.
          </p>
        </div>

        <nav aria-label="Collections" className="lg:col-span-2">
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">Collections</h2>
          <ul className="mt-4 space-y-1">
            {COLLECTIONS.map(l => (
              <FooterLink key={l.to} to={l.to}>
                {l.label}
              </FooterLink>
            ))}
          </ul>
        </nav>

        <nav aria-label="Customer care" className="lg:col-span-2">
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">Customer care</h2>
          <ul className="mt-4 space-y-1">
            {SUPPORT.map(l => (
              <FooterLink key={l.to} to={l.to}>
                {l.label}
              </FooterLink>
            ))}
          </ul>
        </nav>

        <nav aria-label="Policies" className="lg:col-span-2">
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">Policies</h2>
          <ul className="mt-4 space-y-1">
            {POLICIES.map(l => (
              <FooterLink key={l.to} to={l.to}>
                {l.label}
              </FooterLink>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">Swayari Enterprises</h2>
          <ul className="mt-4 space-y-4 text-[0.875rem] text-ivory-light/85">
            <li>
              <a href="mailto:swayarienterprises@gmail.com" className="group flex items-start gap-3 transition-colors hover:text-gold-light">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
                <span className="break-all">swayarienterprises@gmail.com</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
              Personal consultation via call / WhatsApp
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
              Protective packaging for celebration gifting
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[0.75rem] text-ivory-light/85 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} SWAYARI ENTERPRISES. All rights reserved.</p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group inline-flex items-center gap-2 uppercase tracking-[0.18em] transition-colors hover:text-gold-light"
        >
          Back to top
          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 transition-all group-hover:-translate-y-0.5 group-hover:border-gold-light">
            <ArrowUp className="h-3.5 w-3.5" />
          </span>
        </button>
      </div>
    </div>
  </footer>
);
