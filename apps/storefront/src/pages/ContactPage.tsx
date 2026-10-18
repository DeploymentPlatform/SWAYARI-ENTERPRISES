import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occasion: 'Devotional Home Temple',
    message: ''
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal tracking-tight">
          Connect with Our Studio
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted font-light leading-relaxed">
          For custom metal finishes, bespoke temple commissions, wedding registries, or festive corporate gifting enquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Studio Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-ivory-border shadow-card space-y-6">
            <h3 className="font-serif text-lg font-semibold text-charcoal border-b border-ivory-border pb-3">
              Studio &amp; Office
            </h3>

            <div className="space-y-4 text-xs text-charcoal-muted">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-burgundy flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-charcoal block">Email Inquiries:</span>
                  <a href="mailto:swayarienterprises@gmail.com" className="hover:text-burgundy">
                    swayarienterprises@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-burgundy flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-charcoal block">Telephone Consultation:</span>
                  <span>Direct phone coordination upon request submission</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-burgundy flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-charcoal block">Artisanal Studio:</span>
                  <span>SWAYARI ENTERPRISES, India</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-ivory-border text-[11px] text-charcoal-light leading-relaxed">
              <p>
                <strong>Operating Schedule:</strong> Monday – Saturday, 10:00 AM – 6:30 PM IST. Enquiries received outside studio hours are attended to the next business morning.
              </p>
            </div>
          </div>
        </div>

        {/* Right Direct Enquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-ivory-border shadow-card">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-xl font-semibold text-charcoal">Enquiry Received</h3>
                <p className="text-xs text-charcoal-muted max-w-sm mx-auto font-light leading-relaxed">
                  Thank you for reaching out. A studio curator will review your enquiry and contact you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-semibold text-burgundy hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-lg font-semibold text-charcoal border-b border-ivory-border pb-3">
                  Initiate Bespoke Enquiry
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-charcoal block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full text-xs p-3 rounded-lg border border-ivory-border bg-ivory-light focus:outline-none focus:border-burgundy"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-charcoal block mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full text-xs p-3 rounded-lg border border-ivory-border bg-ivory-light focus:outline-none focus:border-burgundy"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-charcoal block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full text-xs p-3 rounded-lg border border-ivory-border bg-ivory-light focus:outline-none focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-charcoal block mb-1">Occasion / Interest</label>
                  <select
                    value={formData.occasion}
                    onChange={e => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full text-xs p-3 rounded-lg border border-ivory-border bg-ivory-light focus:outline-none focus:border-burgundy text-charcoal"
                  >
                    <option>Devotional Home Temple Sanctification</option>
                    <option>Housewarming (Griha Pravesham) Gifting</option>
                    <option>Wedding &amp; Festive Return Gifting</option>
                    <option>Corporate Commemorative Commission</option>
                    <option>Architectural / Interior Project</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-charcoal block mb-1">Message &amp; Requirements *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about the desired dimensions, finishes, or quantities..."
                    className="w-full text-xs p-3 rounded-lg border border-ivory-border bg-ivory-light focus:outline-none focus:border-burgundy"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-md bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold tracking-wide shadow-card transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Studio Enquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
