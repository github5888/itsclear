import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Sparkles, RefreshCw, Zap, Package, Wheat } from 'lucide-react';
import { ProductVariant } from '../../types';
import { BrandName } from '../common/BrandName';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToCheckout, onNavigateToShop }) => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    addToCart,
    clearBuyNow,
    cartSubtotal,
    cartItemCount,
    deliveryFee,
    cartTax,
    cartTotal,
    notify
  } = useStore();

  if (!isCartDrawerOpen) return null;

  const freeDeliveryThreshold = 499;
  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const freeDeliveryProgress = Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100);

  // Upgrade regular item to 15% monthly auto-refill
  const handleConvertToSubscription = (itemVariantId: string) => {
    const item = cart.find(i => i.selectedVariant.id === itemVariantId);
    if (!item) return;

    const discountedPrice = Math.round(item.selectedVariant.price * 0.85);
    const subVariant: ProductVariant = {
      ...item.selectedVariant,
      id: `${item.selectedVariant.id}-sub30`,
      price: discountedPrice,
      size: `${item.selectedVariant.size} (Auto-Refill: Every 30 Days)`
    };

    removeFromCart(item.selectedVariant.id);
    addToCart(item.product, subVariant, item.quantity, true);

    notify(
      'Converted to 15% Auto-Refill',
      `${item.product.name} is now on recurring monthly delivery at ₹${discountedPrice}.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 flex flex-col shadow-2xl text-slate-900">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-950 text-base sm:text-lg">Fresh Chakki Basket</h2>
                <p className="text-xs text-orange-900 font-bold">{cartItemCount} packs ready for cold milling</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-950 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Milestone */}
          <div className="p-4 bg-orange-50/50 border-b border-orange-200/50">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-1.5">
              <span className="flex items-center space-x-1.5 text-slate-800">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>
                  {freeDeliveryRemaining === 0
                    ? 'You unlocked FREE Farm-Fresh Delivery!'
                    : `Add ₹${freeDeliveryRemaining} more for FREE Delivery`}
                </span>
              </span>
              <span className="text-orange-600 font-black">{Math.round(freeDeliveryProgress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                  <Wheat className="w-8 h-8" />
                </div>
                <h3 className="font-black text-lg text-slate-950">Your atta basket is empty</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed font-medium">
                  Fill your home with 100% pure stoneground flours milled on cold chakki stones (<BrandName size="sm" theme="dark" />).
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    onNavigateToShop();
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all"
                >
                  Explore Atta Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const isSub = item.selectedVariant.size.includes('Auto-Refill');

                return (
                  <div
                    key={item.selectedVariant.id}
                    className={`p-3.5 rounded-2xl border transition-all shadow-2xs space-y-2.5 ${
                      isSub
                        ? 'bg-orange-50/40 border-orange-300 ring-1 ring-orange-200'
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Authentic Product Packet Thumbnail */}
                      <div className="w-14 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                        {item.product.images && item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain filter drop-shadow-xs"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-orange-500" />
                        )}
                      </div>

                      {/* Item info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-black text-sm text-slate-950 line-clamp-1">
                            {item.product.name}
                          </h4>
                        </div>

                        {/* Subscription or Regular Badge */}
                        {isSub ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-orange-100 text-orange-950 text-[10px] font-black border border-orange-300 mt-0.5">
                            <Zap className="w-3 h-3 text-orange-600 fill-orange-600" />
                            <span>15% Monthly Auto-Refill</span>
                          </span>
                        ) : (
                          <p className="text-xs text-slate-500 mt-0.5 font-medium line-clamp-1">
                            Pack: <span className="text-slate-900 font-bold">{item.selectedVariant.size}</span>
                          </p>
                        )}

                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm font-black text-slate-950">
                            ₹{item.selectedVariant.price * item.quantity}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            (₹{item.selectedVariant.price} each)
                          </span>
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex flex-col items-end space-y-2 shrink-0">
                        <button
                          onClick={() => removeFromCart(item.selectedVariant.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-slate-200 shadow-2xs">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.selectedVariant.id, item.quantity - 1)
                            }
                            className="p-1 rounded text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-slate-950 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.selectedVariant.id, item.quantity + 1)
                            }
                            className="p-1 rounded text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Upsell to 15% Monthly Subscription if one-time */}
                    {!isSub && (
                      <button
                        onClick={() => handleConvertToSubscription(item.selectedVariant.id)}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-orange-100/70 hover:bg-orange-100 border border-orange-300 text-orange-950 text-xs font-bold transition-colors"
                      >
                        <span className="flex items-center space-x-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
                          <span>Switch to 15% Auto-Refill</span>
                        </span>
                        <span className="font-black text-emerald-800">
                          Save ₹{Math.round(item.selectedVariant.price * 0.15)}/mo
                        </span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3.5">
              {/* Price summary */}
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-950">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Farm Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : 'text-slate-900 font-bold'}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (0% Unbranded Flour GST)</span>
                  <span className="text-emerald-700 font-bold">{cartTax === 0 ? 'Included' : `₹${cartTax}`}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base sm:text-lg font-black text-slate-950">
                  <span>Total Amount</span>
                  <span className="text-orange-600">₹{cartTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  clearBuyNow();
                  setIsCartDrawerOpen(false);
                  onNavigateToCheckout();
                }}
                className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-bold text-sm sm:text-base shadow-sm transition-all transform active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 font-black" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 pt-1 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Purity Guarantee • Contactless EV Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
