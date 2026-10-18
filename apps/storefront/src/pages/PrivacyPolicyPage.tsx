import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">Privacy &amp; Data Protection</h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1 font-light">
          Last revised: October 2026 • SWAYARI ENTERPRISES
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-charcoal-muted leading-relaxed font-light">
        <section className="space-y-2">
          <h3 className="font-serif text-lg font-semibold text-charcoal">1. Information We Collect</h3>
          <p>
            When you sign in using Google Identity Services, we receive basic verified identity details (your name, verified email address, and avatar image). When you submit an order request, we collect your shipping address and mobile telephone number solely to coordinate order fulfillment.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif text-lg font-semibold text-charcoal">2. Zero Payment Data Capture</h3>
          <p>
            Because SWAYARI operates on a catalogue request model without online payment gateways, we never ask for, process, or store credit card numbers, debit cards, CVVs, or banking credentials.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif text-lg font-semibold text-charcoal">3. Session Security</h3>
          <p>
            Authentication sessions use secure, HttpOnly, SameSite cookies with strict domain scoping. We never store authentication tokens in client-accessible localStorage.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif text-lg font-semibold text-charcoal">4. Data Confidentiality</h3>
          <p>
            We do not sell, rent, or trade customer information with third-party advertisers. Your contact details are accessed exclusively by authorized SWAYARI fulfillment personnel to handle your specific request.
          </p>
        </section>
      </div>
    </div>
  );
};
