import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '../lib/router';
import { editorialSources } from '../lib/media';
import { usePageMeta } from '../lib/meta';
import { Ornament } from '../components/States';
import { EASE_LUXURY, Reveal, StaggerGroup, StaggerItem } from '../components/motion';
import { LotusMark, Picture } from '../components/ui';

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

const NUMERALS = ['I', 'II', 'III'];

export const AboutPage: React.FC = () => {
  usePageMeta('Our Story', 'SWAYARI brings together décor and gifting for homes and special occasions, with personal assistance for every order request.');

  return (
    <>
      <section className="relative overflow-hidden bg-umber text-ivory">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-burgundy/50 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-[26rem] w-[26rem] rounded-full bg-gold/15 blur-3xl" />
        </div>
        <div className="container-content relative grid items-center gap-12 py-16 md:grid-cols-12 md:py-24 lg:py-28">
          <motion.div
            className="md:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_LUXURY }}
          >
            <p className="eyebrow mb-5 text-gold-light before:bg-gold-light">Our story</p>
            <h1 className="font-display text-[2.75rem] font-medium leading-[1.02] text-ivory sm:text-display-lg lg:text-display-xl">
              Décor to live with.
              <br />
              <em className="text-gold-light">Gifts to remember.</em>
            </h1>
            <p className="mt-7 max-w-lg text-[1.0625rem] leading-relaxed text-ivory/80">
              SWAYARI — Décor &amp; Gifting brings together decorative pieces and gifting ideas for homes and special occasions, from
              everyday spaces to festivals, housewarmings and celebrations.
            </p>
          </motion.div>
          <motion.div
            className="md:col-span-5 md:col-start-8"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE_LUXURY, delay: 0.15 }}
          >
            <div className="relative">
              <div aria-hidden className="absolute -inset-3 rounded-[26px] border border-gold/30 sm:-inset-4" />
              <Picture
                sources={editorialSources('marigold-garlands', [600, 900])}
                sizes="(min-width: 768px) 40vw, 100vw"
                width={900}
                height={1125}
                priority
                alt="Marigold garlands spilling from a turned wooden vase"
                className="relative aspect-editorial w-full rounded-card object-cover shadow-dialog"
              />
            </div>
            <p className="mt-5 text-right text-[0.6875rem] uppercase tracking-[0.16em] text-ivory/55">Styling inspiration</p>
          </motion.div>
        </div>
      </section>

      <section className="container-content section">
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <p className="eyebrow mb-4">Our approach</p>
            <h2 className="display-title">
              How we <em>work</em>
            </h2>
          </Reveal>
          <Reveal className="space-y-5 text-[1.0625rem] leading-[1.8] text-ink-soft md:col-span-7 md:col-start-6 md:text-lg" delay={0.1}>
            <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[3.6rem] first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-burgundy">
              SWAYARI is run by SWAYARI ENTERPRISES. Rather than an automated checkout, we work on order requests: you choose the pieces
              you like, send them to us in one short form, and our team contacts you personally.
            </p>
            <p>
              That conversation is where we confirm what matters — whether a piece is available, its final price, how it will be packed
              and sent, and when it can reach you. No payment is taken on this website.
            </p>
          </Reveal>
        </div>

        <Ornament className="mt-16 md:mt-20" />

        <StaggerGroup as="ul" className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
          {PRINCIPLES.map((p, i) => (
            <StaggerItem as="li" key={p.title} className="card-luxe group relative overflow-hidden p-7 transition-shadow duration-500 ease-luxury hover:shadow-card-hover lg:p-9">
              <span aria-hidden className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-gold via-gold-light to-transparent transition-transform duration-700 ease-luxury group-hover:scale-x-100" />
              <span className="font-display text-[1.1rem] italic text-gold">{NUMERALS[i]}</span>
              <h3 className="mt-3 font-display text-[1.75rem] leading-tight">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{p.text}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="relative overflow-hidden bg-stone">
        <div className="container-content grid items-center gap-10 py-16 md:grid-cols-12 md:py-24">
          <Reveal className="md:col-span-7">
            <Picture
              sources={editorialSources('assist-brass-diyas', [900, 1600])}
              sizes="(min-width: 768px) 58vw, 100vw"
              width={1600}
              height={1068}
              alt="Brass diyas among pink and white flowers on a wooden surface"
              className="aspect-wide w-full rounded-card object-cover shadow-card"
            />
            <p className="mt-3 text-[0.75rem] uppercase tracking-[0.14em] text-ink-faint">Styling inspiration</p>
          </Reveal>
          <Reveal className="md:col-span-4 md:col-start-9" delay={0.1}>
            <LotusMark className="h-6 w-10 text-gold" />
            <h2 className="mt-5 font-display text-[2.2rem] leading-[1.08] sm:text-display-sm lg:text-[2.5rem]">
              Looking for something <em className="text-burgundy">particular?</em>
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">Tell us the occasion, the person or the space. We will reply with what we can offer.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row md:flex-col xl:flex-row">
              <Link to="/shop" className="btn-primary">
                Explore the Collection
              </Link>
              <Link to="/contact" className="btn-secondary">
                Contact us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};
