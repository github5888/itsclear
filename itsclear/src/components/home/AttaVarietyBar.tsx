import React, { useRef, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface AttaVarietyBarProps {
  onSelectVariety: (varietyId: string) => void;
}

export const AttaVarietyBar: React.FC<AttaVarietyBarProps> = ({ onSelectVariety }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>('khapli');

  const varieties = [
    {
      id: 'khapli',
      name: 'Khapli Atta',
      tagline: 'High Fiber, Easy to Digest',
      image: '/images/products/khapli-bori-only.png',
      productId: 'itsclear-khapli-ancient'
    },
    {
      id: 'sharbati',
      name: 'Sharbati Atta',
      tagline: 'Soft & Nutritious',
      image: '/images/products/khapli-single.jpg',
      productId: 'itsclear-sharbati-gold'
    },
    {
      id: 'multigrain',
      name: 'Multigrain Atta',
      tagline: 'Power of 5 Grains',
      image: '/images/products/protein-bori-only.png',
      productId: 'itsclear-multigrain'
    },
    {
      id: 'bajra',
      name: 'Bajra Atta',
      tagline: 'Rich in Minerals',
      image: '/images/products/khapli-sizes-badges-bori-only.png',
      productId: 'itsclear-bajra-pearl'
    },
    {
      id: 'jowar',
      name: 'Jowar Atta',
      tagline: 'Gluten Free',
      image: '/images/products/protein-single.jpg',
      productId: 'itsclear-jowar-sorghum'
    }
  ];

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title with Orange Accent Bar */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-1.5 h-6 bg-[#ea580c] rounded-full" />
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Shop by Atta Variety
          </h2>
        </div>

        {/* Horizontal Scrolling Pill Cards */}
        <div className="relative flex-1 flex items-center overflow-hidden">
          <div
            ref={scrollRef}
            className="flex items-center space-x-3 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth w-full"
          >
            {varieties.map((v) => {
              const isActive = activeId === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setActiveId(v.id);
                    onSelectVariety(v.productId);
                  }}
                  className={`flex items-center space-x-3 p-2 sm:p-2.5 rounded-2xl border transition-all shrink-0 text-left cursor-pointer group ${
                    isActive
                      ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-50 p-1 flex items-center justify-center shrink-0 border border-slate-100">
                    <img
                      src={v.image}
                      alt={v.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-2xs group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Text Details */}
                  <div className="pr-2 min-w-0">
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-amber-800 truncate">
                      {v.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {v.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Scroll Arrow */}
          <button
            onClick={handleScrollRight}
            className="hidden sm:flex ml-2 p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm shrink-0 transition-all active:scale-95"
            title="Scroll Varieties"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
