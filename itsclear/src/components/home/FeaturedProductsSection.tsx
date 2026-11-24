import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard3D } from '../shop/ProductCard3D';
import { Product } from '../../types';
import {
  Sparkles,
  Wheat,
  Droplets,
  Flame,
  LayoutGrid,
  ArrowRight,
  Clock
} from 'lucide-react';

interface FeaturedProductsSectionProps {
  onSelectProduct: (productId: string) => void;
  onExploreAll: () => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  onSelectProduct,
  onExploreAll
}) => {
  const { products } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'atta' | 'oil' | 'ghee'>('all');

  const filterTabs = [
    { id: 'all', label: 'All Staples', icon: LayoutGrid },
    { id: 'atta', label: 'Stoneground Atta', icon: Wheat },
    { id: 'oil', label: 'Mustard Oil', icon: Droplets },
    { id: 'ghee', label: 'Desi Ghee', icon: Flame }
  ] as const;

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') {
      const showcaseIds = [
        'itsclear-khapli-ancient',
        'itsclear-high-protein',
        'itsclear-mustard-oil-coldpressed',
        'itsclear-desi-ghee-bilona'
      ];
      const showcaseItems = showcaseIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => !!p);
      const others = products.filter((p) => !showcaseIds.includes(p.id));
      return [...showcaseItems, ...others];
    }
    if (activeTab === 'atta') {
      return products.filter(
        (p) =>
          p.category === 'atta' ||
          p.category === 'khapli' ||
          p.category === 'multigrain' ||
          p.category === 'sharbati' ||
          p.category === 'heritage'
      );
    }
    if (activeTab === 'oil') {
      return products.filter((p) => p.category === 'oil');
    }
    if (activeTab === 'ghee') {
      return products.filter((p) => p.category === 'ghee');
    }
    return products;
  }, [products, activeTab]);

  return (
    <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-2">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>HANDPICKED STAPLES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Featured Kitchen Essentials
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {filterTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap select-none ${
                    isActive
                      ? 'bg-[#0c1523] text-white shadow-sm font-black'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid or Elegant Authentic Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="p-10 sm:p-14 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-center max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-950">
              Fresh Batch Arriving Soon
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Our partner farmers and traditional producers are currently cold-pressing grade-1 mustard seeds and preparing authentic Bilona ghee batches. Products will appear here as soon as quality and lab testing is verified.
            </p>
            <button
              onClick={() => setActiveTab('atta')}
              className="px-5 py-2.5 rounded-xl bg-[#0c1523] text-white hover:bg-slate-800 font-bold text-xs shadow-sm transition-all inline-flex items-center space-x-2"
            >
              <span>Explore Stoneground Chakki Atta</span>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5">
            {filteredProducts.slice(0, 4).map((prod) => (
              <ProductCard3D
                key={prod.id}
                product={prod}
                onNavigateToDetail={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
