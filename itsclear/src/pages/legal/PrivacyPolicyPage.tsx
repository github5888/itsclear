import React from 'react';
import { Shield, ArrowLeft, Lock } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store</span>
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Privacy Policy</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Compliant with Information Technology Act, 2000 &amp; Digital Personal Data Protection Act, 2023
            </p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-6">
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">1. Information We Collect</h2>
            <p>
              When you purchase stoneground flours on <strong>itsclear</strong> or register an account, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact Information:</strong> Name, delivery address, phone number, and email address.</li>
              <li><strong>Order Details:</strong> Products purchased, milling preferences, delivery slot chosen, and payment method.</li>
              <li><strong>Technical Data:</strong> Browser type, IP address, and cookie identifiers to maintain your cart and session securely.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">2. How We Use Your Information</h2>
            <p>
              Your personal data is used strictly for:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Milling and dispatching your flour orders directly to your doorstep.</li>
              <li>Sending order status and live EV van dispatch notifications via SMS, Email, or WhatsApp.</li>
              <li>Crediting and tracking your Grain Coins loyalty balance.</li>
              <li>Preventing fraud and securing your customer account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">3. Zero Selling of Data</h2>
            <p>
              <strong>We never sell, rent, or lease customer data to third-party advertisers.</strong> Your information is only shared with trusted fulfillment partners (such as local delivery riders) solely to execute doorstep delivery.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">4. Payment Security</h2>
            <p>
              We do not store your credit card, debit card, or net banking passwords on our servers. All digital transactions are processed through RBI-approved, PCI-DSS certified payment gateways or direct UPI networks using 256-bit encryption.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">5. Data Retention &amp; Customer Rights</h2>
            <p>
              You have the right to request access to your stored personal data or request deletion of your account at any time by writing to our Data Protection Officer at <strong>privacy@itsclear.in</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
