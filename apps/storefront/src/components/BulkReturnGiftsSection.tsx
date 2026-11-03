import React from 'react';
import { Product } from '@swayari/shared';
import { ProductCard } from './ProductCard';
import { Link } from '../lib/router';
import { Heart, Sparkles, Truck, ArrowRight, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import { Reveal, StaggerGroup, StaggerItem } from './motion';

interface BulkReturnGiftsSectionProps {
  products: Product[];
}

const PILLARS = [
  {
    icon: CheckCircle2,
    title: 'Seven auspicious designs',
    body: 'Balaji, Padmavathi Srinivasa, Sai Baba, Radha Krishna, Bal Krishna, Ram Darbar and Hanuman. Mix them freely.'
  },
  {
    icon: Sparkles,
    title: 'One simple price: ₹99',
    body: 'Every frame is ₹99. Minimum order is 25 frames in total, in any mix of designs.'
  },
  {
    icon: Truck,
    title: 'Shipping charged extra',
    body: 'Shipping is worked out for your quantity and delivery PIN code, and confirmed before dispatch.'
  }
];

export const BulkReturnGiftsSection: React.FC<BulkReturnGiftsSectionProps> = ({ products }) => {
  const displayItems = products.filter(p => p.indicativePrice !== null && p.indicativePrice <= 99).slice(0, 4);

  return (
    <section aria-labelledby="wedding-return-title" className="section">
      <div className="container-content">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-burgundy-deep text-ivory-light shadow-dialog">
            <img
              src="/assets/editorial/hero-return-gifts-desktop.webp"
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-burgundy-deep via-burgundy-deep/90 to-burgundy-deep/40" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/25 blur-[90px]" />

            <div className="relative grid gap-10 p-7 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:p-16">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-gold-light/30 bg-white/5 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold-light">
                  <Heart className="h-3.5 w-3.5" /> Wedding &amp; celebration return gifts
                </p>
                <h2 id="wedding-return-title" className="mt-5 text-ivory-light font-display text-[2.2rem] font-medium leading-[1.02] sm:text-[3rem] lg:text-[3.4rem]">
                  A blessing in every guest’s hands, <span className="italic text-gold-light">beautifully framed.</span>
                </h2>
                <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-ivory-light/80 sm:text-base">
                  Planning a wedding, griha pravesh or family celebration? Choose silver foil god frames at ₹99 each. Mix designs or pick one deity, tell us your quantity (25 frames or more), and our team handles personal confirmation and safe dispatch.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/shop?bulk=1" className="btn-gold">
                    Plan your return gifts <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/contact" className="btn-ghost-light">
                    <MessageSquareQuote className="h-4 w-4 text-gold-light" /> Enquire by phone
                  </Link>
                </div>
              </div>

              <ul className="grid content-center gap-4">
                {PILLARS.map(p => (
                  <li key={p.title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md transition-colors duration-500 hover:border-gold-light/40 hover:bg-white/10">
                    <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border border-gold-light/40 text-gold-light">
                      <p.icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <span>
                      <span className="block font-display text-[1.25rem] text-ivory-light">{p.title}</span>
                      <span className="mt-1 block text-[0.8125rem] leading-relaxed text-ivory-light/70">{p.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {displayItems.length > 0 && (
          <div className="mt-16">
            <Reveal className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Guest favourites</p>
                <h3 className="mt-3 font-display text-[1.9rem] leading-tight sm:text-[2.4rem]">Popular return gift designs</h3>
              </div>
              <Link to="/shop?bulk=1" className="text-link group hidden sm:inline-flex">
                View all bulk frames <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
            <StaggerGroup className="mt-8 grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4">
              {displayItems.map(prod => (
                <StaggerItem key={prod.id}>
                  <ProductCard product={prod} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        )}
      </div>
    </section>
  );
};
