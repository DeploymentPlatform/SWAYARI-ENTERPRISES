import React from 'react';
import { Link } from '../lib/router';
import { usePageMeta } from '../lib/meta';
import { Bullets, DetailList, Note, PolicyLayout, SELLER, SectionLink, sellerContactRows, type PolicySection } from './TermsPage';

const SECTIONS: PolicySection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    content: (
      <>
        <p>
          This policy explains how <strong>{SELLER.legalName}</strong> (brand “{SELLER.brand}”), India, collects and uses your personal data when you use{' '}
          <strong>swayari.com</strong> or contact us about an order. Under the Digital Personal Data Protection Act, 2023, we are the “Data Fiduciary” for this
          data — that is, we decide why and how it is used.
        </p>
        <p>We collect only what we need to handle your requests and orders. We do not sell your data.</p>
      </>
    )
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    content: (
      <>
        <p>
          <strong>When you sign in with Google:</strong> your name, email address and profile photo, as shared by Google. We never see your Google password.
        </p>
        <p>
          <strong>When you send a request:</strong> your name, phone number, delivery address, city, state and PIN code, the occasion, the date you need the
          items by, any notes you add, and the products, sizes and quantities you chose.
        </p>
        <p>
          <strong>When you talk to us:</strong> what you share with us on phone calls, WhatsApp or email about your request or order, and payment confirmations
          (such as the transaction reference) once you pay.
        </p>
        <p>
          <strong>Technical data:</strong> basic records such as IP address, browser type and the time of a visit, which our hosting provider keeps to run the
          website securely and to prevent misuse.
        </p>
        <Note>
          We do not collect card numbers, UPI PINs, bank passwords or OTPs. No payment is taken on this website.
        </Note>
      </>
    )
  },
  {
    id: 'why',
    title: 'Why we use it',
    content: (
      <>
        <p>We use your personal data only to:</p>
        <Bullets
          items={[
            'create and run your account, and show you your requests;',
            'contact you by call, WhatsApp or email to confirm availability, the final amount, delivery charges and payment details;',
            'pack, dispatch and deliver your order, and share tracking details;',
            'handle cancellations, damage reports, refunds and complaints;',
            'keep business, tax and accounting records that the law requires;',
            'keep the website safe and prevent fraud or misuse.'
          ]}
        />
        <p>We do not use your data for advertising, and we do not send marketing messages unless you ask us to.</p>
      </>
    )
  },
  {
    id: 'consent',
    title: 'Your consent',
    content: (
      <>
        <p>
          By signing in with Google and sending us a request, you consent to us using your data for the purposes above. Some data we may also keep where the law
          allows it without consent — for example, records we must keep under tax law, or to respond to a legal request.
        </p>
        <p>
          You can withdraw your consent at any time — see <SectionLink id="withdraw">Withdrawing consent</SectionLink>.
        </p>
      </>
    )
  },
  {
    id: 'cookies',
    title: 'Cookies and browser storage',
    content: (
      <>
        <Bullets
          items={[
            <>
              <strong>Essential cookie only.</strong> When you sign in, we set one secure session cookie so the website knows you are signed in. It is needed
              for the website to work and is not used for tracking.
            </>,
            <>
              <strong>Your cart</strong> is saved in your own browser (local storage) so it is still there when you come back. It reaches us only when you press
              “Send request”.
            </>,
            'We do not use advertising or tracking cookies. If we add any analytics or advertising tools in future, we will update this policy first and ask for your consent where the law requires it.'
          ]}
        />
        <p>You can clear cookies and site data in your browser settings at any time. If you clear them, you will be signed out and your cart will be emptied.</p>
      </>
    )
  },
  {
    id: 'sharing',
    title: 'Who we share it with',
    content: (
      <>
        <p>Your data is seen only by the SWAYARI team handling your request, and shared only where needed with:</p>
        <Bullets
          items={[
            <>
              <strong>Cloudflare</strong> — hosts this website and our database, where your account and requests are stored;
            </>,
            <>
              <strong>Google</strong> — provides the sign-in service;
            </>,
            <>
              <strong>Courier partners</strong> — receive your name, phone number and delivery address to deliver your parcel;
            </>,
            <>
              <strong>WhatsApp and email providers</strong> — carry the messages we exchange with you;
            </>,
            <>
              <strong>Government or law enforcement</strong> — only when the law requires us to share it.
            </>
          ]}
        />
        <p>These providers process data under their own security and privacy terms. We do not sell, rent or trade your personal data.</p>
      </>
    )
  },
  {
    id: 'storage',
    title: 'Where it is stored and how it is protected',
    content: (
      <p>
        Your data is stored with Cloudflare, whose servers may be in India or in other countries. We protect it with reasonable security safeguards: encrypted
        connections (HTTPS), a secure sign-in cookie, and access limited to the team members who need it. No system is perfectly secure, but if a personal data
        breach ever affects you, we will inform you and the Data Protection Board of India as the law requires.
      </p>
    )
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    content: (
      <Bullets
        items={[
          'Your account details are kept while your account is in use, and deleted when you ask us to delete them.',
          'Requests that never became orders are deleted or anonymised within 2 years of your last activity, or sooner if you ask.',
          'Records of confirmed orders and payments are kept for as long as Indian tax and accounting laws require, and then deleted.',
          'Technical logs are kept by our hosting provider for a short period, for security.'
        ]}
      />
    )
  },
  {
    id: 'rights',
    title: 'Your rights',
    content: (
      <>
        <p>Under the Digital Personal Data Protection Act, 2023, you have the right to:</p>
        <Bullets
          items={[
            <>
              <strong>Access</strong> — ask for a summary of the personal data we hold about you and how we use it;
            </>,
            <>
              <strong>Correct and update</strong> — ask us to fix or complete data that is wrong or incomplete;
            </>,
            <>
              <strong>Erase</strong> — ask us to delete your data, except what the law requires us to keep;
            </>,
            <>
              <strong>Raise a grievance</strong> — complain to us about how your data is handled;
            </>,
            <>
              <strong>Nominate</strong> — name a person who can use these rights for you in case of death or incapacity.
            </>
          ]}
        />
        <p>
          To use any of these rights, email <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a> from the email address linked to your account (or tell us how
          to verify you). We will reply within 30 days.
        </p>
      </>
    )
  },
  {
    id: 'withdraw',
    title: 'Withdrawing consent',
    content: (
      <p>
        You can withdraw your consent at any time by emailing <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a> with the subject “Withdraw consent”. It is as
        easy as giving it. Once you withdraw, we will stop using your data and delete it, except what we must keep by law. Withdrawing does not affect anything
        we did before, and we may not be able to complete an open order without your contact and delivery details.
      </p>
    )
  },
  {
    id: 'children',
    title: 'Children',
    content: (
      <p>
        This website is meant for adults. If you are under 18, please ask a parent or guardian to sign in and send the request for you. We do not knowingly
        collect personal data from children.
      </p>
    )
  },
  {
    id: 'grievance',
    title: 'Grievance Officer and contact',
    content: (
      <>
        <p>For any question or complaint about your personal data, contact:</p>
        <DetailList rows={[['Name', `Grievance Officer, ${SELLER.legalName}`], ...sellerContactRows()]} />
        <p>
          We will acknowledge your complaint within 48 hours and aim to resolve it within 30 days. If you are not satisfied with our response, you can complain to
          the Data Protection Board of India.
        </p>
      </>
    )
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    content: (
      <p>
        We may update this policy when our website or the law changes. The “Last updated” date at the top shows when it last changed. If a change affects how we
        use data you have already given us, we will tell you. See also our <Link to="/terms">Terms &amp; Conditions</Link>.
      </p>
    )
  }
];

export const PrivacyPolicyPage: React.FC = () => {
  usePageMeta(
    'Privacy Policy',
    'How SWAYARI ENTERPRISES collects, uses and protects your personal data — Google Sign-In, order requests, cookies, your rights and how to contact us.'
  );
  return (
    <PolicyLayout
      title={
        <>
          Privacy <em>Policy</em>
        </>
      }
      intro="What personal data we collect, why we need it, and the choices you have — written plainly."
      sections={SECTIONS}
      current="/privacy-policy"
    />
  );
};
