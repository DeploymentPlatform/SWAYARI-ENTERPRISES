import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onAbout: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onAbout }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-ivory to-ivory-muted/40 py-12 lg:py-20 border-b border-ivory-border/60">
      {/* Decorative background subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Editorial Narrative */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-burgundy-light/60 border border-burgundy/15 text-burgundy text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Sacred Iconography &amp; Bespoke Gifting</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-charcoal leading-[1.15]">
              Devotional Elegance, <br className="hidden sm:inline" />
              <span className="italic text-burgundy">Handcrafted with Reverence</span>
            </h1>

            <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
              We curate and hand-finish bespoke devotional idols, sacred brassware, and ornate frames designed to evoke serenity and timeless grace in discerning sanctuaries.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onExplore}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-md bg-burgundy hover:bg-burgundy-hover text-ivory-light text-sm font-medium tracking-wide transition-all shadow-card hover:shadow-card-hover"
              >
                <span>Explore Curated Collection</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={onAbout}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-md border border-ivory-border bg-white hover:bg-ivory-muted text-charcoal text-sm font-medium tracking-wide transition-colors"
              >
                Our Artisanal Philosophy
              </button>
            </div>

            {/* Credibility Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-ivory-border/80 text-left">
              <div>
                <p className="text-xs uppercase tracking-wider text-charcoal-light font-medium">Craftsmanship</p>
                <p className="font-serif text-sm text-charcoal font-semibold mt-0.5">Master Metal Artisans</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-charcoal-light font-medium">Bespoke Customisation</p>
                <p className="font-serif text-sm text-charcoal font-semibold mt-0.5">Tailored Finishes</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-charcoal-light font-medium">Personal Consultation</p>
                <p className="font-serif text-sm text-charcoal font-semibold mt-0.5">Direct Team Service</p>
              </div>
            </div>
          </div>

          {/* Right Editorial Visual Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Featured Photo Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-card border-4 border-white aspect-[4/5] bg-ivory-muted group">
                <img
                  src="/assets/demo/sample_product_1.jpeg"
                  alt="SWAYARI Devotional Art Masterpiece"
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-103"
                  loading="eager"
                />
                
                {/* Subtle vignette and gold accent border */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-[11px] tracking-widest uppercase font-medium text-gold-light">Devotional Masterpiece</p>
                  <h3 className="font-serif text-lg font-medium tracking-wide text-white drop-shadow-sm">
                    Radha Krishna Sacred Embossed Finial Frame
                  </h3>
                  <p className="text-xs text-ivory-light/90 mt-1 font-light">
                    Available for bespoke consultation &amp; custom framing
                  </p>
                </div>
              </div>

              {/* Decorative Brand Accent Card */}
              <div className="hidden sm:block absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-card border border-ivory-border max-w-xs animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-burgundy-light flex items-center justify-center text-burgundy">
                    <Sparkles className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal">Bespoke Order Process</p>
                    <p className="text-[11px] text-charcoal-muted leading-tight mt-0.5">
                      Request custom quotes, sizing, and protective festive packaging.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
