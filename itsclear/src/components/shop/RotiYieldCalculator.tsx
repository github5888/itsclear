import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant } from '../../types';
import { Users, Utensils, Sparkles, Check, ShoppingBag, ShieldCheck, Clock, Flame, ChevronRight, Droplets, Wheat } from 'lucide-react';

interface RotiYieldCalculatorProps {
  product?: Product;
  onSelectProduct?: (productId: string) => void;
}

export const RotiYieldCalculator: React.FC<RotiYieldCalculatorProps> = ({ product, onSelectProduct }) => {
  const { products, addToCart } = useStore();
  
  // Target product fallback to Khapli or first product
  const targetProduct = product || products.find(p => p.id === 'itsclear-khapli-ancient') || products[0];

  // User input states
  const [familyMembers, setFamilyMembers] = useState<number>(4);
  const [rotisPerDay, setRotisPerDay] = useState<number>(16); // e.g. 4 rotis per person average
  const [added, setAdded] = useState(false);

  // Grain science calculations
  // High-purity stoneground atta absorbs 72-75% water (36 rotis per kg)
  // Factory roller mill flour absorbs ~60% water (28 rotis per kg)
  const stonegroundRotisPerKg = 36;
  const factoryRotisPerKg = 28;

  const monthlyRotis = rotisPerDay * 30;
  const stonegroundFlourNeededKg = (monthlyRotis / stonegroundRotisPerKg).toFixed(1);
  const factoryFlourNeededKg = (monthlyRotis / factoryRotisPerKg).toFixed(1);
  const monthlySavingsKg = (Number(factoryFlourNeededKg) - Number(stonegroundFlourNeededKg)).toFixed(1);

  // Recommended pack selection
  const monthlyFlourNum = Number(stonegroundFlourNeededKg);
  const recommendedVariant = targetProduct.variants.reduce((prev, curr) => {
    return Math.abs(curr.weightInKg - monthlyFlourNum) < Math.abs(prev.weightInKg - monthlyFlourNum) ? curr : prev;
  }, targetProduct.variants[0]);

  const handleAddRecommended = () => {
    if (targetProduct && recommendedVariant) {
      addToCart(targetProduct, recommendedVariant, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="max-w-3xl mb-8 relative z-10">
        <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-200 inline-block mb-2">
          Grain Science &amp; Household Yield
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          How Many Rotis Does Your Family Need?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
          Because itsclear is cold-stoneground below 28°C with 100% intact bran, it absorbs <strong>72% water</strong> — yielding <strong>36 soft rotis per kg</strong> compared to only 28 rotis from factory-processed flour.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Sliders Input Section (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Family Size Selector */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-slate-900 flex items-center space-x-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span>Family Members in Household</span>
              </span>
              <span className="text-base sm:text-lg font-black text-slate-950 bg-white px-3 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {familyMembers} {familyMembers === 1 ? 'Person' : 'People'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[2, 4, 6, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setFamilyMembers(num);
                    setRotisPerDay(num * 4);
                  }}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    familyMembers === num
                      ? 'bg-slate-950 text-white shadow-2xs font-black'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} {num === 8 ? '+' : ''} Members
                </button>
              ))}
            </div>
          </div>

          {/* Daily Rotis Consumption Slider */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-slate-900 flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-orange-600" />
                <span>Total Rotis Prepared Per Day</span>
              </span>
              <span className="text-base sm:text-lg font-black text-orange-600 bg-white px-3 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {rotisPerDay} Rotis / Day
              </span>
            </div>

            <input
              type="range"
              min="4"
              max="40"
              step="2"
              value={rotisPerDay}
              onChange={(e) => setRotisPerDay(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />

            <div className="flex justify-between text-xs text-slate-500 font-semibold pt-1">
              <span>Light (4 Rotis)</span>
              <span>Average (16 Rotis)</span>
              <span>Large Family (40 Rotis)</span>
            </div>
          </div>

          {/* 3 Scientific Advantages */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-slate-700">
            <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 text-center">
              <Droplets className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <h5 className="font-black text-xs text-slate-950">72% Water Absorption</h5>
              <p className="text-[11px] text-slate-600 mt-0.5">Retains moisture 14h</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
              <Wheat className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <h5 className="font-black text-xs text-slate-950">36 Rotis / 1kg</h5>
              <p className="text-[11px] text-slate-600 mt-0.5">+8 rotis vs factory atta</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
              <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <h5 className="font-black text-xs text-slate-950">Zero Acid Bloat</h5>
              <p className="text-[11px] text-slate-600 mt-0.5">Water-soluble soft gluten</p>
            </div>
          </div>
        </div>

        {/* Real-Time Monthly Result & Recommendation Card (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-7 space-y-5 border border-slate-800 shadow-xl relative overflow-hidden">
            {/* Top Tag */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-black uppercase text-orange-400 tracking-wider">
                Monthly Family Projection
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {monthlyRotis} Rotis / Month
              </span>
            </div>

            {/* Comparison Metrics */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">itsclear Stoneground Needed:</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {stonegroundFlourNeededKg} <span className="text-base font-normal text-slate-400">kg/mo</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Factory Maida-Atta Needed:</span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-400 line-through">
                    {factoryFlourNeededKg} kg
                  </span>
                </div>
              </div>

              {/* Flour Saved Pill */}
              <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-200 text-xs font-bold flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
                <span>
                  You save <strong>{monthlySavingsKg} kg</strong> of flour every month due to higher water absorption!
                </span>
              </div>
            </div>

            {/* Recommended Pack Box */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider block">
                Recommended Pack For Your Household:
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm sm:text-base text-white">
                    {targetProduct.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {recommendedVariant.size} • ₹{recommendedVariant.price}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700/60">
                  Perfect Fit
                </span>
              </div>

              <button
                onClick={handleAddRecommended}
                className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm flex items-center justify-center space-x-2 active:scale-95 ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-400 text-slate-950 font-black'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 font-black" />
                    <span>Added to Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add {recommendedVariant.size} (₹{recommendedVariant.price})</span>
                  </>
                )}
              </button>
            </div>

            {/* Freshness guarantee tag */}
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 pt-1">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>Cold stone-milled within 24h of dispatch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

