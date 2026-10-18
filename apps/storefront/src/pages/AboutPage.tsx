import React from 'react';
import { Sparkles, Shield, Compass, Heart } from 'lucide-react';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Editorial Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-burgundy font-medium">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Artisanal Heritage</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal tracking-tight">
          The Craft &amp; Reverence of SWAYARI
        </h1>
        <p className="text-sm sm:text-base text-charcoal-muted font-light leading-relaxed">
          Founded on the principle that sacred iconography deserves the utmost material integrity and aesthetic nobility.
        </p>
      </div>

      {/* Hero Visual Card */}
      <div className="rounded-3xl overflow-hidden border border-ivory-border shadow-card bg-ivory-muted aspect-[21/9]">
        <img
          src="/assets/brand/swayari_brand_card.jpeg"
          alt="SWAYARI Studio Craft"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Narrative Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 text-sm sm:text-base text-charcoal-muted leading-relaxed font-light">
        <div className="space-y-4">
          <h3 className="font-serif text-2xl text-charcoal font-medium">
            Sacred Artistry in Solid Form
          </h3>
          <p>
            At SWAYARI ENTERPRISES, we curate and finish fine brass, bronze alloys, and bespoke framed devotional artworks. In a world saturated with ephemeral mass-production, our focus remains steadfastly anchored in generational craftsmanship.
          </p>
          <p>
            Each idol begins with meticulously drafted iconographic geometry. Our artisan partners, based in traditional metalworking communities across India, execute the ancient lost-wax casting technique and sand-mould casting with unparalleled fidelity.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-serif text-2xl text-charcoal font-medium">
            Personalised Gifting &amp; Heritage
          </h3>
          <p>
            Whether honoring a housewarming, sanctifying a prayer room, or commemorating milestone celebrations, sacred gifts carry emotional permanence.
          </p>
          <p>
            We do not operate as an automated, impersonal shopping cart. Every single order request is treated as a collaborative commission, where our dedicated team discusses custom packaging, auspicious delivery timing, and bespoke finishes directly with you.
          </p>
        </div>
      </div>

      {/* Core Studio Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-ivory-border">
        <div className="p-6 rounded-2xl bg-white border border-ivory-border space-y-3">
          <Shield className="w-6 h-6 text-gold" />
          <h4 className="font-serif text-lg font-semibold text-charcoal">Authentic Alloys</h4>
          <p className="text-xs text-charcoal-muted font-light leading-relaxed">
            Pure brass and bell metal casting that develops a rich, dignified patina over decades of veneration.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-ivory-border space-y-3">
          <Compass className="w-6 h-6 text-gold" />
          <h4 className="font-serif text-lg font-semibold text-charcoal">Traditional Proportions</h4>
          <p className="text-xs text-charcoal-muted font-light leading-relaxed">
            Adhering faithfully to classical shilpa principles to create balanced, spiritually uplifting iconography.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-ivory-border space-y-3">
          <Heart className="w-6 h-6 text-gold" />
          <h4 className="font-serif text-lg font-semibold text-charcoal">Bespoke Guidance</h4>
          <p className="text-xs text-charcoal-muted font-light leading-relaxed">
            Direct personal service from our studio to recommend ideal sizes, finishes, and protective delivery.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <button
          onClick={() => navigate('/shop')}
          className="px-8 py-3.5 rounded-md bg-burgundy hover:bg-burgundy-hover text-white text-xs sm:text-sm font-semibold tracking-wide shadow-card transition-all"
        >
          Explore Our Catalogue
        </button>
      </div>
    </div>
  );
};
