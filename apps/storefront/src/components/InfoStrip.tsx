import React from 'react';
import { Tag, Users, Truck, ShieldCheck } from 'lucide-react';

export const InfoStrip: React.FC = () => {
  return (
    <section aria-label="Key ordering assurances" className="py-4 sm:py-5 border-b border-[#E6DDD5] bg-[#FFFFFF]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          
          {/* Feature 1: ₹99 or less per frame */}
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E6DDD5] flex items-center justify-center text-[#5C1D24] flex-shrink-0">
              <Tag className="w-4 h-4 text-[#C49A45]" />
            </div>
            <div>
              <p className="text-[12.5px] sm:text-[13px] font-bold text-[#2B2625] leading-tight">
                ₹99 or less per frame
              </p>
              <p className="text-[11px] text-[#6B6362] mt-0.5 leading-tight">
                Transparent price ceiling on every design
              </p>
            </div>
          </div>

          {/* Feature 2: Bulk order enquiries */}
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E6DDD5] flex items-center justify-center text-[#5C1D24] flex-shrink-0">
              <Users className="w-4 h-4 text-[#C49A45]" />
            </div>
            <div>
              <p className="text-[12.5px] sm:text-[13px] font-bold text-[#2B2625] leading-tight">
                Bulk order enquiries
              </p>
              <p className="text-[11px] text-[#6B6362] mt-0.5 leading-tight">
                Weddings &amp; family return gifts
              </p>
            </div>
          </div>

          {/* Feature 3: Shipping quoted separately */}
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E6DDD5] flex items-center justify-center text-[#5C1D24] flex-shrink-0">
              <Truck className="w-4 h-4 text-[#C49A45]" />
            </div>
            <div>
              <p className="text-[12.5px] sm:text-[13px] font-bold text-[#2B2625] leading-tight">
                Shipping quoted separately
              </p>
              <p className="text-[11px] text-[#6B6362] mt-0.5 leading-tight">
                Calculated accurately for your location
              </p>
            </div>
          </div>

          {/* Feature 4: Order-request model */}
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E6DDD5] flex items-center justify-center text-[#5C1D24] flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#C49A45]" />
            </div>
            <div>
              <p className="text-[12.5px] sm:text-[13px] font-bold text-[#2B2625] leading-tight">
                Order-request model
              </p>
              <p className="text-[11px] text-[#6B6362] mt-0.5 leading-tight">
                No automatic checkout or payment gate
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
