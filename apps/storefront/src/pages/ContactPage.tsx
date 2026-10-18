import React, { useMemo, useState } from 'react';
import { Mail } from 'lucide-react';
import { useRouter } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { PageIntro } from '../components/States';

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
      <PageIntro eyebrow="Contact" title="Write to us">
        Ask about a piece, get help choosing a gift, or follow up on a request. Our team replies personally.
      </PageIntro>

      <div className="grid gap-12 pt-10 md:grid-cols-12 md:gap-16">
        <aside className="md:col-span-4">
          <h2 className="font-sans text-label uppercase text-ink-soft">Email</h2>
          <a href={`mailto:${EMAIL}`} className="mt-3 inline-flex items-center gap-3 break-all text-lg text-ink hover:text-burgundy">
            <Mail className="h-5 w-5 flex-shrink-0 text-burgundy" aria-hidden />
            {EMAIL}
          </a>
          <h2 className="mt-10 font-sans text-label uppercase text-ink-soft">Already sent a request?</h2>
          <p className="mt-3 text-ink-soft">Include your reference (it starts with “SW-”) so we can find it quickly.</p>
        </aside>

        <div className="md:col-span-8">
          {composed ? (
            <div role="status" className="bg-stone p-8">
              <h2 className="text-[2rem] leading-tight">Your email is ready to send</h2>
              <p className="mt-3 text-ink-soft">
                We opened your email app with your message filled in — please press send there. If nothing opened, write to us
                directly at{' '}
                <a className="link-underline text-ink" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
                .
              </p>
              <button type="button" className="btn-secondary mt-6" onClick={() => setComposed(false)}>
                Edit message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5">
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
                    Phone <span className="font-normal text-ink-soft">(optional)</span>
                  </label>
                  <input id="c-phone" type="tel" className="field-input" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
                </div>
              </div>
              <div>
                <label htmlFor="c-topic" className="field-label">
                  What is it about?
                </label>
                <select id="c-topic" className="field-input" value={occasion} onChange={e => setOccasion(e.target.value)}>
                  {Object.entries(OCCASIONS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="c-message" className="field-label">
                  Message
                </label>
                <textarea
                  id="c-message"
                  rows={6}
                  className="field-input"
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
                  <p id="c-message-hint" className="mt-1.5 text-sm text-ink-soft">
                    For a gift, it helps to mention the occasion, the date and a rough budget.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-6">
                <button type="submit" className="btn-primary">
                  Compose email
                </button>
                <p className="text-sm text-ink-soft">Opens your email app with this message — nothing is stored on this website.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
