import React from 'react';
import { BrandName } from '../common/BrandName';
import { Floating3DIcon } from '../three/Floating3DIcon';
import { ShieldCheck, Truck, RotateCcw, HeartHandshake, Phone, Mail, MapPin, Award } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="bg-slate-100/90 border-t border-slate-200 text-slate-700 text-sm sm:text-base mt-20">
      {/* 4 Value Pillars (Enlarged Cards & Generous Typography) */}
      <div className="border-b border-slate-200 py-12 sm:py-14">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start space-x-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
              <Floating3DIcon size="md" color="gold">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </Floating3DIcon>
              <div>
                <h4 className="font-black text-slate-950 text-base sm:text-lg">100% Zero Maida</h4>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 leading-snug">
                  Lab-tested with zero bleaching chemicals, no maida, and no added gluten
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
              <Floating3DIcon size="md" color="emerald">
                <Truck className="w-6 h-6 text-emerald-600" />
              </Floating3DIcon>
              <div>
                <h4 className="font-black text-slate-950 text-base sm:text-lg">Fresh Cold-Chakki Milled</h4>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 leading-snug">
                  Slow-milled below 28°C on traditional emery stones and dispatched within 24 hours
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
              <Floating3DIcon size="md" color="gold">
                <RotateCcw className="w-6 h-6 text-amber-600" />
              </Floating3DIcon>
              <div>
                <h4 className="font-black text-slate-950 text-base sm:text-lg">100% Bran Retained</h4>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 leading-snug">
                  Every particle of dietary coarse fiber and live wheat germ stays intact
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
              <Floating3DIcon size="md" color="emerald">
                <HeartHandshake className="w-6 h-6 text-emerald-600" />
              </Floating3DIcon>
              <div>
                <h4 className="font-black text-slate-950 text-base sm:text-lg">Direct Sehore Farmers</h4>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 leading-snug">
                  Fair premium pricing paid directly to certified organic Indian wheat growers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-slate-200">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <BrandName size="lg" theme="dark" />
              <p className="text-xs sm:text-sm text-slate-500 font-bold mt-2 uppercase tracking-wide">
                100% Pure Stoneground Chakki Atta Superstore
              </p>
            </div>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-md font-normal">
              itsclear was founded on a simple truth: Indian families deserve 100% honest, unadulterated stoneground wheat flour. From ancient Khapli (Emmer) to 36% High Protein and royal MP Sharbati — every grain is cold-milled on traditional emery stones with crystal clear lab transparency.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 text-sm sm:text-base font-bold text-slate-800">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-600 shrink-0" />
                <span>Sehore &amp; Malwa Mills, MP</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>+91 1800-CLEAR-99</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-black text-slate-950 text-base sm:text-lg uppercase tracking-wider mb-4">
              Pure Atta Varieties
            </h4>
            <ul className="space-y-2.5 text-sm sm:text-base font-medium">
              <li>
                <button onClick={() => setCurrentTab('shop')} className="text-slate-700 hover:text-orange-600 transition-colors">
                  Khapli (Emmer) Ancient Atta
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('shop')} className="text-slate-700 hover:text-orange-600 transition-colors">
                  36% High Protein Atta
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('shop')} className="text-slate-700 hover:text-orange-600 transition-colors">
                  MP Sharbati Gold 100% Whole Wheat
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('shop')} className="text-slate-700 hover:text-orange-600 transition-colors">
                  9-Supergrain Multigrain Atta
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('shop')} className="text-slate-700 hover:text-orange-600 transition-colors">
                  Diabetic Care Low-GI (42) Atta
                </button>
              </li>
            </ul>
          </div>

          {/* Natural Food Store Navigation */}
          <div>
            <h4 className="font-black text-slate-950 text-base sm:text-lg uppercase tracking-wider mb-4">
              Natural Food Store
            </h4>
            <ul className="space-y-2.5 text-sm sm:text-base font-medium">
              <li>
                <button onClick={() => setCurrentTab('shop')} className="text-slate-700 hover:text-orange-600 transition-colors">
                  Shop All Natural Essentials
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('our-story')} className="text-slate-700 hover:text-orange-600 transition-colors">
                  Our Story &amp; Heritage
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('orders')} className="text-slate-700 hover:text-orange-600 transition-colors">
                  Order Tracking
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('profile')} className="text-slate-700 hover:text-orange-600 transition-colors">
                  Grain Loyalty Coins &amp; Subscriptions
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('contact')} className="text-slate-700 hover:text-orange-600 transition-colors">
                  Contact &amp; Support Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Fresh Milling Newsletter */}
          <div>
            <h4 className="font-black text-slate-950 text-base sm:text-lg uppercase tracking-wider mb-4">
              Fresh Milling Dispatch
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mb-3.5 leading-relaxed font-medium">
              Receive alerts when fresh seasonal grain batches enter cold stone milling.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 w-full focus:outline-none focus:border-orange-500 shadow-2xs font-medium"
              />
              <button className="px-5 py-2.5 bg-slate-950 hover:bg-orange-500 text-white font-bold rounded-xl text-sm sm:text-base shrink-0 transition-all shadow-2xs">
                Join
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2.5 font-medium">
              Zero spam. Only pure harvest updates &amp; exclusive fresh chakki coupons.
            </p>
          </div>
        </div>

        {/* Legal & Policy Navigation Bar (Required for Payment Gateways & Compliance) */}
        <div className="pt-8 border-t border-slate-200 mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-600 font-medium">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2">
            <button onClick={() => setCurrentTab('privacy')} className="hover:text-amber-600 transition-colors">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => setCurrentTab('terms')} className="hover:text-amber-600 transition-colors">
              Terms of Service
            </button>
            <span>•</span>
            <button onClick={() => setCurrentTab('refund-policy')} className="hover:text-amber-600 transition-colors">
              Return &amp; Refund Policy
            </button>
            <span>•</span>
            <button onClick={() => setCurrentTab('shipping-policy')} className="hover:text-amber-600 transition-colors">
              Shipping &amp; Delivery
            </button>
            <span>•</span>
            <button onClick={() => setCurrentTab('contact')} className="hover:text-amber-600 transition-colors">
              Contact Us
            </button>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="flex items-center space-x-1.5 text-slate-800 font-bold">
              <Award className="w-4 h-4 text-orange-600" />
              <span>FSSAI Lic. #10022091000124</span>
            </span>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="pt-4 text-center md:text-left text-xs text-slate-500">
          © 2026 itsclear Technologies. 100% Pure Stoneground Chakki Atta. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
