import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { Ornament } from '../components/States';
import { EASE_LUXURY, Reveal, StaggerGroup, StaggerItem } from '../components/motion';
import { LotusMark } from '../components/ui';

const PRINCIPLES = [
  {
    title: 'Blessings to give',
    text: 'Silver foil god frames, stotram frames, god stands and stotram cards — for the pooja room, a new home and every wedding guest.'
  },
  {
    title: 'Only what we can confirm',
    text: 'Each listing shows the details we have confirmed. If something is not stated, ask us — we would rather tell you directly than guess.'
  },
  {
    title: 'A person, not a checkout',
    text: 'Every request is read and answered by our team. We confirm stock, final price and delivery with you before anything goes ahead.'
  }
];

const NUMERALS = ['I', 'II', 'III'];

export const AboutPage: React.FC = () => {
  usePageMeta(
    'Our Story',
    'SWAYARI brings you devotional gifting under ₹2,999 — silver foil god frames, stotram frames and return gifts from ₹39 — with personal help for every order.'
  );

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
              Devotion to share.
              <br />
              <em className="text-gold-light">Gifts to remember.</em>
            </h1>
            <p className="mt-7 max-w-lg text-[1.0625rem] leading-relaxed text-ivory/90">
              SWAYARI brings you devotional gifting under ₹2,999 — silver foil god frames, stotram frames, god stands and stotram cards, with
              return gifts from ₹39. For the pooja room, our long wall frames are the grand pick. Chosen for weddings, griha pravesh,
              festivals and vratams.
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
              <img
                src="/assets/products/gf-padmavathi-srinivasa-lifestyle.webp"
                srcSet="/assets/products/thumbs/gf-padmavathi-srinivasa-lifestyle.webp 480w, /assets/products/gf-padmavathi-srinivasa-lifestyle.webp 1024w"
                sizes="(min-width: 768px) 40vw, 100vw"
                width={1024}
                height={1024}
                fetchPriority="high"
                decoding="async"
                alt="A bride holding a Padmavathi Srinivasa silver foil frame to give as a return gift"
                className="relative aspect-editorial w-full rounded-card object-cover object-[40%_50%] shadow-dialog"
              />
            </div>
            <p className="mt-5 text-right text-[0.75rem] uppercase tracking-[0.16em] text-ivory/85">Padmavathi Srinivasa · silver foil god frame</p>
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
              SWAYARI is run by SWAYARI ENTERPRISES. Rather than an automated checkout, we work on order requests: you add the gifts you
              like to your cart — from 1 piece — send them to us in one short form, and our team contacts you personally.
            </p>
            <p>
              That conversation is where we confirm what matters — whether your designs are in stock, the final price, how they will be
              packed and sent, and when they can reach you. Mix designs to reach a bulk price. Delivery is extra, at actual cost, and no
              payment is taken on this website.
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
            <img
              src="/assets/products/gf-radha-krishna-lifestyle.webp"
              srcSet="/assets/products/thumbs/gf-radha-krishna-lifestyle.webp 480w, /assets/products/gf-radha-krishna-lifestyle.webp 1024w"
              sizes="(min-width: 768px) 58vw, 100vw"
              width={1024}
              height={1024}
              loading="lazy"
              decoding="async"
              alt="Radha Krishna silver foil frames tied with ribbon on a wedding return-gift table"
              className="aspect-[4/3] w-full rounded-card object-cover object-[50%_60%] shadow-card"
            />
            <p className="mt-3 text-[0.75rem] uppercase tracking-[0.14em] text-ink-soft">Wedding return-gift table</p>
          </Reveal>
          <Reveal className="md:col-span-4 md:col-start-9" delay={0.1}>
            <LotusMark className="h-6 w-10 text-gold" />
            <h2 className="mt-5 font-display text-[2.2rem] leading-[1.08] sm:text-display-sm lg:text-[2.5rem]">
              Looking for something <em className="text-burgundy">particular?</em>
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">Tell us the occasion, the person or the space. We will reply with what we can offer.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row md:flex-col">
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
