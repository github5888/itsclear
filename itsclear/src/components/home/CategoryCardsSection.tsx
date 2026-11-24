import React from 'react';
import {
  Wheat,
  Droplets,
  Flame,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface CategoryCardsSectionProps {
  onSelectCategory: (category: string) => void;
}

export const CategoryCardsSection: React.FC<CategoryCardsSectionProps> = ({
  onSelectCategory
}) => {
  const categories = [
    {
      id: 'atta',
      title: 'Premium Atta',
      subtitle: 'Cold-stoneground ancient Khapli, Sharbati & 36% Protein whole wheat flours milled slowly below 28°C.',
      badge: '100% Whole Grain',
      buttonText: 'Explore Atta Collection',
      icon: Wheat,
      themeBg: 'bg-[#fffdfa]',
      borderColor: 'border-amber-200/80',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
      btnBg: 'bg-[#0c1523] hover:bg-slate-800 text-white',
      image: '/images/products/khapli-single.jpg'
    },
    {
      id: 'oil',
      title: 'Mustard Oil',
      subtitle: 'Authentic kachi ghani cold-pressed Sarson Ka Tel. Slow crushed in traditional wooden kohlus without chemical extraction.',
      badge: 'Cold-Pressed Kachi Ghani',
      buttonText: 'Explore Mustard Oil',
      icon: Droplets,
      themeBg: 'bg-[#fffdf8]',
      borderColor: 'border-orange-200/80',
      badgeBg: 'bg-orange-100 text-orange-950 border-orange-200',
      btnBg: 'bg-[#ea580c] hover:bg-[#c2410c] text-white',
      image: '/images/products/mustard-oil-pouch.jpg'
    },
    {
      id: 'ghee',
      title: 'Desi Ghee',
      subtitle: 'Traditional Bilona curd-churned pure desi ghee. Simmered on low flame to achieve aromatic golden danedaar texture.',
      badge: 'Bilona Curd Churned',
      buttonText: 'Explore Desi Ghee',
      icon: Flame,
      themeBg: 'bg-[#fffdfa]',
      borderColor: 'border-amber-200/80',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
      btnBg: 'bg-[#0c1523] hover:bg-slate-800 text-white',
      image: '/images/products/desi-ghee-pouch.jpg'
    }
  ];

  return (
    <section id="categories-section" className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-2">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>SHOP BY CATEGORY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Natural Everyday Food Staples
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md font-medium">
            Thoughtfully sourced from verified farmers and cold-processed to preserve essential nutrients.
          </p>
        </div>

        {/* 3 Spacious Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative cursor-pointer rounded-3xl ${cat.themeBg} border ${cat.borderColor} p-6 sm:p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden`}
              >
                <div>
                  {/* Top Header Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black border ${cat.badgeBg}`}>
                      <CatIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{cat.badge}</span>
                    </span>
                  </div>

                  {/* Large Product Visual */}
                  <div className="relative h-48 sm:h-52 w-full flex items-center justify-center my-3 overflow-hidden rounded-2xl bg-gradient-to-b from-amber-50/20 via-white to-slate-50/40 border border-slate-200/60 shadow-inner">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="max-h-full max-w-full object-contain p-2 filter drop-shadow-md select-none group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-black text-slate-950 group-hover:text-orange-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium min-h-[40px]">
                    {cat.subtitle}
                  </p>
                </div>

                {/* Explore Button */}
                <div className="pt-6 mt-4 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory(cat.id);
                    }}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-95 ${cat.btnBg}`}
                  >
                    <span>{cat.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
