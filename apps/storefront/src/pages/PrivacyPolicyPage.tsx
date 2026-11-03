import React from 'react';
import { usePageMeta } from '../lib/meta';
import { EditorialSections, PageIntro } from '../components/States';

const SECTIONS = [
  {
    title: 'What we collect',
    body: 'When you sign in with Google we receive your name, verified email address and profile picture. When you send an order request we store the contact and delivery details you enter, the pieces you requested and any notes you add.'
  },
  {
    title: 'Why we use it',
    body: 'Only to respond to your requests: to contact you about availability, pricing and delivery, and to show you your requests and any quotations in your account.'
  },
  {
    title: 'Payments',
    body: 'This website does not take payments, so we never ask for or store card numbers, UPI handles or banking details.'
  },
  {
    title: 'Sign-in and cookies',
    body: 'Your session is kept in a secure, HttpOnly cookie used only by this website. Your bag is stored in your own browser until you send a request.'
  },
  {
    title: 'Sharing',
    body: 'We do not sell or rent your information. It is accessed only by the SWAYARI team handling your request. To ask about or delete your data, write to swayarienterprises@gmail.com.'
  }
];

export const PrivacyPolicyPage: React.FC = () => {
  usePageMeta('Privacy policy');
  return (
    <div className="container-content max-w-3xl pb-20 md:pb-28">
      <PageIntro eyebrow="Help" title={<>Privacy <em>policy</em></>} align="center">
        What we collect, why, and how it is kept. Written plainly.
      </PageIntro>
      <EditorialSections sections={SECTIONS} idPrefix="privacy" />
    </div>
  );
};
