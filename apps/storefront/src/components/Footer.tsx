import React from 'react';
import { Mail, ShieldCheck, HeartHandshake, Truck } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-ivory-surface border-t border-ivory-border/80 text-charcoal">
      {/* Heritage Brand Trust Bar */}
      <div className="border-b border-ivory-border/60 py-8 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-burgundy-light flex items-center justify-center text-burgundy flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-charcoal">Authentic Craftsmanship</h4>
                <p className="text-xs text-charcoal-muted mt-0.5">Hand-cast metals &amp; master-finished iconography</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-burgundy-light flex items-center justify-center text-burgundy flex-shrink-0">
                <HeartHandshake className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-charcoal">Personal Consultation</h4>
                <p className="text-xs text-charcoal-muted mt-0.5">Every request is reviewed and confirmed personally</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-burgundy-light flex items-center justify-center text-burgundy flex-shrink-0">
                <Truck className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-charcoal">Secure Bespoke Dispatch</h4>
                <p className="text-xs text-charcoal-muted mt-0.5">Multi-layer protective festive packaging</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <img
              src="/assets/brand/swayari-logo.svg"
              alt="SWAYARI — Décor & Gifting"
              className="h-10 w-auto object-contain"
            />
            <p className="text-xs text-charcoal-muted leading-relaxed max-w-sm font-light">
              SWAYARI ENTERPRISES curates timeless devotional iconography, bell metal brassware, and bespoke gifting created with reverence for traditional Indian heritage.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-charcoal-muted">
              <Mail className="w-4 h-4 text-burgundy" />
              <a href="mailto:swayarienterprises@gmail.com" className="hover:text-burgundy transition-colors">
                swayarienterprises@gmail.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif text-sm font-semibold text-charcoal tracking-wide">Explore SWAYARI</h4>
            <ul className="space-y-2 text-xs text-charcoal-muted">
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-burgundy transition-colors">
                  Complete Catalogue
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-burgundy transition-colors">
                  Our Craft Philosophy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-burgundy transition-colors">
                  Bespoke Enquiries
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/orders')} className="hover:text-burgundy transition-colors">
                  My Order Requests
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Assurance */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-serif text-sm font-semibold text-charcoal tracking-wide">Client Assistance &amp; Policies</h4>
            <ul className="space-y-2 text-xs text-charcoal-muted">
              <li>
                <button onClick={() => navigate('/ordering-policy')} className="hover:text-burgundy transition-colors">
                  Ordering &amp; Delivery Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy-policy')} className="hover:text-burgundy transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>

            <div className="pt-3 border-t border-ivory-border/70 text-[11px] text-charcoal-light leading-relaxed">
              <p>
                <strong>Order Model:</strong> We operate on a bespoke order-request model. Submitting a request initiates direct consultation with our team to finalize dimensions, finishes, and logistics.
              </p>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-ivory-border/80 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-light">
          <p>© {new Date().getFullYear()} SWAYARI ENTERPRISES. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-[11px] text-charcoal-light">
            Handcrafted with devotion in India
          </p>
        </div>
      </div>
    </footer>
  );
};
