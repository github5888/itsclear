import React from 'react';
import { Truck, ArrowLeft, Clock, MapPin, CheckCircle } from 'lucide-react';

interface ShippingPolicyPageProps {
  onBack: () => void;
}

export const ShippingPolicyPage: React.FC<ShippingPolicyPageProps> = ({ onBack }) => {
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
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Shipping &amp; Delivery Policy</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Farm-Fresh Stoneground Chakki Atta Dispatched Direct to Your Kitchen
            </p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose my-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <Clock className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">2-Hour Farm Express</h3>
              <p className="text-xs text-slate-600 mt-1">Hyperlocal delivery in select urban sectors</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <Truck className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Same-Day Evening</h3>
              <p className="text-xs text-slate-600 mt-1">Milled in morning, delivered before 8 PM</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Zero-Carbon EV Fleet</h3>
              <p className="text-xs text-slate-600 mt-1">Eco-friendly temperature-controlled vans</p>
            </div>
          </div>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">1. Delivery Zones &amp; Coverage</h2>
            <p>
              We currently offer daily scheduled deliveries across <strong>Lucknow and adjoining NCR/UP zones</strong>. For regional orders outside primary zones, dispatches occur via certified express logistics partners within 24 to 48 hours.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">2. Shipping Charges &amp; Free Delivery</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Orders ₹499 and Above:</strong> Free Doorstep Delivery across all serviceable zones.</li>
              <li><strong>Orders under ₹499:</strong> Standard nominal delivery fee of ₹40 to ₹60 depending on delivery slot.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">3. Real-Time Order Tracking</h2>
            <p>
              Once your order is milled and loaded onto our delivery van, you can track the status in real time using your Order ID on the <strong>Live Van Tracking</strong> page. You will also receive dispatch alerts via SMS and WhatsApp.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              For shipping queries or address changes after placing an order, please message our logistics team on WhatsApp at <strong>+91 98765 43210</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
