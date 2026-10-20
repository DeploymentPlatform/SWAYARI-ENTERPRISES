import React from 'react';
import { ORDER_DISCLAIMER_TEXT } from '@swayari/shared';
import { ShoppingBag, Send, PhoneCall, AlertCircle, Sparkles } from 'lucide-react';

export const OrderProcessExplanation: React.FC = () => {
  return (
    <section id="how-to-order" aria-labelledby="process-title" className="py-10 sm:py-14 border-b border-[#E6DDD5] bg-[#FFFFFF]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C49A45]/15 border border-[#C49A45]/30 text-[#8F7138] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-[#C49A45]" />
            <span>How Ordering Works</span>
          </div>
          <h2 id="process-title" className="font-display text-[1.65rem] sm:text-[2rem] font-bold text-[#2B2625]">
            Simple, Transparent Order Requests
          </h2>
          <p className="mt-2 text-[13.5px] sm:text-[14.5px] text-[#6B6362] leading-relaxed">
            We operate as an order-request business with personal coordination. No automatic payments or online card checkout.
          </p>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative mb-8">
          
          {/* Step 1: Choose frames and quantities */}
          <div className="rounded-2xl p-6 bg-[#FAF7F2] border border-[#E6DDD5] flex flex-col items-center text-center relative group hover:border-[#5C1D24] transition-all">
            <div className="w-12 h-12 rounded-full bg-[#5C1D24] text-white flex items-center justify-center font-display font-bold text-[1.1rem] shadow-xs mb-4">
              1
            </div>
            <div className="w-9 h-9 rounded-full bg-[#C49A45]/15 text-[#5C1D24] flex items-center justify-center mb-3">
              <ShoppingBag className="w-4 h-4 text-[#C49A45]" />
            </div>
            <h3 className="font-display text-[1.15rem] font-bold text-[#2B2625]">
              Choose frames and quantities
            </h3>
            <p className="mt-2 text-[12.5px] text-[#6B6362] leading-relaxed">
              Explore our devotional frames priced at ₹99 or less. Select your preferred deity designs and enter your event quantities.
            </p>
          </div>

          {/* Step 2: Submit your request */}
          <div className="rounded-2xl p-6 bg-[#FAF7F2] border border-[#E6DDD5] flex flex-col items-center text-center relative group hover:border-[#5C1D24] transition-all">
            <div className="w-12 h-12 rounded-full bg-[#5C1D24] text-white flex items-center justify-center font-display font-bold text-[1.1rem] shadow-xs mb-4">
              2
            </div>
            <div className="w-9 h-9 rounded-full bg-[#C49A45]/15 text-[#5C1D24] flex items-center justify-center mb-3">
              <Send className="w-4 h-4 text-[#C49A45]" />
            </div>
            <h3 className="font-display text-[1.15rem] font-bold text-[#2B2625]">
              Submit your request
            </h3>
            <p className="mt-2 text-[12.5px] text-[#6B6362] leading-relaxed">
              Sign in with Google and submit your request with your occasion, delivery location, and target event date. Zero payment taken online.
            </p>
          </div>

          {/* Step 3: Our team confirms the details */}
          <div className="rounded-2xl p-6 bg-[#FAF7F2] border border-[#E6DDD5] flex flex-col items-center text-center relative group hover:border-[#5C1D24] transition-all">
            <div className="w-12 h-12 rounded-full bg-[#5C1D24] text-white flex items-center justify-center font-display font-bold text-[1.1rem] shadow-xs mb-4">
              3
            </div>
            <div className="w-9 h-9 rounded-full bg-[#C49A45]/15 text-[#5C1D24] flex items-center justify-center mb-3">
              <PhoneCall className="w-4 h-4 text-[#C49A45]" />
            </div>
            <h3 className="font-display text-[1.15rem] font-bold text-[#2B2625]">
              Our team confirms the details
            </h3>
            <p className="mt-2 text-[12.5px] text-[#6B6362] leading-relaxed">
              Our team contacts you to verify stock availability, exact shipping charges, optional packaging, and delivery schedule.
            </p>
          </div>

        </div>

        {/* Mandatory Order Disclaimer Banner */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#FFFBF0] border border-[#C49A45]/40 text-[#6B5018] flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-[#C49A45] flex-shrink-0 mt-0.5" />
          <div className="text-[12.5px] leading-relaxed">
            <span className="font-bold">Important Notice: </span>
            <span>{ORDER_DISCLAIMER_TEXT}</span>
          </div>
        </div>

      </div>
    </section>
  );
};
