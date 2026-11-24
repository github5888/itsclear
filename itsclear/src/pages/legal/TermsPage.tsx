import React from 'react';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-amber-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store</span>
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Terms of Service</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Last Updated: November 2026 • itsclear Technologies</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-6">
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing and using <strong>itsclear.in</strong> and purchasing our cold-stone milled flours and natural farm produce, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">2. Nature of Fresh Products</h2>
            <p>
              itsclear provides 100% pure stoneground chakki atta containing zero chemical bleaching agents, zero maida, and zero artificial preservatives. Due to the completely unadulterated nature of whole wheat and natural grains, products should be stored in cool, dry, and airtight containers. Recommended shelf life is 45 to 60 days from the milling date indicated on the packaging.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">3. Pricing &amp; Payments</h2>
            <p>
              All prices listed on the website are in Indian Rupees (INR) and are inclusive of applicable taxes. We accept Cash on Delivery (COD), Direct UPI transfers, and authorized digital payment methods. We reserve the right to revise product prices or promotional discounts at any time prior to order confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">4. Orders &amp; Delivery</h2>
            <p>
              Orders are dispatched fresh after milling. For local express deliveries, slots are scheduled between 07:00 AM and 09:00 PM. In the event of extreme weather or road blockages, delivery times may be reasonably adjusted, and customer support will keep you informed.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">5. Governing Law &amp; Jurisdiction</h2>
            <p>
              These terms are governed by the laws of India. Any disputes arising out of or related to our products or services shall be subject to the exclusive jurisdiction of the courts in Lucknow, Uttar Pradesh.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              For any legal or regulatory queries, please contact our legal counsel at <strong>legal@itsclear.in</strong> or write to itsclear Technologies, Lucknow, Uttar Pradesh, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
