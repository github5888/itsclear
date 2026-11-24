import React from 'react';
import {
  Wheat,
  RotateCw,
  ShieldCheck,
  Truck,
  Star,
  Quote,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface ChakkiAndReviewsSectionProps {
  onExploreAttas: () => void;
}

export const ChakkiAndReviewsSection: React.FC<ChakkiAndReviewsSectionProps> = ({
  onExploreAttas
}) => {
  const steps = [
    {
      num: '01',
      title: 'Farmer Sourced Ancient Grains',
      desc: 'Unhybridized Khapli & Sharbati wheat directly procured from organic heritage farms in Sehore & Solapur.',
      icon: Wheat,
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      num: '02',
      title: 'Slow Cold-Stone Chakki Milling',
      desc: 'Traditional emery stoneground below 28°C ensuring coarse dietary fiber, wheat germ & natural oils stay 100% intact.',
      icon: RotateCw,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      num: '03',
      title: 'Spectrometer Lab Tested & Sealed',
      desc: 'Zero maida, zero bleaching chemicals. Packaged in nitrogen-sealed 4-layer aroma pouches within 2 hours of milling.',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      num: '04',
      title: 'Zero-Emission 2-Hour EV Delivery',
      desc: 'Dispatched fresh in temperature-controlled electric delivery vans across Lucknow directly to your kitchen doorstep.',
      icon: Truck,
      color: 'bg-teal-50 text-teal-700 border-teal-200'
    }
  ];

  const reviews = [
    {
      id: 'rev-1',
      name: 'Dr. Anjali Verma',
      location: 'Gomti Nagar, Lucknow',
      rating: 5,
      date: 'Verified Buyer • 2 days ago',
      title: '14-Hour Soft Rotis without Any Hardness!',
      text: 'The aroma of fresh cold-stone Khapli atta took me back to my village childhood. Rotis stay extraordinarily soft all day. My father who has diabetes loves the low-GI digestibility.'
    },
    {
      id: 'rev-2',
      name: 'Vikram Pratap Singh',
      location: 'Aliganj, Lucknow',
      rating: 5,
      date: 'Verified Buyer • 5 days ago',
      title: '36% Protein Atta is a Total Game Changer',
      text: 'As a fitness coach, finding clean unadulterated high-protein flour was impossible. This blend of whole wheat, soya and roasted peanut is genuinely pure and makes delicious parathas.'
    },
    {
      id: 'rev-3',
      name: 'Pooja Srivastava',
      location: 'Indiranagar, Lucknow',
      rating: 5,
      date: 'Verified Buyer • 1 week ago',
      title: 'Milled & Delivered in Under 2 Hours!',
      text: 'Ordered at 10:15 AM and received the warm, freshly cold-stone ground sack at 11:45 AM via an EV van. Zero maida, zero preservatives — cleanest chakki atta in Lucknow.'
    }
  ];

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-8 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================
            LEFT COLUMN: FROM OUR CHAKKI TO YOUR HOME (6 COLS)
            ======================================================== */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-1.5 h-6 bg-[#ea580c] rounded-full" />
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              From Our Chakki to Your Home
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium pl-4">
            How we deliver 100% honest, unadulterated flour from soil to your family table.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {steps.map((st) => {
              const IconComp = st.icon;
              return (
                <div
                  key={st.num}
                  className="p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-400 hover:shadow-sm transition-all space-y-2.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${st.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-300 font-mono">
                      {st.num}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-950 text-xs sm:text-sm leading-snug">
                      {st.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-1">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: LOVED BY OUR CUSTOMERS (6 COLS)
            ======================================================== */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-1.5 h-6 bg-[#ea580c] rounded-full" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Loved by Our Customers
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>4.9 / 5 Verified Rating</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium pl-4">
            Over 2,400+ families across Lucknow trust itsclear for daily cold-milled flour.
          </p>

          <div className="space-y-3 pt-2">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-400 transition-all space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1 text-amber-500 mb-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <h4 className="font-bold text-slate-950 text-xs sm:text-sm leading-snug">
                      "{rev.title}"
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {rev.date.split('•')[1]?.trim()}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                  {rev.text}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{rev.name}</span>
                  <span className="text-slate-400">{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
