import React from 'react';
import { BrandName } from '../components/common/BrandName';
import {
  Wheat,
  Droplets,
  Flame,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

interface OurStoryPageProps {
  onExploreShop: (category?: string) => void;
}

export const OurStoryPage: React.FC<OurStoryPageProps> = ({ onExploreShop }) => {
  return (
    <div className="w-full bg-[#fdfbf7] text-slate-900 pb-20 space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-12 sm:pt-16 pb-14 px-4 sm:px-8 lg:px-16 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 text-amber-900 text-xs font-black uppercase tracking-wider border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Our Roots &amp; Heritage</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight">
            Pure Goodness. Honest Food. <br className="hidden sm:inline" />
            <span className="text-[#ea580c]">Direct From Soil to Kitchen.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-lg text-slate-600 font-medium leading-relaxed">
            ItsClear was founded on a simple belief: daily food staples shouldn&apos;t be compromised by high-speed industrial rollers, chemical solvent extraction, or synthetic adulterants. We bring back authentic Indian food wisdom with complete transparency.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onExploreShop()}
              className="px-6 py-3.5 rounded-2xl bg-[#0c1523] hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2 active:scale-95"
            >
              <span>Explore Natural Essentials</span>
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </button>
            <button
              onClick={() => onExploreShop('atta')}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-orange-50/60 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs transition-all active:scale-95"
            >
              <span>View Chakki Attas</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. THREE NATURAL STAPLE PILLARS */}
      <section className="w-full px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Our 3 Core Kitchen Essentials
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Crafted with zero industrial shortcuts, honoring traditional methods that safeguard nutrition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Pillar 1: Stoneground Atta */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div>
              <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 bg-slate-50 border border-slate-100 shadow-2xs">
                <img
                  src="/images/products/khapli-single.jpg"
                  alt="Cold Stoneground Atta"
                  className="w-full h-full object-cover select-none hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center mb-3">
                <Wheat className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-black text-slate-950">
                Cold Stoneground Atta
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mt-2">
                Slow milled on authentic natural emery stones strictly below 28°C. Unlike commercial high-speed steel rollers that burn nutrients, our slow stone friction preserves live wheat germ, vitamin E, and 100% natural dietary fiber with strictly zero maida.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-orange-700 flex items-center space-x-1.5 border-t border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Khapli, Sharbati &amp; 36% Protein Atta</span>
            </div>
          </div>

          {/* Pillar 2: Cold-Pressed Mustard Oil */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div>
              <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 bg-slate-50 border border-slate-100 shadow-2xs">
                <img
                  src="/images/products/mustard-oil-bottle.jpg"
                  alt="Cold-Pressed Mustard Oil"
                  className="w-full h-full object-cover select-none hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-100/80 text-orange-800 flex items-center justify-center mb-3">
                <Droplets className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-black text-slate-950">
                Kachi Ghani Mustard Oil
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mt-2">
                Extracted slowly at low ambient temperatures without chemical solvents like hexane or synthetic deodorization. Grade-1 golden and black mustard seeds crushed slowly in wooden kohlus to retain authentic natural pungency and high smoke point.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-orange-700 flex items-center space-x-1.5 border-t border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Wooden Kohlu &amp; Chemical-Free</span>
            </div>
          </div>

          {/* Pillar 3: Traditional Bilona Desi Ghee */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div>
              <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 bg-slate-50 border border-slate-100 shadow-2xs">
                <img
                  src="/images/products/desi-ghee-jar.jpg"
                  alt="Traditional Bilona Desi Ghee"
                  className="w-full h-full object-cover select-none hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center mb-3">
                <Flame className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-xl font-black text-slate-950">
                Traditional Bilona Desi Ghee
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mt-2">
                Prepared according to the timeless Ayurvedic Bilona method: fresh whole milk cultured into curd, churned with wooden bilonas to separate natural makhan, and gently simmered on low flame to create aromatic, golden granular (danedaar) pure ghee.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-orange-700 flex items-center space-x-1.5 border-t border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Aromatic, Danedaar &amp; 100% Pure</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FARM-DIRECT ETHOS & PURITY ASSURANCE */}
      <section className="w-full px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-[#0c1523] text-white p-8 sm:p-12 lg:p-14 relative overflow-hidden">
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-orange-300 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Single Origin Sourcing</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Honoring Direct Relationships With Progressive Indian Farmers
            </h2>

            <p className="text-xs sm:text-base text-slate-300 font-normal leading-relaxed">
              We source directly from farmer producer groups across Maharashtra, Madhya Pradesh, and Rajasthan. By eliminating industrial commission agents and wholesale storage warehouses, farmers earn fair premiums and our customers receive fresh staples milled and packaged within 24 hours of dispatch.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/15">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-orange-400">100%</span>
                <span className="text-xs text-slate-400 block mt-0.5">Traceable Batches</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-orange-400">&lt; 28°C</span>
                <span className="text-xs text-slate-400 block mt-0.5">Cold Milling Limit</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-orange-400">0%</span>
                <span className="text-xs text-slate-400 block mt-0.5">Preservatives or Maida</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VERIFIED TESTING GUARANTEE */}
      <section className="w-full px-4 sm:px-8 lg:px-16 max-w-5xl mx-auto text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
          Independent Quality Testing
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Every batch produced is tested through certified partner laboratories for zero pesticide residues, zero heavy metals, and verified nutritional values. Digitally verifiable lab test reports remain accessible on every batch.
        </p>

        <div className="pt-2">
          <button
            onClick={() => onExploreShop()}
            className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all inline-flex items-center space-x-2"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
