import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { ORDER_DISCLAIMER_TEXT } from '@swayari/shared';

export const OrderingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">Ordering &amp; Delivery Policy</h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1 font-light">
          Last revised: October 2026 • SWAYARI ENTERPRISES
        </p>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="bg-ivory-muted/90 rounded-2xl p-6 border border-ivory-border shadow-subtle space-y-2">
        <div className="flex items-center space-x-2 text-burgundy font-medium text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-serif font-semibold">Mandatory Order Request Notice</span>
        </div>
        <p className="text-xs text-charcoal-muted leading-relaxed font-light pl-6">
          “{ORDER_DISCLAIMER_TEXT}”
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-charcoal-muted leading-relaxed font-light">
        <section className="space-y-2">
          <h3 className="font-serif text-lg font-semibold text-charcoal">1. Non-Transactional Catalogue Model</h3>
          <p>
            SWAYARI does not collect card payments, UPI transfers, or credit information online through automated payment gateways. Our storefront operates exclusively as a bespoke enquiry catalogue. Submitting an order request enables our team to inspect inventory, consult with you on customized alloy finishes or frame sizes, and ensure proper protective courier arrangements.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif text-lg font-semibold text-charcoal">2. Price Quotation &amp; Revisions</h3>
          <p>
            Indicative prices shown on our catalogue serve as estimated starting prices. Final pricing depends on chosen variants, custom engraving, and shipping destination. Official quotations with explicit itemized pricing and shipping charges are published to your client account after direct consultation.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif text-lg font-semibold text-charcoal">3. Packaging &amp; Transit Insurance</h3>
          <p>
            Devotional icons and framed artworks are delicate and sacred. We employ high-density foam molds, moisture barrier wrapping, and reinforced corrugated wooden boxing where necessary. All transit arrangements are coordinated through reputed express couriers with tracking.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif text-lg font-semibold text-charcoal">4. Cancellations &amp; Modifications</h3>
          <p>
            You may adjust or cancel your order request at any point during telephone consultation prior to manufacturing customization or parcel dispatch without penalty.
          </p>
        </section>
      </div>
    </div>
  );
};
