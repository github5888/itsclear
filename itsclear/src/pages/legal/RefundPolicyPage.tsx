import React from 'react';
import { RotateCcw, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface RefundPolicyPageProps {
  onBack: () => void;
}

export const RefundPolicyPage: React.FC<RefundPolicyPageProps> = ({ onBack }) => {
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
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Return, Refund &amp; Cancellation Policy</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              100% Customer Satisfaction Guarantee on Pure Fresh Milled Flour
            </p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3 not-prose">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs sm:text-sm text-emerald-900">
              <strong>Our 100% Purity Promise:</strong> If you are not satisfied with the freshness, aroma, or quality of your chakki atta, or if a bag arrives damaged, we provide an immediate <strong>100% free replacement or full refund</strong> within 48 hours of delivery.
            </div>
          </div>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">1. Cancellation Policy</h2>
            <p>
              Because our atta is slow-milled on stone chakkis after order confirmation:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Before Dispatch:</strong> You may cancel your order at any time before dispatch directly from your <strong>Order History</strong> page or by WhatsApp support with a 100% immediate refund.</li>
              <li><strong>After Dispatch:</strong> Once the fresh delivery van has departed for your location, cancellations at the doorstep are treated under our return guidelines.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">2. Returns &amp; Replacements</h2>
            <p>
              As fresh grocery and staple food products have strict hygiene requirements, physical returns of opened bags are handled via photographic inspection:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Damaged Packaging:</strong> If the bori or pouch arrives torn, punctured, or wet, reject the delivery or send a photo within 48 hours for immediate replacement.</li>
              <li><strong>Quality or Texture Issue:</strong> If the flour does not match the chosen coarseness or shows any defects, contact us on WhatsApp (+91 98765 43210) with your order ID. A fresh batch will be dispatched to you at zero extra charge.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">3. Refund Processing Timeline</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>UPI / Netbanking:</strong> Refunds are credited directly back to the original source bank account within <strong>3 to 5 business days</strong>.</li>
              <li><strong>Cash on Delivery (COD):</strong> For COD orders, refund amount can be credited instantly to your <strong>Grain Coins Wallet</strong> or transferred via UPI to your phone number within <strong>24 hours</strong>.</li>
            </ul>
          </section>

          <section className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              For return and refund assistance, message us on WhatsApp at <strong>+91 98765 43210</strong> or email <strong>support@itsclear.in</strong> with your Order ID.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
