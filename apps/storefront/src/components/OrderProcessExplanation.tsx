import React from 'react';
import { ORDER_DISCLAIMER_TEXT } from '@swayari/shared';
import { ShoppingBag, PhoneCall, Truck, AlertCircle, Sparkles } from 'lucide-react';

export const OrderProcessExplanation: React.FC = () => {
  return (
    <section aria-labelledby="process-title" className="py-10 sm:py-14 border-b border-[#E7DFD5] bg-[#FFFFFF]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B49155]/15 border border-[#B49155]/30 text-[#8F7138] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-[#B49155]" />
            <span>How SWAYARI Works</span>
          </div>
          <h2 id="process-title" className="font-display text-[1.65rem] sm:text-[2rem] font-bold text-[#292421]">
            Thoughtful Gifting, Personal Care
          </h2>
          <p className="mt-2 text-[13.5px] sm:text-[14.5px] text-[#7A6E66] leading-relaxed">
            We operate without impersonal automated payment gateways. Every order request receives dedicated attention from our gifting specialists.
          </p>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative mb-8">
          
          {/* Step 1 */}
          <div className="rounded-2xl p-6 bg-[#FAF7F2] border border-[#E7DFD5] flex flex-col items-center text-center relative group hover:border-[#571C2A] transition-all">
            <div className="w-12 h-12 rounded-full bg-[#571C2A] text-white flex items-center justify-center font-display font-bold text-[1.1rem] shadow-sm mb-4">
              1
            </div>
            <div className="w-9 h-9 rounded-full bg-[#B49155]/15 text-[#571C2A] flex items-center justify-center mb-3">
              <ShoppingBag className="w-4 h-4 text-[#B49155]" />
            </div>
            <h3 className="font-display text-[1.15rem] font-bold text-[#292421]">
              Explore &amp; Select
            </h3>
            <p className="mt-2 text-[12.5px] text-[#7A6E66] leading-relaxed">
              Browse our verified budget bands from ₹99 &amp; under. Choose individual pieces or specify bulk favor quantities.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl p-6 bg-[#FAF7F2] border border-[#E7DFD5] flex flex-col items-center text-center relative group hover:border-[#571C2A] transition-all">
            <div className="w-12 h-12 rounded-full bg-[#571C2A] text-white flex items-center justify-center font-display font-bold text-[1.1rem] shadow-sm mb-4">
              2
            </div>
            <div className="w-9 h-9 rounded-full bg-[#B49155]/15 text-[#571C2A] flex items-center justify-center mb-3">
              <PhoneCall className="w-4 h-4 text-[#B49155]" />
            </div>
            <h3 className="font-display text-[1.15rem] font-bold text-[#292421]">
              Submit Order Request
            </h3>
            <p className="mt-2 text-[12.5px] text-[#7A6E66] leading-relaxed">
              Sign in with Google to submit your request list. No payment or credit card details required at checkout.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl p-6 bg-[#FAF7F2] border border-[#E7DFD5] flex flex-col items-center text-center relative group hover:border-[#571C2A] transition-all">
            <div className="w-12 h-12 rounded-full bg-[#571C2A] text-white flex items-center justify-center font-display font-bold text-[1.1rem] shadow-sm mb-4">
              3
            </div>
            <div className="w-9 h-9 rounded-full bg-[#B49155]/15 text-[#571C2A] flex items-center justify-center mb-3">
              <Truck className="w-4 h-4 text-[#B49155]" />
            </div>
            <h3 className="font-display text-[1.15rem] font-bold text-[#292421]">
              Personal Confirmation
            </h3>
            <p className="mt-2 text-[12.5px] text-[#7A6E66] leading-relaxed">
              Our team contacts you to verify stock availability, exact shipping charges, packaging preferences, and delivery schedules.
            </p>
          </div>

        </div>

        {/* Mandatory Order Disclaimer Banner */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#FFF9EE] border border-[#C49A45]/40 text-[#6B5018] flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-[#B49155] flex-shrink-0 mt-0.5" />
          <div className="text-[12.5px] leading-relaxed">
            <span className="font-bold">Transparent Request Policy: </span>
            <span>{ORDER_DISCLAIMER_TEXT}</span>
          </div>
        </div>

      </div>
    </section>
  );
};
