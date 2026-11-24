import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  Heart,
  ShoppingCart,
  Star,
  Check,
  Crown,
  Zap,
  Package,
  ShieldCheck,
  Sparkles,
  Leaf,
  Droplets,
  Flame
} from 'lucide-react';

interface ProductCard3DProps {
  product: Product;
  onNavigateToDetail: (productId: string) => void;
}

export const ProductCard3D: React.FC<ProductCard3DProps> = ({ product, onNavigateToDetail }) => {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [addedJustNow, setAddedJustNow] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = Math.round(
    ((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedVariant, 1);
    setAddedJustNow(true);
    setTimeout(() => setAddedJustNow(false), 1500);
  };

  // Determine top badge
  const renderBadge = () => {
    if (product.id === 'itsclear-khapli-ancient') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-[11px] font-black border border-[#fde68a]">
          <Crown className="w-3 h-3 text-amber-700 fill-amber-700" />
          <span>Bestseller</span>
        </span>
      );
    }
    if (product.id === 'itsclear-high-protein') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#ffedd5] text-[#c2410c] text-[11px] font-black border border-[#fed7aa]">
          <Zap className="w-3 h-3 text-orange-600 fill-orange-600" />
          <span>High Protein</span>
        </span>
      );
    }
    if (product.id === 'itsclear-mustard-oil-coldpressed') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 text-[11px] font-black border border-amber-300">
          <Droplets className="w-3 h-3 text-amber-700 fill-amber-700" />
          <span>Cold Pressed</span>
        </span>
      );
    }
    if (product.id === 'itsclear-desi-ghee-bilona') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-yellow-100 text-amber-950 text-[11px] font-black border border-yellow-300">
          <Flame className="w-3 h-3 text-amber-700 fill-amber-700" />
          <span>Bilona Ghee</span>
        </span>
      );
    }
    if (product.id === 'itsclear-kitchen-combo-trio') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-950 text-[11px] font-black border border-orange-300">
          <Sparkles className="w-3 h-3 text-orange-700" />
          <span>Kitchen Trio</span>
        </span>
      );
    }
    if (product.id === 'itsclear-khapli-family-pack') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#ffedd5] text-[#c2410c] text-[11px] font-black border border-[#fed7aa]">
          <Package className="w-3 h-3 text-amber-700" />
          <span>Value Pack</span>
        </span>
      );
    }
    if (product.id === 'itsclear-khapli-badges-edition') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#ffedd5] text-[#c2410c] text-[11px] font-black border border-[#fed7aa]">
          <ShieldCheck className="w-3 h-3 text-amber-700" />
          <span>Health Pack</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-black border border-slate-200">
        <Sparkles className="w-3 h-3 text-amber-600" />
        <span className="capitalize">{product.category}</span>
      </span>
    );
  };

  // Determine trust benefit pill text & icon
  const renderBenefitPill = () => {
    let icon = <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    let text = product.composition || '100% Ancient Emmer Khapli Wheat';

    if (product.id === 'itsclear-high-protein') {
      icon = <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      text = '36% Protein Atta (Multi-Grain, High Nutrition)';
    } else if (product.id === 'itsclear-mustard-oil-coldpressed') {
      icon = <Droplets className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      text = '100% Wooden Kohlu Cold-Pressed Sarson Ka Tel';
    } else if (product.id === 'itsclear-desi-ghee-bilona') {
      icon = <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      text = 'Traditional Vedic Bilona Curd Churned Desi Ghee';
    } else if (product.id === 'itsclear-kitchen-combo-trio') {
      icon = <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />;
      text = 'Atta + Mustard Oil + Desi Ghee (Save ₹215)';
    } else if (product.id === 'itsclear-khapli-family-pack') {
      icon = <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      text = '100% Khapli Wheat (All 4 Pack Sizes Available)';
    } else if (product.id === 'itsclear-khapli-badges-edition') {
      icon = <Heart className="w-3.5 h-3.5 text-emerald-600 shrink-0 fill-emerald-600" />;
      text = '100% Ancient Emmer Khapli Wheat';
    }

    return (
      <div className="bg-[#eefbf3] border border-[#d1f4dd] rounded-xl px-2.5 py-1.5 flex items-center space-x-1.5 text-[11px] font-bold text-[#14532d] mt-2">
        {icon}
        <span className="truncate">{text}</span>
      </div>
    );
  };

  const isHighlighted = product.id === 'itsclear-high-protein';

  return (
    <div
      onClick={() => onNavigateToDetail(product.id)}
      className={`group relative cursor-pointer rounded-3xl bg-white p-4 transition-all duration-300 hover:shadow-xl flex flex-col justify-between overflow-hidden ${
        isHighlighted
          ? 'border-2 border-orange-400 ring-2 ring-orange-200/50 shadow-xs'
          : 'border border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Top Badge & Wishlist Row */}
        <div className="flex items-center justify-between gap-2">
          {renderBadge()}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
            title="Wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
          </button>
        </div>

        {/* Product Visual Photo */}
        <div className="relative h-44 sm:h-48 w-full flex items-center justify-center my-2 select-none overflow-hidden rounded-2xl bg-gradient-to-b from-orange-50/15 via-white to-slate-50/30">
          {product.images && product.images.length > 0 && !imgError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-center p-4">
              <span className="text-xs font-black text-slate-700">{product.name}</span>
            </div>
          )}
        </div>

        {/* Product Title & Subtitle */}
        <h3 className="font-black text-slate-950 text-base leading-snug group-hover:text-orange-600 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed min-h-[32px] mt-1">
          {product.subTitle || product.tagline}
        </p>

        {/* Rating Row */}
        <div className="flex items-center space-x-1 mt-1.5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            ))}
          </div>
          <span className="font-black text-slate-950 text-xs ml-0.5">{product.rating}</span>
          <span className="text-slate-400 text-xs font-semibold">({product.reviewCount} reviews)</span>
        </div>

        {/* Trust Benefit Strip */}
        {renderBenefitPill()}

        {/* Pack Size Variant Chips */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {product.variants.map((v) => {
            const isSelected = selectedVariant.id === v.id;
            return (
              <button
                key={v.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVariant(v);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'border-2 border-orange-500 text-orange-600 bg-orange-50/60 font-black'
                    : 'border border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {v.size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price, Stock, & Add to Basket Button */}
      <div className="mt-3 pt-2.5 border-t border-slate-100">
        <div className="flex items-baseline space-x-2">
          <span className="text-xl font-black text-slate-950">₹{selectedVariant.price}</span>
          {selectedVariant.originalPrice > selectedVariant.price && (
            <span className="text-xs text-slate-400 line-through font-semibold">
              ₹{selectedVariant.originalPrice}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#22c55e] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <p className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1 mt-0.5">
          <span>• In Stock ({selectedVariant.stockCount} left)</span>
        </p>

        <button
          onClick={handleAddToCart}
          className={`w-full mt-3 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs active:scale-95 ${
            addedJustNow
              ? 'bg-emerald-600 text-white'
              : isHighlighted
              ? 'bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-orange-500/20'
              : 'bg-[#0c1523] hover:bg-slate-800 text-white'
          }`}
        >
          {addedJustNow ? (
            <>
              <Check className="w-3.5 h-3.5 font-black" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Basket</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
