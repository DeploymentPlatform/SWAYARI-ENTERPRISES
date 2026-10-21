import React from 'react';
import { Link } from '../lib/router';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="bg-[#35121C] text-[#F7F4EF] border-t border-[#B49155]/30">
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        
        {/* Brand & Mission */}
        <div className="md:col-span-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-[#B49155]/40 bg-[#FAF7F2] p-1 flex items-center justify-center">
              <img src="/assets/brand/swayari-logo.svg" alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-wordmark text-[1.375rem] font-bold tracking-wider text-white">
                SWAYARI
              </span>
              <p className="text-[10px] tracking-[0.2em] text-[#B49155] uppercase font-medium">
                Décor &amp; Gifting
              </p>
            </div>
          </div>

          <p className="mt-4 text-[13px] text-[#F7F4EF]/85 leading-relaxed max-w-sm">
            Devotional god frames priced at ₹99 or less per frame. Auspicious return gifts for weddings, griha pravesh and family celebrations.
          </p>

          <div className="mt-5 p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11.5px] text-[#F7F4EF]/80 leading-relaxed">
            <strong className="text-[#D8C29D] font-semibold block mb-0.5">Order Request Policy:</strong>
            Submitting an order request does not take online payments or reserve stock. Our team contacts you directly to confirm availability, dimensions, packaging, and final pricing.
          </div>
        </div>

        {/* Collections */}
        <div className="md:col-span-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B49155]">
            Collections
          </h2>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            <li>
              <Link to="/shop?category=devotional-frames" className="text-[#F7F4EF]/80 hover:text-white hover:underline transition-colors">
                All Devotional Frames (≤ ₹99)
              </Link>
            </li>
            <li>
              <Link to="/shop?category=ganesha-frames" className="text-[#F7F4EF]/80 hover:text-white hover:underline transition-colors">
                Lord Ganesha Frames
              </Link>
            </li>
            <li>
              <Link to="/shop?category=lakshmi-frames" className="text-[#F7F4EF]/80 hover:text-white hover:underline transition-colors">
                Goddess Lakshmi Frames
              </Link>
            </li>
            <li>
              <Link to="/shop?category=balaji-frames" className="text-[#F7F4EF]/80 hover:text-white hover:underline transition-colors">
                Tirupati Balaji Frames
              </Link>
            </li>
            <li>
              <Link to="/shop?category=radha-krishna-frames" className="text-[#F7F4EF]/80 hover:text-white hover:underline transition-colors">
                Radha Krishna Frames
              </Link>
            </li>
            <li>
              <Link to="/shop?category=mini-return-gift-frames" className="text-[#F7F4EF]/80 hover:text-white hover:underline transition-colors">
                Mini Return Gift Frames (≤ ₹49)
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links & Policies */}
        <div className="md:col-span-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B49155]">
            Customer Care
          </h2>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            <li>
              <Link to="/account/orders" className="text-[#F7F4EF]/80 hover:text-white hover:underline transition-colors">
                My Order Requests
              </Link>
            </li>
            <li>
              <Link to="/ordering-policy" className="text-[#F7F4EF]/80 hover:text-white hover:underline transition-colors">
                How Ordering Works
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-[#F7F4EF]/80 hover:text-white hover:underline transition-colors">
                Our Story &amp; Heritage
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="text-[#F7F4EF]/80 hover:text-white hover:underline transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-[#F7F4EF]/80 hover:text-white hover:underline transition-colors">
                Contact &amp; Assistance
              </Link>
            </li>
          </ul>
        </div>

        {/* Business Contact */}
        <div className="md:col-span-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B49155]">
            SWAYARI ENTERPRISES
          </h2>
          <div className="mt-4 space-y-3 text-[13px] text-[#F7F4EF]/85">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[#B49155] flex-shrink-0 mt-0.5" />
              <a href="mailto:swayarienterprises@gmail.com" className="hover:text-white underline underline-offset-2 break-all">
                swayarienterprises@gmail.com
              </a>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-[#B49155] flex-shrink-0 mt-0.5" />
              <span>Personal Consultation via Call / WhatsApp</span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#B49155] flex-shrink-0 mt-0.5" />
              <span>Protective Packaging for Celebration Gifting</span>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Strip */}
      <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#F7F4EF]/60 gap-3">
        <p>&copy; {new Date().getFullYear()} SWAYARI ENTERPRISES. All rights reserved.</p>
        <p>Bespoke Catalogue &amp; Order Request Application</p>
      </div>
    </div>
  </footer>
);
