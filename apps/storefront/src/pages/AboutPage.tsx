import React from 'react';
import { Link } from '../lib/router';
import { editorialSources } from '../lib/media';
import { usePageMeta } from '../lib/meta';
import { Picture } from '../components/ui';

const PRINCIPLES = [
  {
    title: 'Pieces for living with',
    text: 'We choose décor and gifts that suit everyday homes and special occasions alike — prayer corners, entrance tables, festive gatherings.'
  },
  {
    title: 'Only what we can confirm',
    text: 'Each listing shows the details we have confirmed. If something is not stated, ask us — we would rather tell you directly than guess.'
  },
  {
    title: 'A person, not a checkout',
    text: 'Every request is read and answered by our team. We confirm availability, final price, shipping and delivery with you before anything goes ahead.'
  }
];

export const AboutPage: React.FC = () => {
  usePageMeta('Our Story', 'SWAYARI brings together décor and gifting for homes and special occasions, with personal assistance for every order request.');

  return (
    <>
      <section className="relative bg-umber text-ivory">
        <div className="container-content grid items-center gap-10 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-6">
            <p className="eyebrow mb-4 text-gold-light">Our story</p>
            <h1 className="text-[2.75rem] leading-[1.02] text-ivory md:text-display-xl">
              Décor to live with.
              <br />
              Gifts to remember.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ivory/85">
              SWAYARI — Décor &amp; Gifting brings together decorative pieces and gifting ideas for homes and special
              occasions, from everyday spaces to festivals, housewarmings and celebrations.
            </p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <Picture
              sources={editorialSources('marigold-garlands', [600, 900])}
              sizes="(min-width: 768px) 40vw, 100vw"
              width={900}
              height={1125}
              priority
              alt="Marigold garlands spilling from a turned wooden vase"
              className="aspect-editorial w-full object-cover"
            />
            <p className="mt-2 text-right text-[0.6875rem] uppercase tracking-[0.14em] text-ivory/60">Styling inspiration</p>
          </div>
        </div>
      </section>

      <section className="container-content py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12">
          <h2 className="text-display-sm md:col-span-4 md:text-display-md">How we work</h2>
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft md:col-span-7 md:col-start-6">
            <p>
              SWAYARI is run by SWAYARI ENTERPRISES. Rather than an automated checkout, we work on order requests: you choose the
              pieces you like, send them to us in one short form, and our team contacts you personally.
            </p>
            <p>
              That conversation is where we confirm what matters — whether a piece is available, its final price, how it will be
              packed and sent, and when it can reach you. No payment is taken on this website.
            </p>
          </div>
        </div>

        <ul className="mt-16 grid gap-10 border-t border-stone-deep pt-12 md:grid-cols-3">
          {PRINCIPLES.map(p => (
            <li key={p.title}>
              <h3 className="text-[1.75rem] leading-tight">{p.title}</h3>
              <p className="mt-3 text-ink-soft">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-stone">
        <div className="container-content grid items-center gap-10 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-7">
            <Picture
              sources={editorialSources('assist-brass-diyas', [900, 1600])}
              sizes="(min-width: 768px) 58vw, 100vw"
              width={1600}
              height={1068}
              alt="Brass diyas among pink and white flowers on a wooden surface"
              className="aspect-wide w-full object-cover"
            />
            <p className="mt-2 text-[0.8125rem] text-ink-soft">Styling inspiration</p>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <h2 className="text-display-sm">Looking for something particular?</h2>
            <p className="mt-4 text-ink-soft">Tell us the occasion, the person or the space. We will reply with what we can offer.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <Link to="/shop" className="btn-primary">
                Explore the Collection
              </Link>
              <Link to="/contact" className="btn-secondary">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
