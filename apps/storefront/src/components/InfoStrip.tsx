import React from 'react';
import { BadgeIndianRupee, Users, Truck, ShieldCheck, Sparkles, HandHeart } from 'lucide-react';

const ASSURANCES = [
  { icon: BadgeIndianRupee, label: '₹99 or less per frame' },
  { icon: Users, label: 'Bulk orders for weddings & functions' },
  { icon: Truck, label: 'Shipping quoted for your location' },
  { icon: ShieldCheck, label: 'No online payment — order by request' },
  { icon: HandHeart, label: 'Personally confirmed by our team' },
  { icon: Sparkles, label: 'Gold-relief & teak finishes' }
];

/** Slow, endless ribbon of ordering assurances (pauses on hover; static for reduced motion). */
export const InfoStrip: React.FC = () => (
  <section aria-label="Key ordering assurances" className="relative overflow-hidden border-y border-gold/25 bg-ivory-light">
    <ul className="sr-only">
      {ASSURANCES.map(a => (
        <li key={a.label}>{a.label}</li>
      ))}
    </ul>
    <div className="mask-fade-x group flex py-4 sm:py-5" aria-hidden>
      {[0, 1].map(copy => (
        <div key={copy} className="flex shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]">
          {ASSURANCES.concat(ASSURANCES).map((a, i) => (
            <span key={`${copy}-${i}`} className="flex items-center gap-3 whitespace-nowrap px-6 sm:px-9">
              <a.icon className="h-4 w-4 text-gold-dark" strokeWidth={1.6} />
              <span className="font-display text-[1.05rem] italic text-ink-soft sm:text-[1.2rem]">{a.label}</span>
              <span className="ml-6 h-1.5 w-1.5 rotate-45 bg-gold/60 sm:ml-9" />
            </span>
          ))}
        </div>
      ))}
    </div>
  </section>
);
