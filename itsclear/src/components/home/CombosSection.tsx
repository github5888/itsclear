import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard3D } from '../shop/ProductCard3D';
import {
  Package,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck
} from 'lucide-react';

interface CombosSectionProps {
  onSelectProduct: (productId: string) => void;
  onExploreShop: (category?: string) => void;
}

export const CombosSection: React.FC<CombosSectionProps> = ({
  onSelectProduct,
  onExploreShop
}) => {
  const { products } = useStore();

  const comboProducts = products.filter(
    (p) => p.category === 'combos' || p.category === 'combo' || p.id.includes('pack')
  );

  return (
    <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-2">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>VALUE PACKS &amp; COMBOS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Curated Grocery Combos
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md font-medium">
            Essential kitchen staples bundled thoughtfully for convenient monthly delivery and better household value.
          </p>
        </div>

        {/* Combo Cards Grid */}
        {comboProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5">
            {comboProducts.slice(0, 4).map((prod) => (
              <ProductCard3D
                key={prod.id}
                product={prod}
                onNavigateToDetail={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-gradient-to-r from-[#fff9f2] to-[#fffefc] border border-orange-200/80 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-orange-800 bg-orange-100 px-3 py-1 rounded-full">
                <Package className="w-3.5 h-3.5 text-orange-600" />
                <span>Custom Family Bundles</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                Staples Pairings for Your Kitchen
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Pair pure cold-stoneground Khapli atta with authentic cold-pressed mustard oil and traditional Bilona desi ghee in a single doorstep order. Free delivery on all orders above ₹499.
              </p>
            </div>
            <button
              onClick={() => onExploreShop()}
              className="px-6 py-3 rounded-2xl bg-[#0c1523] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 shrink-0 active:scale-95"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
