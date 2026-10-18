import React from 'react';
import { Link } from '../lib/router';
import { LotusMark, Wordmark } from './ui';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { to: '/shop', label: 'The collection' },
      { to: '/cart', label: 'Your bag' },
      { to: '/orders', label: 'Your requests' }
    ]
  },
  {
    title: 'Help',
    links: [
      { to: '/ordering-policy', label: 'How ordering works' },
      { to: '/contact', label: 'Contact us' },
      { to: '/privacy-policy', label: 'Privacy policy' }
    ]
  }
];

export const Footer: React.FC = () => (
  <footer className="bg-burgundy-deep text-ivory">
    <div className="container-content grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-12 md:gap-12 md:py-20">
      <div className="col-span-2 md:col-span-5">
        <Wordmark tone="light" size="sm" />
        <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-ivory/80">
          Décor and gifting for homes and special occasions. Send a request for the pieces you like — our team
          will contact you to confirm availability, final pricing and delivery. No online payment is taken.
        </p>
      </div>

      {COLUMNS.map(col => (
        <nav key={col.title} aria-label={col.title} className="md:col-span-2">
          <h2 className="font-sans text-label uppercase text-gold-light">{col.title}</h2>
          <ul className="mt-5 space-y-3 text-[0.9375rem]">
            {col.links.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-ivory/85 transition-colors hover:text-ivory">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}

      <div className="col-span-2 md:col-span-3">
        <h2 className="font-sans text-label uppercase text-gold-light">Write to us</h2>
        <a href="mailto:swayarienterprises@gmail.com" className="mt-5 inline-block break-all text-[0.9375rem] text-ivory/85 underline decoration-ivory/30 underline-offset-4 hover:text-ivory">
          swayarienterprises@gmail.com
        </a>
      </div>
    </div>

    <div className="border-t border-ivory/10">
      <div className="container-content flex flex-col items-center justify-between gap-3 py-6 text-[0.8125rem] text-ivory/65 sm:flex-row">
        <p>© {new Date().getFullYear()} SWAYARI ENTERPRISES</p>
        <LotusMark className="h-4 w-7 text-gold-light/70" />
      </div>
    </div>
  </footer>
);
