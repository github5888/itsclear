import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShieldCheck,
  Check,
  Plus,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  QrCode,
  Truck,
  Lock,
  Building2,
  Phone,
  RotateCw,
  Coins,
  CheckCircle2,
  Trash2,
  MapPin,
  Clock,
  Sparkles,
  Banknote,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';

interface CheckoutPageProps {
  onOrderSuccess: (orderId: string) => void;
  onBackToCart: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onBackToCart }) => {
  const {
    activeCheckoutItems,
    cartSubtotal,
    cartDiscount,
    coinsDiscount,
    useClearCoins,
    setUseClearCoins,
    deliveryFee,
    cartTotal,
    savedAddresses,
    selectedAddress,
    setSelectedAddress,
    addAddress,
    placeOrder,
    currentUser,
    isAuthenticated,
    openAuthModal,
    updateCartQuantity,
    removeFromCart,
    notify
  } = useStore();

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card' | 'netbanking'>('cod');
  const [upiSubMethod, setUpiSubMethod] = useState<'phonepe' | 'gpay' | 'paytm' | 'id'>('phonepe');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Human Verification Code for COD
  const [captchaCode, setCaptchaCode] = useState('742');
  const [enteredCaptcha, setEnteredCaptcha] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [gstin, setGstin] = useState('');
  const [showGstinInput, setShowGstinInput] = useState(false);

  // Address Selection & Management
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  // New Address Form Inputs
  const [newAddrName, setNewAddrName] = useState(currentUser?.name || '');
  const [newAddrPhone, setNewAddrPhone] = useState(currentUser?.phone || '');
  const [newAddrPin, setNewAddrPin] = useState('226010');
  const [newAddrLocality, setNewAddrLocality] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState(currentUser?.city || 'Lucknow');
  const [newAddrState, setNewAddrState] = useState('Uttar Pradesh');
  const [newAddrType, setNewAddrType] = useState<'home' | 'work'>('home');

  // Auto-generate fresh 3-digit Captcha on load
  const generateNewCaptcha = () => {
    const code = Math.floor(100 + Math.random() * 900).toString();
    setCaptchaCode(code);
    setEnteredCaptcha('');
  };

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  // Sync selected address if not set
  useEffect(() => {
    if (!selectedAddress && savedAddresses.length > 0) {
      setSelectedAddress(savedAddresses[0]);
    }
  }, [savedAddresses, selectedAddress, setSelectedAddress]);

  // Handle Adding Address inline
  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName.trim() || !newAddrPhone.trim() || !newAddrStreet.trim() || !newAddrPin.trim()) {
      notify('Missing Fields', 'Please complete all required address details.', 'warning');
      return;
    }

    addAddress({
      fullName: newAddrName.trim(),
      phone: newAddrPhone.trim(),
      street: newAddrStreet.trim(),
      apartment: newAddrLocality.trim(),
      city: newAddrCity.trim(),
      state: newAddrState.trim(),
      pincode: newAddrPin.trim(),
      type: newAddrType,
      isDefault: savedAddresses.length === 0
    });

    setShowNewAddressForm(false);
    setShowAddressPicker(false);
    notify('Address Saved', 'Delivery address selected.', 'success');
  };

  // Handle Order Placement
  const handleCompleteOrder = async () => {
    if (!selectedAddress) {
      setShowNewAddressForm(true);
      notify('Address Required', 'Please provide a delivery address to complete your order.', 'warning');
      return;
    }

    if (paymentMethod === 'cod') {
      if (enteredCaptcha.trim() !== captchaCode) {
        notify('Verification Code Incorrect', 'Please enter the 3-digit code shown above.', 'error');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const order = await placeOrder({
        deliverySlot: '2-Hour Farm Express',
        paymentMethod,
        address: selectedAddress,
        gstin: gstin.trim() ? gstin.trim().toUpperCase() : undefined
      });

      notify('Order Placed Successfully!', `Order ID: #${order.id.slice(-6).toUpperCase()}`, 'success');
      onOrderSuccess(order.id);
    } catch (err: any) {
      notify('Order Failed', err.message || 'Could not place order. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Empty Basket State
  if (activeCheckoutItems.length === 0) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center bg-[#faf9f5]">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-700">
          <Truck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Your Basket is Empty</h2>
        <p className="text-sm text-slate-600 mb-6 max-w-sm">
          Add our 100% stoneground pure whole wheat &amp; ancient grain attas to begin checkout.
        </p>
        <button
          onClick={onBackToCart}
          className="px-8 py-3.5 rounded-2xl bg-slate-950 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all active:scale-98"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9f5] min-h-screen py-8 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/80 mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToCart}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300 transition-all shadow-2xs"
              title="Back to Basket"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                Express Checkout
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Fresh Stoneground Chakki Atta • Farm to Doorstep Delivery
              </p>
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Bank-Grade SSL Encrypted</span>
          </div>
        </div>

        {/* Main 2-Column Luxury Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: FOCUSED ORDER DETAILS & PAYMENT (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. DELIVERY ADDRESS CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-950">Delivery Address</h3>
                    <p className="text-xs text-slate-500 font-medium">Where should we deliver your fresh flour?</p>
                  </div>
                </div>

                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddressPicker(!showAddressPicker)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>{showAddressPicker ? 'Done' : 'Change Address'}</span>
                  </button>
                )}
              </div>

              {/* Selected Address Card */}
              {selectedAddress && !showNewAddressForm && !showAddressPicker && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 flex items-start justify-between">
                  <div className="flex items-start space-x-3.5">
                    <MapPin className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                    <div className="text-xs space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-950 text-sm">{selectedAddress.fullName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold uppercase text-[10px]">
                          {selectedAddress.type}
                        </span>
                        <span className="font-semibold text-slate-600">{selectedAddress.phone}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {selectedAddress.apartment ? `${selectedAddress.apartment}, ` : ''}
                        {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} -{' '}
                        <strong className="text-slate-950">{selectedAddress.pincode}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              )}

              {/* Address Picker if user clicks Change Address */}
              {showAddressPicker && !showNewAddressForm && (
                <div className="mt-4 space-y-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddress?.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => { setSelectedAddress(addr); setShowAddressPicker(false); }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                                {addr.type}
                              </span>
                              <span className="text-slate-500 font-medium">{addr.phone}</span>
                            </div>
                            <p className="text-slate-600">
                              {addr.apartment ? `${addr.apartment}, ` : ''}{addr.street}, {addr.city} - {addr.pincode}
                            </p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-700 hover:border-amber-500 hover:text-amber-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Delivery Address</span>
                  </button>
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddressForm || (!selectedAddress && savedAddresses.length === 0)) && (
                <form onSubmit={handleSaveNewAddress} className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Enter Delivery Details</span>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newAddrName}
                        onChange={(e) => setNewAddrName(e.target.value)}
                        placeholder="e.g. Prince Singh"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newAddrPin}
                        onChange={(e) => setNewAddrPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="e.g. 226010"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={newAddrCity}
                        onChange={(e) => setNewAddrCity(e.target.value)}
                        placeholder="Lucknow"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Street Address / House No. / Landmark *</label>
                      <input
                        type="text"
                        required
                        value={newAddrStreet}
                        onChange={(e) => setNewAddrStreet(e.target.value)}
                        placeholder="Flat / House No., Apartment name, Street, Colony"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-1">
                    <span className="text-xs font-bold text-slate-700">Address Type:</span>
                    <label className="inline-flex items-center space-x-1.5 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="addr_type"
                        checked={newAddrType === 'home'}
                        onChange={() => setNewAddrType('home')}
                        className="text-amber-600"
                      />
                      <span>Home (All day)</span>
                    </label>
                    <label className="inline-flex items-center space-x-1.5 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="addr_type"
                        checked={newAddrType === 'work'}
                        onChange={() => setNewAddrType('work')}
                        className="text-amber-600"
                      />
                      <span>Work (9 AM - 6 PM)</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-slate-950 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Save &amp; Deliver Here
                  </button>
                </form>
              )}
            </div>

            {/* 2. EXPRESS 2-HOUR COLD MILLING DELIVERY BADGE */}
            <div className="rounded-3xl border border-amber-300/80 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-amber-50/70 p-5 shadow-xs">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-slate-950">2-Hour Farm Express Delivery</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                      Free Shipping
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    Your grain batch enters cold stone milling (&lt;28°C) immediately upon order confirmation. 
                    Delivered unadulterated directly to your doorstep in vacuum-safe eco packaging.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. GRAIN COINS LOYALTY CARD */}
            {currentUser && (
              <div className="rounded-3xl border border-amber-300/90 bg-gradient-to-br from-amber-100/60 via-amber-50 to-orange-50/40 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-black">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-black text-slate-950">Grain Coins Balance</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 text-[10px] font-black">
                          {currentUser.clearCoins ?? 250} Coins (₹{currentUser.clearCoins ?? 250})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        Redeem up to ₹{coinsDiscount || 47} instantly on this stoneground order
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={useClearCoins}
                      onChange={(e) => setUseClearCoins(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* 4. PAYMENT METHOD SELECTION */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">Select Payment Method</h3>
                  <p className="text-xs text-slate-500 font-medium">Safe &amp; encrypted transaction options</p>
                </div>
              </div>

              {/* Payment Option Cards */}
              <div className="space-y-3">

                {/* OPTION 1: CASH ON DELIVERY */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-50/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-slate-950 text-sm">Cash on Delivery (Pay at Doorstep)</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Zero Advance Fee
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                          Pay cash or scan UPI QR code with your delivery partner when your freshly milled pack arrives.
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                      paymentMethod === 'cod' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* COD Human Verification Input */}
                  {paymentMethod === 'cod' && (
                    <div className="mt-4 pt-4 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-bold text-slate-700">Verification Code:</span>
                        <div className="px-3 py-1.5 bg-slate-900 rounded-xl font-mono font-black text-amber-400 text-base tracking-[6px] shadow-2xs select-none">
                          {captchaCode}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); generateNewCaptcha(); }}
                          className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors"
                          title="Generate new code"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="w-full sm:w-44">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={3}
                          value={enteredCaptcha}
                          onChange={(e) => setEnteredCaptcha(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="Type 3-digit code"
                          className="w-full px-3 py-1.5 text-center font-mono font-bold text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* OPTION 2: UPI INSTANT (GPAY, PHONEPE, PAYTM, BHIM) */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-amber-500 bg-amber-50/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-slate-950 text-sm">UPI Instant Payment</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                            Fastest
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          Pay directly from Google Pay, PhonePe, Paytm, or BHIM UPI app
                        </p>

                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold">GPay</span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[11px] font-bold">PhonePe</span>
                          <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 text-[11px] font-bold">Paytm</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-bold">BHIM</span>
                        </div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                      paymentMethod === 'upi' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* OPTION 3: CARDS (DEBIT / CREDIT / ATM) */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-amber-500 bg-amber-50/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 font-bold">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-black text-slate-950 text-sm">Credit / Debit / ATM Card</span>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          Visa, MasterCard, RuPay, Maestro accepted via secure gateway
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                      paymentMethod === 'card' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* OPTION 4: NET BANKING */}
                <div
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-amber-500 bg-amber-50/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0 font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-black text-slate-950 text-sm">Net Banking</span>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          All major Indian banks supported (HDFC, SBI, ICICI, Axis)
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                      paymentMethod === 'netbanking' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'netbanking' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

              </div>

              {/* Optional GSTIN Input */}
              <div className="pt-2">
                {!showGstinInput ? (
                  <button
                    type="button"
                    onClick={() => setShowGstinInput(true)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add GSTIN for Business Tax Invoice (Optional)</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Business GSTIN Number</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 09ABCDE1234F1Z5"
                      className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 uppercase focus:outline-none focus:border-amber-600"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY LUXURY ORDER SUMMARY & CTA (5 COLS) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">

            {/* ORDER ITEMS CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                  Order Items ({activeCheckoutItems.length})
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  100% Cold Chakki Milled
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 space-y-3 max-h-72 overflow-y-auto pr-1">
                {activeCheckoutItems.map((item) => (
                  <div key={item.selectedVariant.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={item.product.images?.[0] || '/images/itsclear-logo-cropped.png'}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 leading-tight">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {item.selectedVariant.size}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-slate-950">
                        ₹{item.selectedVariant.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Items Subtotal</span>
                  <span className="text-slate-950 font-bold">₹{cartSubtotal}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Direct Savings Discount</span>
                    <span>- ₹{cartDiscount}</span>
                  </div>
                )}

                {useClearCoins && coinsDiscount > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold items-center">
                    <span className="inline-flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>Grain Coins Applied</span>
                    </span>
                    <span>- ₹{coinsDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Fresh Chakki Milling &amp; Packaging</span>
                  <span className="text-emerald-700 font-bold">
                    <span className="line-through text-slate-400 mr-1.5 font-normal">₹29</span>
                    FREE
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 font-medium">
                  <span>2-Hour Farm Express Delivery</span>
                  <span className="text-emerald-700 font-bold">
                    <span className="line-through text-slate-400 mr-1.5 font-normal">₹40</span>
                    FREE
                  </span>
                </div>

                {/* Total Payable */}
                <div className="pt-3 border-t-2 border-dashed border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-black text-slate-950 block">Total Payable</span>
                    <span className="text-[11px] text-slate-400 font-medium">Inclusive of all farm taxes &amp; GST</span>
                  </div>
                  <span className="text-2xl font-black text-slate-950 font-mono">
                    ₹{cartTotal}
                  </span>
                </div>
              </div>

              {/* Savings Announcement Pill */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black flex items-center justify-center space-x-1.5 shadow-2xs">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>You save ₹{cartDiscount + (useClearCoins ? coinsDiscount : 0) + 69} on this pure farm order!</span>
              </div>

              {/* Confirm Order CTA Button */}
              <button
                type="button"
                onClick={handleCompleteOrder}
                disabled={isProcessing || (paymentMethod === 'cod' && enteredCaptcha.length !== 3)}
                className="w-full py-4 rounded-2xl bg-slate-950 hover:bg-amber-600 text-white font-black text-sm tracking-wide transition-all shadow-lg hover:shadow-xl active:scale-98 disabled:opacity-50 flex items-center justify-center space-x-2 group"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Fresh Dispatch...</span>
                  </div>
                ) : (
                  <>
                    <span>Confirm Order • ₹{cartTotal}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] font-semibold text-slate-500 inline-flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Purity &amp; Zero-Maida Guarantee</span>
                </span>
              </div>
            </div>

            {/* FARM PURITY COMMITMENT CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs text-xs text-slate-600 space-y-2.5">
              <div className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>ItsClear™ Quality Commitment</span>
              </div>
              <p className="leading-relaxed">
                Milled on authentic slow-turning stone chakkis below 28°C to retain natural dietary fiber, live wheat germ oil, and natural aroma. Delivered unadulterated.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
