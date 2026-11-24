import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Hero3DScene, PackOption } from '../components/three/Hero3DScene';
import { LuxuryHeroSection } from '../components/home/LuxuryHeroSection';
import { CategoryCardsSection } from '../components/home/CategoryCardsSection';
import { FeaturedProductsSection } from '../components/home/FeaturedProductsSection';
import { CombosSection } from '../components/home/CombosSection';
import { AttaVarietyBar } from '../components/home/AttaVarietyBar';
import { WhyChooseBanner } from '../components/home/WhyChooseBanner';
import { ChakkiAndReviewsSection } from '../components/home/ChakkiAndReviewsSection';
import { RotiYieldCalculator } from '../components/shop/RotiYieldCalculator';
import { Product, ProductVariant } from '../types';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Star,
  Truck,
  ShoppingCart,
  Check,
  Clock,
  Sparkles,
  Heart,
  RotateCcw,
  Headphones,
  Award,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Mail,
  Users,
  PackageCheck,
  Eye,
  MapPin,
  Copy,
  Zap,
  CheckCheck,
  HelpCircle,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  onSelectProduct: (productId: string) => void;
  onSelectCategory?: (category: string) => void;
}

// Compact Ranked Card for "Popular This Month" (Matching Reference 1: #01-#05)
const PopularRankedCard: React.FC<{
  rank: string;
  badgeColor: string;
  prod: Product;
  onSelectProduct: (id: string) => void;
  onAddToCart: (prod: Product, variant: ProductVariant) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}> = ({ rank, badgeColor, prod, onSelectProduct, onAddToCart, isWishlisted, onToggleWishlist }) => {
  const [added, setAdded] = useState(false);
  const variant = prod.variants?.[0] || {
    id: 'var-pop-def',
    size: '5 kg Bag',
    weightInKg: 5,
    price: 440,
    originalPrice: 520,
    inStock: true,
    stockCount: 50
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(prod, variant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onSelectProduct(prod.id)}
      className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-orange-400 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group relative"
    >
      <div>
        {/* Rank Number Badge & Wishlist Heart */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${badgeColor}`}>
            {rank}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(prod.id);
            }}
            className="p-1.5 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
            title="Save to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Thumbnail Image */}
        <div className="relative h-36 w-full rounded-xl bg-slate-50/90 p-2 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
          {prod.images && prod.images[0] ? (
            <img
              src={prod.images[0]}
              alt={prod.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-sm"
            />
          ) : null}
        </div>

        {/* Product Title */}
        <h4 className="font-black text-slate-950 text-sm leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
          {prod.name}
        </h4>

        {/* Star Rating */}
        <div className="flex items-center space-x-1 mt-1 text-xs text-orange-500">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-orange-500 text-orange-500" />
            ))}
          </div>
          <span className="text-[11px] text-slate-600 font-bold ml-1">{prod.rating}</span>
        </div>
      </div>

      {/* Price & Quick Add Button */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
        <div>
          <span className="text-base sm:text-lg font-black text-slate-950">
            ₹{variant.price}
          </span>
          <span className="block text-[10px] text-slate-400 font-medium">
            {variant.size.split(' ')[0]} {variant.size.split(' ')[1] || ''}
          </span>
        </div>

        <button
          onClick={handleAdd}
          className={`p-2 rounded-xl transition-all shadow-2xs active:scale-95 ${
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-700'
          }`}
          title="Add to Basket"
        >
          {added ? (
            <Check className="w-4 h-4 font-black" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

// Interactive Best Seller Card with Size Pills and Instant Feedback
const BestSellerCard: React.FC<{
  prod: Product;
  onSelectProduct: (id: string) => void;
  onAddToCart: (prod: Product, variant: ProductVariant) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}> = ({ prod, onSelectProduct, onAddToCart, isWishlisted, onToggleWishlist }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    prod.variants?.[0] || {
      id: 'var-default',
      size: '5 kg Bag',
      weightInKg: 5,
      price: 440,
      originalPrice: 520,
      inStock: true,
      stockCount: 50
    }
  );
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(prod, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div
      onClick={() => onSelectProduct(prod.id)}
      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-orange-400 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group relative"
    >
      <div>
        {/* Wishlist Heart Icon on Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(prod.id);
          }}
          className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-white/95 hover:bg-rose-50 border border-slate-200 flex items-center justify-center transition-all shadow-2xs group-hover:scale-105"
          title="Add to Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Centered Product Cutout on Light Canvas */}
        <div className="relative h-48 sm:h-56 w-full rounded-xl bg-slate-50/80 p-3 flex items-center justify-center mb-3.5 overflow-hidden group-hover:scale-102 transition-transform">
          {prod.images && prod.images[0] ? (
            <img
              src={prod.images[0]}
              alt={prod.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
          ) : null}
          <span className="absolute bottom-2 left-2 text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
            <span>{prod.origin.split(',')[0]}</span>
          </span>
        </div>

        {/* Product Title */}
        <h3 className="font-black text-slate-950 text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
          {prod.name}
        </h3>

        {/* Subtitle / Grain Composition */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium line-clamp-1 mt-1">
          {prod.subTitle || prod.tagline}
        </p>

        {/* Star Rating with Orange Stars */}
        <div className="flex items-center space-x-1.5 mt-2 text-xs text-orange-500 font-bold">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            ))}
          </div>
          <span className="text-slate-900 text-xs font-bold">{prod.rating}</span>
          <span className="text-slate-400 text-[11px]">({prod.reviewCount})</span>
        </div>

        {/* Pack Size Pills Selector */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {prod.variants.map((v) => (
            <button
              key={v.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVariant(v);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedVariant.id === v.id
                  ? 'bg-orange-500 text-slate-950 shadow-2xs font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {v.size.split(' ')[0]} {v.size.split(' ')[1] || ''}
            </button>
          ))}
        </div>

        {/* Price Display */}
        <div className="flex items-baseline space-x-2">
          <span className="font-black text-slate-950 text-xl sm:text-2xl">
            ₹{selectedVariant.price}
          </span>
          {selectedVariant.originalPrice > selectedVariant.price && (
            <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
              ₹{selectedVariant.originalPrice}
            </span>
          )}
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-auto">
            In Stock
          </span>
        </div>
      </div>

      {/* Sleek Full-Width Black Button with Instant Added Feedback */}
      <div className="mt-4 pt-2 border-t border-slate-100">
        <button
          onClick={handleAdd}
          className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-2xs flex items-center justify-center space-x-2 active:scale-95 ${
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950'
          }`}
        >
          {added ? (
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
  );
};

export const HomePage: React.FC<HomePageProps> = ({ setCurrentTab, onSelectProduct, onSelectCategory }) => {
  const { products, addToCart, wishlist, toggleWishlist } = useStore();
  const [activeHeroPackIndex, setActiveHeroPackIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);
  const [couponCopied, setCouponCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Live Countdown Timer for "Limited Time Offer" Super Sale Banner
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 37,
    seconds: 12
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick Add from Hero Scene
  const handleHeroAddToCart = (pack: PackOption, size: string, price: number) => {
    const isProtein = pack.id.includes('protein');
    const targetProduct = products.find(p => p.id === (isProtein ? 'itsclear-high-protein' : 'itsclear-khapli-ancient')) || products[0];
    const targetVariant = targetProduct.variants.find(v => v.size.toLowerCase().includes(size.toLowerCase())) || targetProduct.variants[0];
    addToCart(targetProduct, targetVariant, 1);
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('CLEAR50');
    setCouponCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setCouponCopied(false), 2500);
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode.trim())) {
      setPincodeResult(`Express 2-Hour EV Van Delivery Active in Lucknow (PIN ${pincode})! Fresh cold-stone milled batch dispatches today.`);
    } else {
      setPincodeResult('Please enter a valid 6-digit Lucknow Postal PIN (e.g. 226010 for Gomti Nagar).');
    }
  };

  // 1. Categories
  const categories = [
    {
      id: 'khapli',
      name: 'Khapli Atta',
      sub: 'Ancient Low-GI',
      image: '/images/products/khapli-bori-only.png'
    },
    {
      id: 'protein',
      name: 'High Protein',
      sub: '36% Protein',
      image: '/images/products/protein-bori-only.png'
    },
    {
      id: 'family',
      name: 'Family Sacks',
      sub: '10kg Handle',
      image: '/images/products/khapli-sizes-grid-bori-only.png'
    },
    {
      id: 'badges',
      name: 'Certified Pure',
      sub: '4 Certifications',
      image: '/images/products/khapli-sizes-badges-bori-only.png'
    },
    {
      id: 'duo',
      name: 'Protein Duo',
      sub: 'Wheat, Soya, Peanut',
      image: '/images/products/protein-attas-duo-bori-only.png'
    },
    {
      id: 'carry',
      name: 'Carry Handle',
      sub: 'Reinforced Bags',
      image: '/images/products/khapli-bori-only.png'
    }
  ];

  // 2. Curated Value Bundles
  const bundles = [
    {
      id: 'bundle-family',
      badge: 'Best Value',
      badgeColor: 'bg-orange-100 text-orange-950 border-orange-300',
      title: 'Family Health Starter Kit',
      subtitle: 'Complete monthly stoneground nutrition for a family of 4.',
      image: '/images/products/khapli-sizes-grid-bori-only.png',
      price: 1249,
      originalPrice: 1499,
      features: [
        '10kg Khapli Ancient Atta (Low-GI 42)',
        '5kg High Protein Whole Wheat Blend (36g Protein)',
        '100% Cold-Stone Ground Below 28°C',
        'Free Express EV Van Doorstep Delivery'
      ],
      targetProductId: 'itsclear-khapli-10k-handle'
    },
    {
      id: 'bundle-protein',
      badge: 'Fitness Favorite',
      badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      title: 'High Protein & Fitness Duo',
      subtitle: 'Engineered for active athletes and post-workout muscle repair.',
      image: '/images/products/protein-attas-duo-bori-only.png',
      price: 960,
      originalPrice: 1150,
      features: [
        '2 × 5kg High Protein Atta (36g Protein/100g)',
        '60% Wheat + 30% Golden Soya + 10% Peanut',
        'Guaranteed Zero Maida & Zero Bleach',
        '14-Hour Soft Rotis with High Energy'
      ],
      targetProductId: 'itsclear-protein-duo-packs'
    },
    {
      id: 'bundle-diabetic',
      badge: 'Doctor Recommended',
      badgeColor: 'bg-blue-100 text-blue-950 border-blue-300',
      title: 'Diabetic & Ancient Grain Care',
      subtitle: 'Low-GI grain rotation recommended by clinical nutritionists.',
      image: '/images/products/khapli-sizes-badges-bori-only.png',
      price: 880,
      originalPrice: 1040,
      features: [
        '5kg Khapli Ancient Emmer Stoneground Atta',
        '4 Certified Health Badges on Packaging',
        'Batch Purity Lab Test Certificate Included',
        'Gentle Soluble Fiber for Zero Bloating'
      ],
      targetProductId: 'itsclear-khapli-badges-edition'
    }
  ];

  // 3. Best Selling Products
  const bestSellers = products.slice(0, 5);

  // 4. Popular This Month Ranked #01-#05 (Matching Reference 1)
  const popularRanked = [
    {
      rank: '#01',
      badgeColor: 'bg-orange-50 text-orange-950 border-orange-200',
      prod: products.find(p => p.id === 'itsclear-khapli-ancient') || products[0]
    },
    {
      rank: '#02',
      badgeColor: 'bg-emerald-50 text-emerald-950 border-emerald-200',
      prod: products.find(p => p.id === 'itsclear-high-protein') || products[1]
    },
    {
      rank: '#03',
      badgeColor: 'bg-blue-50 text-blue-950 border-blue-200',
      prod: products.find(p => p.id === 'itsclear-khapli-10k-handle') || products[0]
    },
    {
      rank: '#04',
      badgeColor: 'bg-purple-50 text-purple-950 border-purple-200',
      prod: products.find(p => p.id === 'itsclear-khapli-badges-edition') || products[0]
    },
    {
      rank: '#05',
      badgeColor: 'bg-amber-50 text-amber-950 border-amber-200',
      prod: products.find(p => p.id === 'itsclear-protein-duo-packs') || products[1]
    }
  ];

  // 5. Frequently Asked Questions (Matching Reference 2)
  const faqs = [
    {
      q: 'Why is traditional cold-chakki stoneground flour superior to commercial factory atta?',
      a: 'Commercial factory roller mills grind wheat at high temperatures (80°C - 90°C), scorching live wheat enzymes, stripping beneficial dietary bran, and often blending in maida. itsclear operates authentic emery stone chakkis rotating slowly below 28°C. This 100% preserves live germ, healthy natural oils, vitamin E, dietary coarse fiber, and natural grain sweetness without any chemical additives.'
    },
    {
      q: 'How does itsclear guarantee 100% zero maida and zero bleaching chemicals?',
      a: 'Every single grain is triple-washed and milled whole. We rigorously test each batch in our NABL-accredited quality lab for zero bleaching chemicals (benzoyl peroxide, potassium bromate) and zero maida. You can enter any bag batch number in our Virtual Zero-Maida Lab to view certified purity reports.'
    },
    {
      q: 'What is Khapli (Emmer) Atta, and why is it recommended for diabetic care?',
      a: 'Khapli is an ancient 10,000-year-old unhybridized wheat grain. It has a clinically proven low glycemic index of 42 (preventing post-meal sugar spikes), gentle water-soluble gluten that prevents bloating, and high natural magnesium for metabolic vitality.'
    },
    {
      q: 'How does express 2-hour EV delivery work?',
      a: 'Once your grain is stoneground fresh in our clean facility, it is sealed in airtight puncture-resistant bags with carry handles and loaded directly into temperature-controlled electric delivery vans for direct 2-hour doorstep delivery.'
    },
    {
      q: 'What is the shelf life of fresh stoneground chakki atta?',
      a: 'Because we never add synthetic preservatives or fumigants, our freshly milled atta has a natural freshness life of 60 to 90 days. We recommend keeping it sealed in its airtight zipper bag in a cool, dry place.'
    }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
      setTimeout(() => setNewsletterSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="w-full space-y-12 sm:space-y-16 pb-20 bg-[#fafafa]">
      {/* ─────────────────────────────────────────────────────────────
          1. LUXURY HERO SECTION (Pure Goodness. Everyday Essentials.)
      ───────────────────────────────────────────────────────────── */}
      <LuxuryHeroSection
        onShopAll={() => setCurrentTab('shop')}
        onExploreCategories={() => {
          const el = document.getElementById('categories-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectProduct={onSelectProduct}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. SHOP BY CATEGORY: 3 LUXURY CARDS (Atta, Mustard Oil, Desi Ghee)
      ───────────────────────────────────────────────────────────── */}
      <CategoryCardsSection
        onSelectCategory={(cat) => {
          if (onSelectCategory) {
            onSelectCategory(cat);
          } else {
            setCurrentTab('shop');
          }
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          3. FEATURED PRODUCTS (MongoDB dynamic with All / Atta / Oil / Ghee)
      ───────────────────────────────────────────────────────────── */}
      <FeaturedProductsSection
        onSelectProduct={onSelectProduct}
        onExploreAll={() => setCurrentTab('shop')}
      />

      {/* ─────────────────────────────────────────────────────────────
          4. WHY CHOOSE ITSCLEAR? 4 TRUST BADGES
      ───────────────────────────────────────────────────────────── */}
      <WhyChooseBanner />

      {/* ─────────────────────────────────────────────────────────────
          5. SHOP COMBOS (CURATED VALUE PACKS)
      ───────────────────────────────────────────────────────────── */}
      <CombosSection
        onSelectProduct={onSelectProduct}
        onExploreShop={() => setCurrentTab('shop')}
      />

      {/* ─────────────────────────────────────────────────────────────
          6. FROM OUR CHAKKI TO YOUR HOME & LOVED BY OUR CUSTOMERS
      ───────────────────────────────────────────────────────────── */}
      <ChakkiAndReviewsSection
        onExploreAttas={() => setCurrentTab('shop')}
      />

      {/* ─────────────────────────────────────────────────────────────
          4. CHAKKI FRESH VALUE BUNDLES (3 WIDE CARDS WITH CHECKMARKS)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="mb-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight">
            Chakki Fresh Value Bundles
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Start cleaner with ready-to-use monthly stoneground grain packages with free doorstep delivery.
          </p>
        </div>

        {/* 3 Wide Bundle Cards with Lifestyle Photos & Checkmarks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {bundles.map((bundle) => {
            const targetProd = products.find(p => p.id === bundle.targetProductId) || products[0];

            return (
              <div
                key={bundle.id}
                className="rounded-3xl bg-white border border-slate-200/90 hover:border-orange-400 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Top Image Showcase Area */}
                  <div className="relative h-48 sm:h-56 w-full bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
                    <img
                      src={bundle.image}
                      alt={bundle.title}
                      className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-3 right-3 text-xs font-black uppercase px-3 py-1 rounded-full border shadow-2xs ${bundle.badgeColor}`}>
                      {bundle.badge}
                    </span>
                  </div>

                  {/* Bundle Text & Checkmarks */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg sm:text-xl leading-snug">
                        {bundle.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                        {bundle.subtitle}
                      </p>
                    </div>

                    {/* Features List with Green Checkmarks */}
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium pt-1">
                      {bundle.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 font-black" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Row: Price & Full Width Add to Cart Button */}
                <div className="p-5 sm:p-6 pt-0 mt-2 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-slate-950">
                      ₹{bundle.price}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-400 line-through ml-2 font-bold">
                      ₹{bundle.originalPrice}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (targetProd && targetProd.variants && targetProd.variants[0]) {
                        addToCart(targetProd, targetProd.variants[0], 1);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-orange-500 hover:text-slate-950 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
                  >
                    <span>Add to Basket</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. PINCODE EV DELIVERY CHECKER WIDGET
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-950 text-sm sm:text-base">
                Check Express 2-Hour EV Delivery in Your Area
              </h4>
              <p className="text-xs sm:text-sm text-slate-500">
                Fresh stoneground atta dispatched directly in climate-controlled electric vans.
              </p>
            </div>
          </div>

          <form onSubmit={handleCheckPincode} className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g. 226010 (Lucknow)"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 w-full sm:w-48 font-bold"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-950 hover:bg-orange-500 hover:text-slate-950 text-white font-bold text-sm rounded-xl transition-all shadow-2xs shrink-0"
            >
              Check
            </button>
          </form>
        </div>

        {pincodeResult && (
          <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-950 flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pincodeResult}</span>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. LIMITED TIME OFFER BANNER (MATCHING REFERENCE: DARK SLEEK BAR WITH COUNTDOWN)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="rounded-2xl bg-slate-950 text-white p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Text */}
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-xs font-black text-orange-400 uppercase tracking-widest block">
              Limited Time Offer
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Super Sale Up To <span className="text-orange-500">25% Off!</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-normal">
              Use code <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">CLEAR50</strong> on selected cold stoneground chakki attas.
            </p>
          </div>

          {/* Right Countdown Timer Boxes & Copy Code */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="w-14 sm:w-16 p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="font-black text-xl sm:text-2xl block text-white">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mt-0.5">Days</span>
            </div>
            <div className="w-14 sm:w-16 p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="font-black text-xl sm:text-2xl block text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mt-0.5">Hours</span>
            </div>
            <div className="w-14 sm:w-16 p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="font-black text-xl sm:text-2xl block text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mt-0.5">Mins</span>
            </div>
            <div className="w-14 sm:w-16 p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="font-black text-xl sm:text-2xl block text-white">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mt-0.5">Secs</span>
            </div>

            <button
              onClick={handleCopyCoupon}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center space-x-1.5"
            >
              {couponCopied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-orange-400" />}
              <span>{couponCopied ? 'Code Copied!' : 'Copy Code: CLEAR50'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. POPULAR THIS MONTH (MATCHING REFERENCE 1: RANKED #01-#05)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Popular This Month
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Top customer favorites ranked by verified household repeat orders.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('shop')}
            className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5-Item Ranked Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {popularRanked.map((item) => (
            <PopularRankedCard
              key={'pop-' + item.rank}
              rank={item.rank}
              badgeColor={item.badgeColor}
              prod={item.prod}
              onSelectProduct={onSelectProduct}
              onAddToCart={(p, v) => addToCart(p, v, 1)}
              isWishlisted={wishlist.includes(item.prod.id)}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. HOUSEHOLD GRAIN SCIENCE & ROTI YIELD CALCULATOR
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <RotiYieldCalculator onSelectProduct={onSelectProduct} />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. OUR FEATURED CERTIFICATIONS STRIP
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center mb-4">
            Our Quality Benchmarks &amp; Certifications
          </span>
          <div className="flex flex-wrap items-center justify-around gap-6 text-slate-700 text-xs sm:text-sm font-black">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>FSSAI 100% Whole Grain</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cold Chakki &lt;28°C</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>NABL Lab Tested Batch</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Non-GMO Ancient Heritage</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Maida &amp; Bleach</span>
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. WHAT OUR CUSTOMERS SAY & WHY SHOP WITH US? (SIDE-BY-SIDE CARDS)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Card: What Our Customers Say */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              What Our Customers Say
            </h3>

            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Rajesh Sharma</h4>
                <p className="text-xs sm:text-sm text-emerald-700 font-semibold">Verified Buyer • Gomti Nagar, Lucknow</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-orange-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
              ))}
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed italic">
              "Amazing quality and fast delivery! The Khapli Atta is extraordinary. My father is diabetic, and his post-meal glucose spikes disappeared completely. The rotis are soft and stay fresh all day. Highly recommended!"
            </p>
          </div>

          {/* Right Card: Why Shop With Us? */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Why Shop With Us?
            </h3>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="font-black text-2xl sm:text-3xl text-slate-900 block">
                  10K+
                </span>
                <span className="text-xs sm:text-sm text-slate-600 font-bold mt-1 block">Happy Families</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="font-black text-2xl sm:text-3xl text-orange-500 block">
                  100%
                </span>
                <span className="text-xs sm:text-sm text-slate-600 font-bold mt-1 block">Pure Cold Milled</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="font-black text-2xl sm:text-3xl text-emerald-700 block">
                  24h
                </span>
                <span className="text-xs sm:text-sm text-slate-600 font-bold mt-1 block">Fresh Delivery</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="font-black text-2xl sm:text-3xl text-slate-900 block">
                  0%
                </span>
                <span className="text-xs sm:text-sm text-slate-600 font-bold mt-1 block">Added Maida</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FREQUENTLY ASKED QUESTIONS (MATCHING REFERENCE 2)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-200 inline-block mb-2">
              Got Questions?
            </span>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Everything you need to know about our cold-stoneground milling, purity benchmarks, and door delivery.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-orange-400 bg-orange-50/20 shadow-xs'
                      : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 transition-colors"
                  >
                    <span className="flex items-center space-x-3">
                      <HelpCircle className={`w-5 h-5 shrink-0 transition-colors ${isOpen ? 'text-orange-500' : 'text-slate-400'}`} />
                      <span className="font-extrabold">{faq.q}</span>
                    </span>
                    <span className={`p-1.5 rounded-lg border transition-transform duration-200 shrink-0 ${
                      isOpen ? 'bg-orange-500 text-slate-950 border-orange-500 rotate-180' : 'bg-white text-slate-500 border-slate-200'
                    }`}>
                      <ChevronDown className="w-4 h-4 font-black" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-slate-200/60 mt-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. SUBSCRIBE TO OUR NEWSLETTER (MATCHING REFERENCE 2)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="max-w-2xl">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Subscribe To Our Newsletter
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Get the latest updates on stoneground milling batches and exclusive subscriber deals.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="mt-4 flex flex-col sm:flex-row items-center gap-2.5">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full sm:flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-bold text-sm transition-all shadow-xs shrink-0"
              >
                {newsletterSubscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>

            <label className="flex items-center space-x-2 mt-3 cursor-pointer text-xs text-slate-500 font-medium">
              <input type="checkbox" defaultChecked className="rounded text-orange-500 focus:ring-orange-500" />
              <span>I agree to receive harvest purity updates and grain coupons.</span>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};
