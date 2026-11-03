import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ClipboardList, Gift, Mail, MailCheck } from 'lucide-react';
import { Link, useRouter } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { PageIntro } from '../components/States';
import { EASE_LUXURY, Reveal, StaggerGroup, StaggerItem } from '../components/motion';

const EMAIL = 'swayarienterprises@gmail.com';

const OCCASIONS: Record<string, string> = {
  general: 'A general question',
  gift: 'Help choosing a gift',
  housewarming: 'Housewarming',
  celebrations: 'Festive celebrations',
  gifting: 'Thoughtful gifting',
  order: 'An existing request'
};

/**
 * There is no contact-form backend yet, so the form honestly composes an email in the visitor's
 * own mail app (nothing is sent or stored by this website).
 */
export const ContactPage: React.FC = () => {
  usePageMeta('Contact', 'Write to SWAYARI about a piece, a gift or an existing request.');
  const { search } = useRouter();
  const initialOccasion = search.get('occasion') || (search.get('topic') === 'gift' ? 'gift' : 'general');
  const product = search.get('product') || '';

  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState(OCCASIONS[initialOccasion] ? initialOccasion : 'general');
  const [message, setMessage] = useState(product ? `I would like to ask about: ${product}\n\n` : '');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [composed, setComposed] = useState(false);

  const mailto = useMemo(() => {
    const subject = `Enquiry: ${OCCASIONS[occasion]}${product ? ` — ${product}` : ''}`;
    const body = `${message.trim()}\n\nName: ${name.trim()}${phone.trim() ? `\nPhone: ${phone.trim()}` : ''}`;
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [occasion, product, message, name, phone]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = 'Please enter your name.';
    if (message.trim().length < 5) next.message = 'Please write a short message.';
    setErrors(next);
    if (Object.keys(next).length) return;
    window.location.href = mailto;
    setComposed(true);
  }

  return (
    <div className="container-content pb-20 md:pb-28">
      <PageIntro eyebrow="Contact" title={<>Write <em>to us</em></>}>
        Ask about a piece, get help choosing a gift, or follow up on a request. Our team replies personally.
      </PageIntro>

      <div className="grid gap-10 pt-10 lg:grid-cols-12 lg:gap-14 lg:pt-14">
        <aside className="lg:col-span-4">
          <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <StaggerItem>
              <a
                href={`mailto:${EMAIL}`}
                className="card-luxe group flex h-full items-start gap-4 p-5 transition-shadow duration-500 ease-luxury hover:shadow-card-hover sm:p-6"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-burgundy-accent to-burgundy text-ivory-light shadow-[0_8px_18px_-10px_rgba(94,26,40,0.8)]">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-dark">Email</span>
                  <span className="mt-1 block break-all font-display text-[1.2rem] leading-snug text-ink transition-colors group-hover:text-burgundy">{EMAIL}</span>
                  <span className="mt-1 block text-[0.8125rem] text-ink-faint">Our team replies personally.</span>
                </span>
              </a>
            </StaggerItem>
            <StaggerItem>
              <div className="card-luxe flex h-full items-start gap-4 p-5 sm:p-6">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold-pale/70 text-gold-dark">
                  <ClipboardList className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-dark">Already sent a request?</span>
                  <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-soft">
                    Include your reference (it starts with “SW-”) so we can find it quickly.
                  </span>
                  <Link to="/orders" className="link-underline mt-2 inline-block text-[0.8125rem] font-semibold text-burgundy">
                    See your requests
                  </Link>
                </span>
              </div>
            </StaggerItem>
            <StaggerItem className="sm:col-span-2 lg:col-span-1">
              <div className="flex h-full items-start gap-4 rounded-card border border-gold/30 bg-gradient-to-br from-gold-pale/60 to-ivory-light p-5 sm:p-6">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gold/40 bg-white/80 text-gold-dark">
                  <Gift className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-dark">Wedding &amp; bulk gifting</span>
                  <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-soft">
                    For a gift, it helps to mention the occasion, the date and a rough budget.
                  </span>
                </span>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </aside>

        <Reveal className="lg:col-span-8" delay={0.1}>
          <div className="card-luxe p-5 sm:p-8 lg:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {composed ? (
                <motion.div
                  key="composed"
                  role="status"
                  className="py-6 text-center sm:py-10"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease: EASE_LUXURY }}
                >
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold-pale/70 text-gold-dark shadow-gold">
                    <MailCheck className="h-7 w-7" aria-hidden />
                  </span>
                  <h2 className="mt-6 font-display text-[2rem] leading-tight">Your email is ready to send</h2>
                  <p className="mx-auto mt-3 max-w-md text-ink-soft">
                    We opened your email app with your message filled in — please press send there. If nothing opened, write to us directly
                    at{' '}
                    <a className="link-underline text-ink" href={`mailto:${EMAIL}`}>
                      {EMAIL}
                    </a>
                    .
                  </p>
                  <button type="button" className="btn-secondary mt-7" onClick={() => setComposed(false)}>
                    Edit message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  noValidate
                  className="space-y-5"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease: EASE_LUXURY }}
                >
                  <div>
                    <h2 className="font-display text-[1.9rem] leading-tight">Send a message</h2>
                    <p className="mt-1 text-sm text-ink-faint">All fields except phone are needed.</p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="c-name" className="field-label">
                        Your name
                      </label>
                      <input
                        id="c-name"
                        className="field-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'c-name-error' : undefined}
                      />
                      {errors.name && (
                        <p id="c-name-error" className="field-error">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="c-phone" className="field-label">
                        Phone <span className="font-normal text-ink-faint">(optional)</span>
                      </label>
                      <input id="c-phone" type="tel" className="field-input" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="c-topic" className="field-label">
                      What is it about?
                    </label>
                    <div className="relative">
                      <select id="c-topic" className="field-input cursor-pointer appearance-none pr-11" value={occasion} onChange={e => setOccasion(e.target.value)}>
                        {Object.entries(OCCASIONS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="c-message" className="field-label">
                      Message
                    </label>
                    <textarea
                      id="c-message"
                      rows={6}
                      className="field-input resize-y"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'c-message-error' : 'c-message-hint'}
                    />
                    {errors.message ? (
                      <p id="c-message-error" className="field-error">
                        {errors.message}
                      </p>
                    ) : (
                      <p id="c-message-hint" className="mt-1.5 text-[0.8125rem] text-ink-faint">
                        For a gift, it helps to mention the occasion, the date and a rough budget.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 border-t border-stone-deep/70 pt-5 sm:flex-row sm:items-center sm:gap-6">
                    <button type="submit" className="btn-primary">
                      <Mail className="h-4 w-4" aria-hidden />
                      Compose email
                    </button>
                    <p className="text-[0.8125rem] text-ink-faint">Opens your email app with this message — nothing is stored on this website.</p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
