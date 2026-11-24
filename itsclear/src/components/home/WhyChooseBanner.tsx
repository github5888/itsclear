import React from 'react';
import { Leaf, Wheat, ShieldCheck, Zap } from 'lucide-react';
import { BrandName } from '../common/BrandName';

export const WhyChooseBanner: React.FC = () => {
  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-6">
      <div className="rounded-3xl bg-gradient-to-r from-[#f0fbf4] via-[#f7fdf9] to-[#fffdf9] border border-emerald-200/70 p-5 sm:p-6 lg:p-7 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Brand Title */}
          <div className="lg:col-span-3 text-center lg:text-left border-b lg:border-b-0 lg:border-r border-emerald-200/60 pb-4 lg:pb-0 lg:pr-6">
            <span className="text-xs sm:text-sm font-bold text-slate-600 block">
              Why Choose
            </span>
            <div className="mt-0.5">
              <BrandName size="md" theme="dark" />
              <span className="text-xl sm:text-2xl font-black text-slate-900 ml-1">?</span>
            </div>
          </div>

          {/* 4 Trust Badges */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Badge 1: 100% Natural */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
                <Leaf className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs sm:text-sm text-slate-950 truncate">
                  100% Natural
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  No added chemicals
                </p>
              </div>
            </div>

            {/* Badge 2: Zero Maida */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 shadow-2xs">
                <Wheat className="w-6 h-6 text-amber-700" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs sm:text-sm text-slate-950 truncate">
                  Zero Maida
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  100% whole grain
                </p>
              </div>
            </div>

            {/* Badge 3: Cold Chakki Milled */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-100/80 border border-orange-300 flex items-center justify-center text-orange-800 shrink-0 shadow-2xs">
                <div className="w-6 h-6 rounded-full border-2 border-orange-700 border-dashed flex items-center justify-center text-[10px] font-black text-orange-800">
                  28°
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs sm:text-sm text-slate-950 truncate">
                  Cold Chakki Milled
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  Below 28°C
                </p>
              </div>
            </div>

            {/* Badge 4: Lab Tested */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-100/80 border border-teal-300 flex items-center justify-center text-teal-800 shrink-0 shadow-2xs">
                <ShieldCheck className="w-6 h-6 text-teal-700" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs sm:text-sm text-slate-950 truncate">
                  Lab Tested
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  Purity &amp; quality assured
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
