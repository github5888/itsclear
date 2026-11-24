import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariant } from '../types';
import { Product3DCanvas } from '../components/three/Product3DCanvas';
import { Floating3DIcon } from '../components/three/Floating3DIcon';
import { ProductCard3D } from '../components/shop/ProductCard3D';
import { RotiYieldCalculator } from '../components/shop/RotiYieldCalculator';
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Truck,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  FileCheck,
  Plus,
  Minus,
  MessageSquare,
  Award,
  Camera,
  BarChart3,
  Calculator,
  Wheat,
  Zap,
  Check
} from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  onNavigateToCheckout: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBack,
  onSelectProduct,
  onNavigateToCheckout
}) => {
  const {
    products,
    addToCart,
    startBuyNow,
    wishlist,
    toggleWishlist,
    reviews,
    addReview,
    notify,
    isAuthenticated,
    openAuthModal
  } = useStore();

  const product = products.find(p => p.id === productId) || products[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'nutrition' | 'origin' | 'reviews' | 'yield'>('details');
  const [mediaView, setMediaView] = useState<'3d' | 'photo'>('photo');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [subFrequency, setSubFrequency] = useState<'15' | '30' | '45'>('30');
  const [pincodeInput, setPincodeInput] = useState<string>('');
  const [pincodeStatus, setPincodeStatus] = useState<{ valid: boolean; message: string; eta?: string; cod?: boolean } | null>(null);

  // Reset variant when product changes
  React.useEffect(() => {
    setSelectedVariant(product.variants[0]);
    setQuantity(1);
    setSelectedPhotoIndex(0);
    setMediaView(product.images && product.images[0]?.startsWith('/images/') ? 'photo' : '3d');
  }, [product.id]);

  // Review form state
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewCity, setNewReviewCity] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const productReviews = reviews.filter(r => r.productId === product.id);
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    if (isSubscription) {
      const subVariant: ProductVariant = {
        ...selectedVariant,
        price: Math.round(selectedVariant.price * 0.85),
        size: `${selectedVariant.size} (Auto-Refill: Every ${subFrequency} Days)`
      };
      addToCart(product, subVariant, quantity);
      notify(
        'Subscription Activated',
        `Scheduled ${product.name} auto-refill every ${subFrequency} days with 15% VIP discount!`,
        'success'
      );
    } else {
      addToCart(product, selectedVariant, quantity);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      openAuthModal('login', { product, variant: selectedVariant, quantity });
      return;
    }
    const buyVariant: ProductVariant = isSubscription
      ? {
          ...selectedVariant,
          price: Math.round(selectedVariant.price * 0.85),
          size: `${selectedVariant.size} (Auto-Refill: Every ${subFrequency} Days)`
        }
      : selectedVariant;
    startBuyNow(product, buyVariant, quantity);
    onNavigateToCheckout();
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincodeInput.trim();
    if (!/^[1-9][0-9]{5}$/.test(clean)) {
      setPincodeStatus({ valid: false, message: 'Please enter a valid 6-digit Indian pincode.' });
      return;
    }
    const isLucknow = clean.startsWith('226');
    const isMetro = ['110', '201', '122', '400', '560', '500', '302'].some(p => clean.startsWith(p));
    setPincodeStatus({
      valid: true,
      message: isLucknow
        ? `Express 2-Hour EV Chakki Delivery available for ${clean}`
        : isMetro
        ? `Next-Day Fresh Milled Delivery available for ${clean}`
        : `Standard 2–3 Day Insured Delivery available for ${clean}`,
      eta: isLucknow ? 'Delivery within 2 Hours' : isMetro ? 'Delivery by Tomorrow, 7 PM' : 'Delivery in 2–3 Days',
      cod: true
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      notify('Missing Fields', 'Please enter your name and comments.', 'warning');
      return;
    }
    setIsSubmittingReview(true);
    setTimeout(() => {
      addReview({
        productId: product.id,
        userName: newReviewAuthor,
        userCity: newReviewCity || 'Verified Customer',
        rating: newReviewRating,
        comment: newReviewComment,
        verifiedPurchase: true
      });
      setNewReviewAuthor('');
      setNewReviewCity('');
      setNewReviewComment('');
      setIsSubmittingReview(false);
    }, 600);
  };

  const discountPercent = Math.round(
    ((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100
  );

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 md:py-8 space-y-10 md:space-y-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <span>← Back to Catalog</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleWishlist(product.id)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-500 transition-all shadow-sm"
            title="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              notify('Link Copied', 'Product link copied to clipboard.', 'info');
            }}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-all shadow-sm"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Showcase & Product Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Media Showcase (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setMediaView('3d')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  mediaView === '3d'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>3D Pack Model</span>
              </button>

              {product.images && product.images.length > 0 && product.images[0].startsWith('/images/') && (
                <button
                  onClick={() => setMediaView('photo')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    mediaView === 'photo'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Official Pack Photos ({product.images.length})</span>
                </button>
              )}
            </div>

            <span className="text-[11px] font-extrabold text-amber-800 pr-2">
              Purity: {product.purityScore}%
            </span>
          </div>

          {/* Canvas or Photo View */}
          {mediaView === '3d' ? (
            <Product3DCanvas
              product={product}
              height="h-[340px] sm:h-[400px] lg:h-[450px]"
              showControls={true}
            />
          ) : (
            <div className="relative h-[340px] sm:h-[400px] lg:h-[450px] rounded-3xl overflow-hidden bg-gradient-to-b from-amber-50/20 via-white to-slate-50 border border-slate-200 p-4 flex items-center justify-center shadow-inner">
              <img
                src={product.images[selectedPhotoIndex]}
                alt={product.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-xl"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-bold backdrop-blur-md">
                Photo {selectedPhotoIndex + 1} of {product.images.length}
              </div>
            </div>
          )}

          {/* Thumbnail Gallery Strip */}
          {product.images && product.images.length > 0 && product.images[0].startsWith('/images/') && (
            <div className="flex items-center space-x-2 pt-1 overflow-x-auto pb-1">
              <button
                onClick={() => setMediaView('3d')}
                className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center bg-white shrink-0 transition-all ${
                  mediaView === '3d' ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RotateCcw className="w-5 h-5 text-orange-600 mb-0.5" />
                <span className="text-[9px] font-bold text-slate-600">Interactive</span>
              </button>

              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPhotoIndex(idx);
                    setMediaView('photo');
                  }}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-white shrink-0 transition-all p-1 ${
                    mediaView === 'photo' && selectedPhotoIndex === idx
                      ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Genuine Certified Milling • Cold Ground &lt; 28°C</span>
            </div>
            <span className="font-extrabold text-amber-700">Lab Batch #{product.labTestBatch}</span>
          </div>
        </div>

        {/* Product Details & Purchase Controls (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Category & Badge */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-300 text-orange-950 text-xs sm:text-sm font-bold uppercase">
                {product.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold">
                Batch #{product.labTestBatch}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              {product.name}
            </h1>
            {product.subTitle && (
              <p className="text-base sm:text-lg font-extrabold text-orange-950 mt-1">
                {product.subTitle}
              </p>
            )}

            {/* Official Composition Callout */}
            {product.composition && (
              <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block">
                  Official Grain Composition
                </span>
                <p className="text-sm sm:text-base font-bold text-emerald-950 mt-0.5">
                  {product.composition}
                </p>
              </div>
            )}

            {/* Package Badges */}
            {product.packageBadges && product.packageBadges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {product.packageBadges.map((badge, bIdx) => (
                  <span
                    key={bIdx}
                    className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-slate-900 text-xs sm:text-sm font-bold inline-flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Ratings */}
            <div className="flex items-center space-x-3 mt-3.5">
              <div className="flex items-center space-x-1 text-orange-500 text-sm">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <span className="text-sm font-black text-slate-950">{product.rating}</span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Price & Discount Banner */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <div className="flex items-baseline space-x-2.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-950">₹{selectedVariant.price}</span>
                {selectedVariant.originalPrice > selectedVariant.price && (
                  <span className="text-base text-slate-400 line-through font-bold">
                    ₹{selectedVariant.originalPrice}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-950 text-xs sm:text-sm font-black">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Inclusive of all taxes • Free EV delivery over ₹499</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-emerald-700 flex items-center justify-end space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>In Stock</span>
              </span>
              <span className="text-xs text-slate-500 font-semibold">{selectedVariant.stockCount} fresh sacks</span>
            </div>
          </div>

          {/* Size / Variant Picker */}
          <div>
            <label className="block text-sm font-black text-slate-900 mb-2.5">
              Select Package Size / Weight:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    selectedVariant.id === v.id
                      ? 'bg-orange-500 border-orange-500 text-slate-950 shadow-md ring-2 ring-orange-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300'
                  }`}
                >
                  <span className={`block text-xs sm:text-sm ${selectedVariant.id === v.id ? 'font-black text-slate-950' : 'font-bold text-slate-800'}`}>
                    {v.size}
                  </span>
                  <span className={`block text-sm sm:text-base font-black mt-1 ${selectedVariant.id === v.id ? 'text-slate-950' : 'text-orange-600'}`}>
                    ₹{isSubscription ? Math.round(v.price * 0.85) : v.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Purchase Type: One-Time vs Subscribe & Save 15% */}
          <div className="space-y-2.5">
            <label className="block text-sm font-black text-slate-900">
              Delivery Preference:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option A: One Time */}
              <div
                onClick={() => setIsSubscription(false)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  !isSubscription
                    ? 'bg-white border-slate-950 ring-2 ring-slate-950/10 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">One-Time Order</span>
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center">
                    {!isSubscription && <span className="w-2 h-2 rounded-full bg-slate-950" />}
                  </span>
                </div>
                <span className="block text-base sm:text-lg font-black text-slate-950 mt-1">
                  ₹{selectedVariant.price}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Single doorstep dispatch</span>
              </div>

              {/* Option B: Subscribe & Save 15% */}
              <div
                onClick={() => setIsSubscription(true)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                  isSubscription
                    ? 'bg-orange-50/70 border-orange-500 ring-2 ring-orange-500/20 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                }`}
              >
                <span className="absolute top-0 right-0 bg-orange-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                  Save 15%
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs sm:text-sm text-orange-950">Auto-Refill</span>
                  <span className="w-3.5 h-3.5 rounded-full border border-orange-300 flex items-center justify-center">
                    {isSubscription && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                  </span>
                </div>
                <span className="block text-base sm:text-lg font-black text-orange-600 mt-1">
                  ₹{Math.round(selectedVariant.price * 0.85)}
                </span>
                <span className="text-[11px] text-emerald-800 font-bold">15% off every refill</span>
              </div>
            </div>

            {/* If Subscription is selected: Delivery interval options */}
            {isSubscription && (
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2 animate-fade-in">
                <span className="text-xs font-bold text-slate-800 block">Select Refill Interval:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '15', label: 'Every 15 Days' },
                    { id: '30', label: 'Every 30 Days' },
                    { id: '45', label: 'Every 45 Days' }
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => setSubFrequency(freq.id as any)}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        subFrequency === freq.id
                          ? 'bg-slate-950 text-white font-black'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 font-medium pt-1 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 inline" />
                  <span>Fresh morning stoneground batch • Skip, pause, or cancel anytime with 1 click.</span>
                </p>
              </div>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center space-x-3.5">
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <Minus className="w-4 h-4 font-black" />
                </button>
                <span className="w-12 text-center font-black text-base text-slate-950">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4 font-black" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-bold text-sm sm:text-base shadow-sm transition-all active:scale-95"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Basket</span>
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-sm sm:text-base shadow-md transition-all active:scale-95"
            >
              Express 2-Hour Delivery Checkout →
            </button>
          </div>

          {/* Pincode Serviceability Check (Flipkart Style) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <form onSubmit={handleCheckPincode} className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit delivery pincode (e.g. 226010)"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold text-xs transition-all"
              >
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className={`text-xs font-bold flex items-center space-x-1.5 ${pincodeStatus.valid ? 'text-emerald-700' : 'text-rose-600'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{pincodeStatus.message}{pincodeStatus.cod ? ' • Cash on Delivery available' : ''}</span>
              </p>
            )}
          </div>

          {/* Delivery & Assurance */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>EV Van Delivery in 2 Hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>100% Money-back Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications, Nutritional Facts, Farm Origin, Customer Reviews */}
      <div className="pt-6">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {[
            { id: 'details', label: 'Craft & Benefits', icon: Wheat },
            { id: 'nutrition', label: 'Nutritional Facts', icon: BarChart3 },
            { id: 'origin', label: 'Farm Origin & Transparency', icon: MapPin },
            { id: 'yield', label: 'Roti Yield Calculator', icon: Calculator },
            { id: 'reviews', label: `Reviews (${productReviews.length})`, icon: Star },
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shadow-2xs ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-slate-950 font-black shadow-orange-500/20'
                    : 'bg-white text-slate-700 hover:text-slate-950 border border-slate-200'
                }`}
              >
                <TabIcon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="py-8">
          {/* TAB 1: DETAILS */}
          {/* TAB 1: DETAILS (Category Aware) */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">
                  {product.category === 'oil'
                    ? 'Cold-Pressed Extraction Process'
                    : product.category === 'ghee'
                    ? 'Traditional Bilona Crafting Process'
                    : product.category === 'combos' || product.category === 'combo'
                    ? 'Curated Family Bundle Details'
                    : 'Traditional Stone Milling Process'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {product.description}
                </p>
                <div className="space-y-2.5 pt-2">
                  {product.benefits.map((b, i) => (
                    <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                {/* Category-Specific Specifications Block */}
                {product.category === 'oil' ? (
                  <>
                    <h3 className="text-sm font-bold text-slate-900">Cold-Pressed Mustard Oil Specifications</h3>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Extraction Technique</span>
                        <span className="font-bold text-slate-900">{product.extractionMethod || 'Cold-Pressed Kachi Ghani'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Seed Selection</span>
                        <span className="font-bold text-amber-700">{product.seedVariety || 'Grade-1 Mustard Seeds'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Chemical Solvents</span>
                        <span className="font-bold text-emerald-700">0.0% (Hexane-Free)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Cooking Smoke Point</span>
                        <span className="font-bold text-slate-900">{product.smokePoint || 'High Smoke Point (250°C)'}</span>
                      </div>
                    </div>
                  </>
                ) : product.category === 'ghee' ? (
                  <>
                    <h3 className="text-sm font-bold text-slate-900">Traditional Bilona Ghee Specifications</h3>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Churning Method</span>
                        <span className="font-bold text-slate-900">{product.churningMethod || 'Bilona Hand-Churned Curd'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Granular Texture</span>
                        <span className="font-bold text-amber-700">{product.gheeTexture || 'Danedaar Golden'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Preservatives</span>
                        <span className="font-bold text-emerald-700">Zero (100% Pure Milk Fat)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Storage Instructions</span>
                        <span className="font-bold text-slate-900">{product.storageInstructions || 'Cool Dry Place (No Fridge)'}</span>
                      </div>
                    </div>
                  </>
                ) : product.category === 'combos' || product.category === 'combo' ? (
                  <>
                    <h3 className="text-sm font-bold text-slate-900">Curated Combo Specifications</h3>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                        <span className="text-[10px] text-slate-500 block">Bundled Essentials</span>
                        <span className="font-bold text-slate-900">{product.comboItems?.join(' • ') || product.subTitle || 'Family Kitchen Pairings'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Sealing Integrity</span>
                        <span className="font-bold text-emerald-700">Individual Vacuum Seals</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Doorstep Delivery</span>
                        <span className="font-bold text-amber-700">Free 2-Hour EV Delivery</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-bold text-slate-900">Cold Stone Chakki Specifications</h3>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Flour Consistency</span>
                        <span className="font-bold text-slate-900">{product.flourType || '100% Stoneground Whole Wheat'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Milling Speed</span>
                        <span className="font-bold text-amber-700">{product.millingSpeed || 'Cold Stone Milled < 28°C'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Roti Softness Rating</span>
                        <span className="font-bold text-emerald-700">10 / 10 (Soft for 14+ Hrs)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Maida Mixing</span>
                        <span className="font-bold text-rose-700">0.0% (Strictly Zero)</span>
                      </div>
                    </div>
                  </>
                )}

                <h3 className="text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">Certifications &amp; Quality Seals</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.certifications.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center space-x-2"
                    >
                      <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-orange-600 shrink-0" />
                  <span><strong>ItsClear Purity Promise:</strong> Every batch is tested for zero adulteration, zero chemicals, and verified nutritional integrity.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NUTRITION */}
          {activeTab === 'nutrition' && (
            <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Lab Tested Nutritional Values (Per 100g serving)
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {Object.entries(product.nutrition).map(([key, val]) => (
                  <div key={key} className="py-3 flex justify-between">
                    <span className="capitalize text-slate-500 font-medium">{key}</span>
                    <span className="font-bold text-slate-900">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORIGIN */}
          {activeTab === 'origin' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <MapPin className="w-6 h-6 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-sm">Farm Geo-Origin</h4>
                <p className="text-xs text-slate-600">{product.origin}</p>
                <p className="text-[11px] text-slate-400">Rich black soil river basin</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <Calendar className="w-6 h-6 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-sm">Harvest Season</h4>
                <p className="text-xs text-slate-600">{product.harvestSeason}</p>
                <p className="text-[11px] text-slate-400">Sun cured & unbleached</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <FileCheck className="w-6 h-6 text-cyan-600" />
                <h4 className="font-bold text-slate-900 text-sm">NABL Lab Batch</h4>
                <p className="text-xs text-slate-600">#{product.labTestBatch}</p>
                <p className="text-[11px] text-slate-400">Purity index: {product.purityScore}%</p>
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Existing Reviews */}
              <div className="space-y-4">
                {productReviews.length === 0 ? (
                  <p className="text-xs text-slate-500">Be the first to review this harvested batch!</p>
                ) : (
                  productReviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-xs">{r.userName}</span>
                          <span className="text-[10px] text-slate-500">({r.userCity})</span>
                          {r.verifiedPurchase && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0 inline" />
                              <span>Verified Buyer</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">{r.date}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-500 text-xs">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review Form */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xl space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Write a Farm Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Your City"
                      value={newReviewCity}
                      onChange={(e) => setNewReviewCity(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Rating:</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewReviewRating(s)}
                          className="p-1 text-amber-500"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              s <= newReviewRating ? 'fill-amber-500' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Share how the rotis, tadka, or freshness turned out..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    required
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-60"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Post Farm Review'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: ROTI YIELD CALCULATOR */}
          {activeTab === 'yield' && (
            <div className="animate-fade-in">
              <RotiYieldCalculator product={product} />
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Frequently Harvested Together</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard3D key={p.id} product={p} onNavigateToDetail={onSelectProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
