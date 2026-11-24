import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Wheat,
  Droplets,
  Truck,
  ArrowRight,
  ShoppingCart,
  Check,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  Play
} from 'lucide-react';
import { Product } from '../../types';

interface LuxuryHeroSectionProps {
  onShopAll: () => void;
  onExploreCategories: () => void;
  onSelectProduct: (productId: string) => void;
}

export const LuxuryHeroSection: React.FC<LuxuryHeroSectionProps> = ({
  onShopAll,
  onExploreCategories,
  onSelectProduct
}) => {
  const { products, addToCart, wishlist, toggleWishlist, notify } = useStore();
  const [selectedSize, setSelectedSize] = useState<'1kg' | '5kg' | '10kg'>('5kg');
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);

  // Target product fallback
  const fallbackProduct: Product = products.find(p => p.id.includes('khapli')) || products[0] || {
    id: 'itsclear-khapli-ancient',
    name: '100% Khapli Wheat Atta',
    variants: [
      { id: 'khapli-1kg', size: '1 kg Pouch', weightInKg: 1, price: 95, originalPrice: 115, inStock: true, stockCount: 100 },
      { id: 'khapli-5kg', size: '5 kg (Bori)', weightInKg: 5, price: 440, originalPrice: 520, inStock: true, stockCount: 50 },
      { id: 'khapli-10kg', size: '10 kg (Sack)', weightInKg: 10, price: 849, originalPrice: 999, inStock: true, stockCount: 30 }
    ]
  } as any;

  const slides = [
    {
      id: 'khapli',
      productId: 'itsclear-khapli-ancient',
      title: '100% Khapli Wheat Atta',
      subtitle: 'Ancient Emmer Grain • Cold Stoneground',
      badge: 'Bestseller Ancient Grain',
      rating: 4.8,
      reviewsCount: '2,431+',
      benefits: [
        'Ancient Khapli wheat variety',
        'High in natural fiber & low GI',
        'Easy to digest & zero maida',
        'Cold-stoneground below 28°C'
      ],
      priceMap: {
        '1kg': { price: 95, originalPrice: 115, discount: '17% OFF' },
        '5kg': { price: 440, originalPrice: 520, discount: '15% OFF' },
        '10kg': { price: 849, originalPrice: 999, discount: '15% OFF' }
      },
      getImage: (size: '1kg' | '5kg' | '10kg') =>
        size === '5kg'
          ? '/images/products/khapli-bori-only.png'
          : '/images/products/khapli-single-cutout.png'
    },
    {
      id: 'protein',
      productId: 'itsclear-protein-36',
      title: '36% High Protein Atta',
      subtitle: 'Whole Wheat + Golden Soya + Roasted Peanut',
      badge: 'Superfood High Nutrition',
      rating: 4.9,
      reviewsCount: '1,840+',
      benefits: [
        '36g Plant Protein per 100g flour',
        'Whole wheat, defatted soya & peanut',
        'Zero preservatives or isolates',
        'Freshly milled for active daily health'
      ],
      priceMap: {
        '1kg': { price: 115, originalPrice: 140, discount: '18% OFF' },
        '5kg': { price: 420, originalPrice: 494, discount: '15% OFF' },
        '10kg': { price: 799, originalPrice: 940, discount: '15% OFF' }
      },
      getImage: (size: '1kg' | '5kg' | '10kg') =>
        size === '5kg'
          ? '/images/products/protein-bori-only.png'
          : '/images/products/protein-single.jpg'
    },
    {
      id: 'family-grid',
      productId: 'itsclear-khapli-ancient',
      title: 'Family Atta Essentials Pack',
      subtitle: 'Complete 1kg, 2kg, 5kg & 10kg Sacks',
      badge: 'Complete Kitchen Pack',
      rating: 4.9,
      reviewsCount: '980+',
      benefits: [
        'Complete family pantry lineup',
        '100% stoneground pure whole grain',
        'Vacuum-sealed for 24-hr freshness',
        'Priority EV doorstep delivery'
      ],
      priceMap: {
        '1kg': { price: 95, originalPrice: 115, discount: '17% OFF' },
        '5kg': { price: 440, originalPrice: 520, discount: '15% OFF' },
        '10kg': { price: 849, originalPrice: 999, discount: '15% OFF' }
      },
      getImage: (_size: '1kg' | '5kg' | '10kg') =>
        '/images/products/khapli-sizes-grid-cutout.png'
    },
    {
      id: 'mustard-oil',
      productId: 'itsclear-mustard-oil-coldpressed',
      title: 'Cold Pressed Mustard Oil',
      subtitle: 'Kachi Ghani Sarson Ka Tel • Wooden Kohlu',
      badge: 'Cold-Pressed Sarson Tel',
      rating: 4.9,
      reviewsCount: '218+',
      benefits: [
        'Slow wooden kohlu cold pressed below 35°C',
        'Natural sharp pungency & unrefined aroma',
        'High smoke point (250°C) for healthy cooking',
        'Single-origin seeds with zero chemical bleach'
      ],
      priceMap: {
        '1kg': { price: 145, originalPrice: 175, discount: '17% OFF' },
        '5kg': { price: 245, originalPrice: 290, discount: '16% OFF' },
        '10kg': { price: 1290, originalPrice: 1499, discount: '14% OFF' }
      },
      getImage: (size: '1kg' | '5kg' | '10kg') =>
        size === '1kg'
          ? '/images/products/mustard-oil-bottle.jpg'
          : '/images/products/mustard-oil-pouch.jpg'
    },
    {
      id: 'desi-ghee',
      productId: 'itsclear-desi-ghee-bilona',
      title: 'Traditional Bilona Desi Ghee',
      subtitle: 'A2 Whole Milk Curd Churned • Golden Danedaar',
      badge: 'Vedic Bilona Ghee',
      rating: 5.0,
      reviewsCount: '176+',
      benefits: [
        'Authentic two-way wooden bilona curd churning',
        'Rich golden danedaar texture & fragrant aroma',
        'Naturally rich in butyric acid & essential vitamins',
        'Zero preservatives, palm oil, or adulteration'
      ],
      priceMap: {
        '1kg': { price: 549, originalPrice: 649, discount: '15% OFF' },
        '5kg': { price: 980, originalPrice: 1150, discount: '15% OFF' },
        '10kg': { price: 1049, originalPrice: 1250, discount: '16% OFF' }
      },
      getImage: (size: '1kg' | '5kg' | '10kg') =>
        size === '1kg'
          ? '/images/products/desi-ghee-jar.jpg'
          : '/images/products/desi-ghee-pouch.jpg'
    }
  ];

  const activeSlideData = slides[activeSlide];
  const activeProduct = products.find(p => p.id === activeSlideData.productId) || products[0] || fallbackProduct;
  const currentPricing = activeSlideData.priceMap[selectedSize];
  const isWishlisted = wishlist.includes(activeProduct.id);

  const handlePrevSlide = () => {
    setActiveSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    const targetVariant = activeProduct?.variants?.find(v => {
      if (selectedSize === '1kg') return v.size.includes('1');
      if (selectedSize === '5kg') return v.size.includes('5');
      return v.size.includes('10');
    }) || activeProduct?.variants?.[0] || {
      id: `${activeSlideData.id}-${selectedSize}`,
      size: selectedSize === '5kg' ? '5 kg (Bori)' : selectedSize === '1kg' ? '1 kg' : '10 kg',
      weightInKg: selectedSize === '5kg' ? 5 : selectedSize === '1kg' ? 1 : 10,
      price: currentPricing.price,
      originalPrice: currentPricing.originalPrice,
      inStock: true,
      stockCount: 50
    };

    addToCart(activeProduct, targetVariant, 1);
    setAddedToCart(true);
    notify('Added to Basket', `${activeSlideData.title} (${selectedSize}) added to your basket.`, 'success');
    setTimeout(() => setAddedToCart(false), 1800);
  };

  return (
    <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-3 sm:pt-6">
      <div className="rounded-3xl bg-gradient-to-b from-[#fffaf0] via-[#fffdf9] to-white border border-amber-200/60 p-4 sm:p-6 lg:p-8 xl:p-10 relative overflow-hidden shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-amber-100/40 via-transparent to-transparent pointer-events-none -mr-20 -mt-20 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-radial from-orange-100/30 via-transparent to-transparent pointer-events-none blur-3xl" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 xl:gap-6 items-center relative z-10">
          
          {/* LEFT COLUMN: HERO COPY & VALUE PILLS (5 COLS) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>NATURAL FOOD ESSENTIALS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[45px] font-black text-slate-950 tracking-tight leading-[1.12]">
              Pure Goodness. <br />
              <span className="text-[#ea580c] drop-shadow-2xs">Everyday Essentials.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover premium atta, mustard oil, and desi ghee — thoughtfully selected for your everyday kitchen. Unadulterated, cold-processed, and direct from verified single-origin sources.
            </p>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1">
                <div className="w-10 h-10 rounded-full bg-orange-100/80 border border-orange-200 flex items-center justify-center text-amber-700 shadow-2xs">
                  <Wheat className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-slate-900 block leading-tight">100% Pure</span>
                <span className="text-[10px] text-slate-500 font-medium block">Zero Maida</span>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                  <Droplets className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-slate-900 block leading-tight">Cold-Processed</span>
                <span className="text-[10px] text-slate-500 font-medium block">Slow Traditional</span>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1">
                <div className="w-10 h-10 rounded-full bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-slate-900 block leading-tight">Lab Certified</span>
                <span className="text-[10px] text-slate-500 font-medium block">Batch Tested</span>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1">
                <div className="w-10 h-10 rounded-full bg-orange-100/80 border border-orange-200 flex items-center justify-center text-orange-700 shadow-2xs">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-slate-900 block leading-tight">Free Delivery</span>
                <span className="text-[10px] text-slate-500 font-medium block">Orders ≥ ₹499</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onShopAll}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#ea580c] hover:bg-[#d94e07] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Shop All Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreCategories}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center justify-center space-x-2"
              >
                <LayoutGrid className="w-4 h-4 text-slate-700" />
                <span>Explore Categories</span>
              </button>
            </div>
          </div>

          {/* CENTER COLUMN: PROMINENT LUXURY PRODUCT SHOWCASE (4 COLS) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-between relative min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] pt-2 pb-1">
            {/* Ambient Radial Glow behind the pack */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full bg-gradient-to-tr from-amber-200/50 via-orange-100/40 to-transparent blur-3xl opacity-80" />
            </div>

            {/* Main Product Showcase Bag */}
            <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
              <div
                onClick={() => onSelectProduct(activeProduct.id)}
                className="relative transition-all duration-300 transform hover:scale-[1.03] cursor-pointer group flex flex-col items-center"
              >
                <img
                  src={activeSlideData.getImage(selectedSize)}
                  alt={activeSlideData.title}
                  className="h-[340px] sm:h-[390px] lg:h-[420px] xl:h-[460px] w-auto max-w-[95%] object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.20)] select-none"
                />
                {/* Ground Shadow Ellipse */}
                <div className="w-44 sm:w-60 h-4 bg-slate-900/15 rounded-full blur-md mx-auto -mt-2 pointer-events-none" />
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="relative z-20 w-full flex flex-col items-center space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevSlide}
                  className="p-2 rounded-full bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-sm transition-all active:scale-95"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-3.5 py-1 rounded-full bg-white/95 border border-slate-200/90 text-xs font-bold text-slate-800 shadow-2xs flex items-center space-x-1.5">
                  <Play className="w-3 h-3 text-orange-600 fill-orange-600" />
                  <span>{activeSlideData.title}</span>
                </div>

                <button
                  onClick={handleNextSlide}
                  className="p-2 rounded-full bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-sm transition-all active:scale-95"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Pagination Dots */}
              <div className="flex items-center space-x-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      activeSlide === idx ? 'w-6 bg-[#ea580c]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FLOATING QUICK-BUY CARD (3 COLS) */}
          <div className="lg:col-span-3">
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-4 relative">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mb-1">
                    {activeSlideData.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-950 leading-tight">
                    {activeSlideData.title}
                  </h3>
                  <div className="flex items-center space-x-1 mt-1 text-xs text-orange-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                    <span className="text-slate-900 font-black">{activeSlideData.rating}</span>
                    <span className="text-slate-400 font-medium">({activeSlideData.reviewsCount} reviews)</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleWishlist(activeProduct.id)}
                  className={`p-2 rounded-full border transition-all ${
                    isWishlisted
                      ? 'bg-rose-50 border-rose-300 text-rose-500'
                      : 'border-slate-200 text-slate-400 hover:text-slate-700'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Benefits checklist */}
              <div className="space-y-1.5 text-xs text-slate-600 font-medium pt-1">
                {activeSlideData.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Pack Size Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pack Size
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['1kg', '5kg', '10kg'] as const).map(size => {
                    const label =
                      activeSlideData.id === 'mustard-oil'
                        ? size === '1kg'
                          ? '500 ml'
                          : size === '5kg'
                          ? '1 Litre'
                          : '5 Litre'
                        : activeSlideData.id === 'desi-ghee'
                        ? size === '1kg'
                          ? '500 ml'
                          : size === '5kg'
                          ? '1L Pouch'
                          : '1L Jar'
                        : size === '5kg'
                        ? '5 kg (Bori)'
                        : size === '1kg'
                        ? '1 kg'
                        : '10 kg';

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center truncate ${
                          selectedSize === size
                            ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price & Discount */}
              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-950">
                      ₹{currentPricing.price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{currentPricing.originalPrice}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#ea580c] text-[10px] font-black">
                      {currentPricing.discount}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
                    Free 2-Hour EV Delivery in Lucknow
                  </span>
                </div>
              </div>

              {/* Add to Basket Button */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95 ${
                  addedToCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#ea580c] hover:bg-[#d94e07] text-white shadow-orange-500/20'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4 font-black" />
                    <span>Added to Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Basket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
