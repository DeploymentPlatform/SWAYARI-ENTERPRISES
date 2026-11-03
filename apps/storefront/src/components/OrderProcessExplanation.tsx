import React from 'react';
import { ORDER_DISCLAIMER_TEXT } from '@swayari/shared';
import { ShoppingBag, Send, PhoneCall, Info } from 'lucide-react';
import { SectionHeading } from './ui';
import { Reveal, StaggerGroup, StaggerItem } from './motion';

const STEPS = [
  {
    icon: ShoppingBag,
    title: 'Choose frames and quantities',
    body: 'Explore our devotional frames priced at ₹99 or less. Select your preferred deity designs and enter your event quantities.'
  },
  {
    icon: Send,
    title: 'Submit your request',
    body: 'Sign in with Google and submit your request with your occasion, delivery location, and target event date. Zero payment taken online.'
  },
  {
    icon: PhoneCall,
    title: 'Our team confirms the details',
    body: 'Our team contacts you to verify stock availability, exact shipping charges, optional packaging, and delivery schedule.'
  }
];

export const OrderProcessExplanation: React.FC = () => (
  <section id="how-to-order" aria-labelledby="process-title" className="section relative scroll-mt-24 overflow-hidden bg-white/70">
    <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    <div className="container-content">
      <Reveal>
        <SectionHeading
          align="center"
          id="process-title"
          eyebrow="How ordering works"
          title={
            <>
              Simple, <em>transparent</em> order requests
            </>
          }
          intro="We operate as an order-request business with personal coordination. No automatic payments or online card checkout."
        />
      </Reveal>

      <StaggerGroup className="relative mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
        {/* connecting line */}
        <div className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-[44px] hidden h-px bg-gradient-to-r from-gold/0 via-gold/50 to-gold/0 md:block" aria-hidden />
        {STEPS.map((step, i) => (
          <StaggerItem key={step.title}>
            <div className="group relative flex h-full flex-col items-center rounded-card border border-stone-deep/70 bg-ivory-light/80 px-6 pb-8 pt-6 text-center transition-all duration-500 ease-luxury hover:-translate-y-1 hover:border-gold/50 hover:bg-white hover:shadow-card-hover">
              <div className="relative grid h-[76px] w-[76px] place-items-center rounded-full border border-gold/40 bg-white shadow-gold transition-transform duration-700 ease-luxury group-hover:rotate-[8deg]">
                <span className="absolute inset-1.5 rounded-full border border-dashed border-gold/40 animate-spin-slow" aria-hidden />
                <step.icon className="h-6 w-6 text-burgundy" strokeWidth={1.5} />
              </div>
              <p className="mt-5 font-display text-sm italic text-gold-dark">Step {String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-1 font-display text-[1.5rem] leading-tight text-ink">{step.title}</h3>
              <p className="mt-3 max-w-[30ch] text-[0.9rem] leading-relaxed text-ink-soft">{step.body}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal delay={0.1}>
        <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-2xl border border-gold/30 bg-gold-pale/40 p-5 text-left">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-dark" aria-hidden />
          <p className="text-[0.875rem] leading-relaxed text-ink-soft">{ORDER_DISCLAIMER_TEXT}</p>
        </div>
      </Reveal>
    </div>
  </section>
);
