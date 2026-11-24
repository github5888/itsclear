import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Award, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

interface ContactPageProps {
  onBack: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-amber-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store</span>
      </button>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950">Contact &amp; Customer Support</h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2">
          Have a question about our cold stone milling process, bulk order, or your recent delivery? We are here to help!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-3 text-emerald-600 mb-3">
              <Phone className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Customer Helpline</h3>
            </div>
            <p className="text-sm text-slate-700 font-semibold">+91 1800-CLEAR-99</p>
            <p className="text-xs text-slate-500 mt-1">Mon - Sun: 08:00 AM - 08:00 PM</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-3 text-emerald-600 mb-3">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">WhatsApp Support</h3>
            </div>
            <p className="text-sm text-slate-700 font-semibold">+91 98765 43210</p>
            <p className="text-xs text-slate-500 mt-1">Instant chat &amp; delivery inquiries</p>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs font-bold text-emerald-700 hover:underline"
            >
              Open WhatsApp Chat &rarr;
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-3 text-amber-600 mb-3">
              <Mail className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Email Desk</h3>
            </div>
            <p className="text-sm text-slate-700 font-semibold">support@itsclear.in</p>
            <p className="text-xs text-slate-500 mt-1">Queries answered within 2 hours</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-3 text-slate-700 mb-3">
              <MapPin className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Chakki Mill Location</h3>
            </div>
            <p className="text-sm text-slate-700">itsclear Technologies &amp; Mills</p>
            <p className="text-xs text-slate-500 mt-1">Gomti Nagar / Shaheed Path Hub, Lucknow, UP 226010</p>
            <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-700 font-bold border-t border-slate-100 pt-3">
              <Award className="w-4 h-4 text-orange-600" />
              <span>FSSAI Lic. #10022091000124</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Send Us a Direct Message</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">Fill out the form below and our milling team will respond promptly.</p>

            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-emerald-950">Message Sent Successfully!</h3>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1 max-w-md mx-auto">
                  Thank you for reaching out to itsclear. Our customer care team will connect with you on {form.phone || form.email} shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Ramesh Singh"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Query / Requirements *</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your atta requirements, feedback, or delivery inquiry..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-950 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
