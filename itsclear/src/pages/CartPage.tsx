import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Floating3DIcon } from '../components/three/Floating3DIcon';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Clock,
  Leaf,
  Wheat,
  Package,
  Bookmark
} from 'lucide-react';

interface CartPageProps {
  onNavigateToCheckout: () => void;
  onNavigateToShop: () => void;
  onSelectProduct: (productId: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onNavigateToCheckout,
  onNavigateToShop,
  onSelectProduct
}) => {
  const {
    cart,
    saveForLater,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    moveToSaveForLater,
    moveToCartFromSaved,
    removeFromSavedForLater,
    clearBuyNow,
    deliverySlot,
    setDeliverySlot,
    ecoPackaging,
    setEcoPackaging,
    coupons,
    cartSubtotal,
    deliveryFee,
    cartTax,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (code: string) => {
    applyCoupon(code);
    setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    clearBuyNow();
    onNavigateToCheckout();
  };

  if (cart.length === 0 && saveForLater.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <Floating3DIcon size="xl" color="gold">
          <ShoppingBag className="w-14 h-14 text-orange-600" />
        </Floating3DIcon>
        <h1 className="text-3xl font-black text-slate-900">Your itsclear Basket is Empty</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Your family deserves 100% pure stoneground chakki fresh atta, cold-pressed mustard oil, and Vedic Bilona desi ghee — unadulterated, verified, and delivered to your doorstep.
        </p>
        <div>
          <button
            onClick={onNavigateToShop}
            className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all"
          >
            Explore Kitchen Essentials
          </button>
        </div>
      </div>
    );
  }

  const amountForFreeDelivery = Math.max(0, 499 - cartSubtotal);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Your Shopping Basket
          </h1>
          <p className="text-xs text-amber-700 font-bold mt-0.5">
            {cart.length} item{cart.length === 1 ? '' : 's'} queued for fresh dispatch
          </p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-slate-500 hover:text-rose-600 font-bold transition-colors flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Basket</span>
          </button>
        )}
      </div>

      {/* Free Delivery Progress Banner (Synced with ₹499 threshold) */}
      {cart.length > 0 && (
        <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between ${amountForFreeDelivery === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          <span>
            {amountForFreeDelivery === 0
              ? 'Free Express EV Delivery Unlocked (Orders ₹499+)'
              : `Add ₹${amountForFreeDelivery} more to unlock FREE Express EV Delivery (₹499+)`}
          </span>
          <span className="font-black">{amountForFreeDelivery === 0 ? 'FREE' : '₹49 fee'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items & Save for Later (Left 8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {cart.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <p className="text-sm font-bold text-slate-700">Your active basket is empty.</p>
              <button
                onClick={onNavigateToShop}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Browse Atta Range
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.selectedVariant.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div
                    onClick={() => onSelectProduct(item.product.id)}
                    className="flex items-center space-x-4 cursor-pointer group"
                  >
                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {item.product.images && item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-orange-500" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition-colors">
                        {item.product.name}
                      </h3>
                      {item.product.subTitle && (
                        <p className="text-xs text-amber-800 font-bold">
                          {item.product.subTitle}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          {item.selectedVariant.size}
                        </span>
                        <span>•</span>
                        <span>₹{item.selectedVariant.price} per pack</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper, Save for Later & Price */}
                  <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-sm">
                      <button
                        onClick={() => updateCartQuantity(item.selectedVariant.id, item.quantity - 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.selectedVariant.id, item.quantity + 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="block font-black text-lg text-slate-900">
                        ₹{item.selectedVariant.price * item.quantity}
                      </span>
                      <div className="flex items-center justify-end space-x-2 mt-0.5">
                        <button
                          onClick={() => moveToSaveForLater(item.selectedVariant.id)}
                          className="text-[11px] text-amber-700 hover:text-amber-800 font-bold transition-colors"
                        >
                          Save for Later
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => removeFromCart(item.selectedVariant.id)}
                          className="text-[11px] text-slate-400 hover:text-rose-600 font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery Slot Selection (Persisted in StoreContext) */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Choose Delivery Slot</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: '2-Hour Farm Express', time: 'Within 2 Hours (EV Express)' },
                    { id: 'Tomorrow Morning 7-9 AM', time: 'Tomorrow: 7:00 AM - 9:00 AM' },
                    { id: 'Tomorrow Evening 5-8 PM', time: 'Tomorrow: 5:00 PM - 8:00 PM' }
                  ].map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setDeliverySlot(slot.id)}
                      className={`p-3 rounded-2xl text-xs font-bold text-left border transition-all ${
                        deliverySlot === slot.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>

                <label className="flex items-center space-x-3 pt-3 border-t border-slate-100 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ecoPackaging}
                    onChange={(e) => setEcoPackaging(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                  />
                  <span className="flex items-center space-x-1.5 text-xs text-slate-700">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pack in 100% Biodegradable Jute & Kraft Paper (Zero Single-Use Plastic)</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Save For Later Section (Flipkart Style) */}
          {saveForLater.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-sm font-black text-slate-900">
                <Bookmark className="w-4 h-4 text-amber-600" />
                <span>Saved For Later ({saveForLater.length})</span>
              </div>
              <div className="divide-y divide-slate-100">
                {saveForLater.map((item) => (
                  <div key={item.selectedVariant.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Package className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">{item.product.name}</p>
                        <p className="text-[11px] text-slate-500">{item.selectedVariant.size} • ₹{item.selectedVariant.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveToCartFromSaved(item.selectedVariant.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                      >
                        Move to Basket
                      </button>
                      <button
                        onClick={() => removeFromSavedForLater(item.selectedVariant.id)}
                        className="text-xs text-slate-400 hover:text-rose-600 font-medium px-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary & Coupon (Right 4 Cols) */}
        {cart.length > 0 && (
          <div className="lg:col-span-4 space-y-6 sticky top-28">
            {/* Coupon Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Have a Promo Code?</span>
              </div>

              {appliedCoupon ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-emerald-800 block">
                      Code {appliedCoupon.code} Applied!
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      {appliedCoupon.freeShipping ? 'Free Express Delivery Unlocked' : `Saved ₹${appliedCoupon.discountAmount}`}
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. CLEAR50"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 w-full focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                  <button
                    onClick={() => handleApplyCoupon(couponInput)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 transition-all shadow-sm"
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Unified Coupons from StoreContext / DB */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold block">Available Coupons:</span>
                <div className="flex flex-wrap gap-1.5">
                  {coupons.slice(0, 4).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleApplyCoupon(c.code)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-amber-800 hover:border-amber-400 transition-all"
                      title={c.description}
                    >
                      {c.code} (Min ₹{c.minOrderValue})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Breakdown Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Bill Summary
              </h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{cartDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Farm-to-Door Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : 'text-slate-900'}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Taxes (0% Unbranded Flour GST)</span>
                  <span className="text-emerald-700 font-bold">{cartTax === 0 ? 'Included' : `₹${cartTax}`}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between text-lg font-black text-slate-900">
                  <span>To Pay</span>
                  <span className="text-amber-600">₹{cartTotal}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all transform active:scale-98"
              >
                <span>Continue to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe & Secure SSL Encrypted Payment</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
