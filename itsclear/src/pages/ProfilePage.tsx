import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard3D } from '../components/shop/ProductCard3D';
import {
  User,
  Coins,
  MapPin,
  Heart,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  RotateCw,
  Calendar,
  Zap,
  Clock,
  Pause,
  Play,
  SkipForward,
  Edit3,
  Crown,
  Truck,
  Percent,
  Headphones,
  ChevronRight,
  Phone,
  Wheat,
  Tag
} from 'lucide-react';

interface ProfilePageProps {
  onSelectProduct: (productId: string) => void;
  onNavigateToShop: () => void;
  initialTab?: 'subscriptions' | 'coins' | 'addresses' | 'wishlist';
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onSelectProduct,
  onNavigateToShop,
  initialTab = 'subscriptions'
}) => {
  const {
    user,
    currentUser,
    orders,
    savedAddresses,
    deleteAddress,
    addAddress,
    setSelectedAddress,
    wishlist,
    products,
    addToCart,
    notify
  } = useStore();

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'coins' | 'addresses' | 'wishlist'>(initialTab);
  const [showAddModal, setShowAddModal] = useState(false);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Demo active subscriptions state
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 'sub-khapli-01',
      productId: 'itsclear-khapli-ancient',
      productName: 'itsclear Khapli Ancient Grain Atta',
      size: '5 kg Net Weight (Carry Handle)',
      price: 374, // 15% off 440
      mrp: 440,
      frequency: 30,
      nextDispatch: 'November 28, 2026',
      status: 'active' as 'active' | 'paused',
      isPopular: false,
      image: '/images/products/khapli-bori-only.png'
    },
    {
      id: 'sub-protein-02',
      productId: 'itsclear-high-protein',
      productName: 'itsclear Premium High Protein Atta (36% Protein)',
      size: '5 kg Bag (Carry Handle)',
      price: 420, // 15% off 494
      mrp: 494,
      frequency: 30,
      nextDispatch: 'December 05, 2026',
      status: 'active' as 'active' | 'paused',
      isPopular: true,
      image: '/images/products/protein-bori-only.png'
    }
  ]);

  // Address inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pin, setPin] = useState('');

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleToggleSubscription = (subId: string) => {
    setSubscriptions(prev =>
      prev.map(s => {
        if (s.id === subId) {
          const newStatus = s.status === 'active' ? 'paused' : 'active';
          notify(
            newStatus === 'paused' ? 'Subscription Paused' : 'Subscription Resumed',
            `${s.productName} auto-refill is now ${newStatus}.`,
            'info'
          );
          return { ...s, status: newStatus };
        }
        return s;
      })
    );
  };

  const handleSkipNext = (subId: string) => {
    setSubscriptions(prev =>
      prev.map(s => {
        if (s.id === subId) {
          notify('Delivery Skipped', `Skipped next milling run for ${s.productName}.`, 'success');
          return { ...s, nextDispatch: 'December 28, 2026' };
        }
        return s;
      })
    );
  };

  const handleEditSubscription = (productName: string) => {
    notify('Subscription Settings', `Editing schedule & frequency for ${productName}.`, 'info');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !street) {
      notify('Missing Fields', 'Please fill the required address details.', 'warning');
      return;
    }
    addAddress({
      fullName: name,
      phone,
      street,
      city: city || 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: pin || '226010',
      isDefault: false,
      type: 'home'
    });
    setName('');
    setPhone('');
    setStreet('');
    setShowAddModal(false);
  };

  const moveAllWishlistToCart = () => {
    wishlistedProducts.forEach(prod => {
      addToCart(prod, prod.variants[0], 1);
    });
    notify('Added to Basket', `Moved ${wishlistedProducts.length} saved favorites to your cart!`, 'success');
  };

  const activeUserName = currentUser?.name || user.name || 'Guest Shopper';
  const userInitials = activeUserName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const availableCoins = currentUser?.clearCoins ?? user.clearCoins ?? 0;

  return (
    <div className="w-full px-3 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-8 sm:py-10 space-y-8 sm:space-y-10">
      
      {/* ========================================================
          1. GOLDEN WHEAT HORIZON WELCOME BANNER (MATCHING SCREENSHOT)
          ======================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#fff7ed] via-[#fffdfa] to-[#ffedd5] border border-amber-200/80 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Decorative Golden Wheat Graphic */}
        <div className="absolute inset-y-0 right-1/4 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200/30 via-transparent to-transparent pointer-events-none blur-xl" />

        <div className="flex items-center space-x-4 sm:space-x-5 relative z-10">
          {/* Avatar Box */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0b1320] text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-md shrink-0">
            {userInitials}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                Welcome, {activeUserName}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-orange-100 text-orange-900 text-xs font-black border border-orange-300 shadow-2xs">
                {user.membershipTier || 'Silver Grain'}
              </span>
            </div>

            <div className="flex items-center space-x-2 mt-1.5 text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Direct-from-Farmer Subscriber</span>
            </div>
          </div>
        </div>

        {/* Coins Wallet Card */}
        <div
          onClick={() => setActiveTab('coins')}
          className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200/90 shadow-sm flex items-center space-x-3.5 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all relative z-10 shrink-0"
        >
          <div className="w-12 h-12 rounded-xl bg-[#ea580c] text-white flex items-center justify-center font-black shadow-2xs shrink-0">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 flex items-center">
              <span>{availableCoins} Coins</span>
            </div>
            <p className="text-xs text-[#ea580c] font-bold mt-0.5">
              = ₹{availableCoins} instant checkout discount
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 ml-1" />
        </div>
      </div>

      {/* ========================================================
          2. HORIZONTAL NAVIGATION TABS (4 CARDS MATCHING SCREENSHOT)
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Tab 1: Auto-Refill */}
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`p-4 sm:p-4.5 rounded-2xl border transition-all text-left flex items-start space-x-3.5 ${
            activeTab === 'subscriptions'
              ? 'bg-[#0c1523] text-white border-[#0c1523] shadow-md'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${
            activeTab === 'subscriptions' ? 'bg-white/10 text-amber-400' : 'bg-orange-50 text-orange-600'
          }`}>
            <RotateCw className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-xs sm:text-sm truncate">
              Auto-Refill ({subscriptions.length})
            </h4>
            <p className={`text-[11px] truncate mt-0.5 font-medium ${
              activeTab === 'subscriptions' ? 'text-slate-300' : 'text-slate-500'
            }`}>
              Manage subscriptions
            </p>
          </div>
        </button>

        {/* Tab 2: Grain Loyalty Coins */}
        <button
          onClick={() => setActiveTab('coins')}
          className={`p-4 sm:p-4.5 rounded-2xl border transition-all text-left flex items-start space-x-3.5 ${
            activeTab === 'coins'
              ? 'bg-[#0c1523] text-white border-[#0c1523] shadow-md'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${
            activeTab === 'coins' ? 'bg-white/10 text-amber-400' : 'bg-amber-50 text-amber-700'
          }`}>
            <Wheat className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-xs sm:text-sm truncate">
              Grain Loyalty Coins
            </h4>
            <p className={`text-[11px] truncate mt-0.5 font-medium ${
              activeTab === 'coins' ? 'text-slate-300' : 'text-slate-500'
            }`}>
              Earn &amp; redeem coins
            </p>
          </div>
        </button>

        {/* Tab 3: Saved Addresses */}
        <button
          onClick={() => setActiveTab('addresses')}
          className={`p-4 sm:p-4.5 rounded-2xl border transition-all text-left flex items-start space-x-3.5 ${
            activeTab === 'addresses'
              ? 'bg-[#0c1523] text-white border-[#0c1523] shadow-md'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${
            activeTab === 'addresses' ? 'bg-white/10 text-amber-400' : 'bg-orange-50 text-orange-600'
          }`}>
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-xs sm:text-sm truncate">
              Saved Addresses ({savedAddresses.length})
            </h4>
            <p className={`text-[11px] truncate mt-0.5 font-medium ${
              activeTab === 'addresses' ? 'text-slate-300' : 'text-slate-500'
            }`}>
              Manage delivery locations
            </p>
          </div>
        </button>

        {/* Tab 4: Saved Favorites */}
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`p-4 sm:p-4.5 rounded-2xl border transition-all text-left flex items-start space-x-3.5 ${
            activeTab === 'wishlist'
              ? 'bg-[#0c1523] text-white border-[#0c1523] shadow-md'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${
            activeTab === 'wishlist' ? 'bg-white/10 text-amber-400' : 'bg-rose-50 text-rose-600'
          }`}>
            <Heart className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-xs sm:text-sm truncate">
              Saved Favorites ({wishlistedProducts.length})
            </h4>
            <p className={`text-[11px] truncate mt-0.5 font-medium ${
              activeTab === 'wishlist' ? 'text-slate-300' : 'text-slate-500'
            }`}>
              Your preferred products
            </p>
          </div>
        </button>
      </div>

      {/* ========================================================
          3. TAB CONTENT
          ======================================================== */}
      <div>
        {/* TAB 0: SUBSCRIPTIONS (MATCHING SCREENSHOT) */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Header with Orange Accent Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-1.5 h-6 bg-[#ea580c] rounded-full" />
                  <h3 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                    Active Monthly Atta Subscriptions
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 pl-4">
                  Fresh cold-milled flour dispatched on automated schedule with VIP 15% discount.
                </p>
              </div>

              <button
                onClick={onNavigateToShop}
                className="px-5 py-2.5 rounded-2xl bg-[#ea580c] hover:bg-[#d94e07] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center space-x-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Staple</span>
              </button>
            </div>

            {/* 2 Wide Subscription Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className={`p-6 rounded-3xl border transition-all shadow-sm space-y-5 relative overflow-hidden ${
                    sub.status === 'active'
                      ? 'bg-white border-slate-200/90 hover:border-amber-400 hover:shadow-md'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  {/* "Most Popular" Ribbon on Top Right */}
                  {sub.isPopular && (
                    <div className="absolute top-0 right-0 bg-[#ea580c] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-2xl shadow-xs flex items-center space-x-1">
                      <Crown className="w-3 h-3 text-amber-200" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  {/* Product Details Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      {/* Product Thumbnail */}
                      <div className="w-16 h-20 rounded-2xl bg-slate-50 border border-slate-100 p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={sub.image}
                          alt={sub.productName}
                          className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                        />
                      </div>

                      <div>
                        {/* Status & Discount Badges */}
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            sub.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-200 text-slate-700 border-slate-300'
                          }`}>
                            <RotateCw className="w-3 h-3 text-emerald-600" />
                            <span>{sub.status === 'active' ? 'Active Auto-Refill' : 'Paused'}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[10px] font-black text-orange-700">
                            15% VIP OFF
                          </span>
                        </div>

                        <h4 className="font-black text-slate-950 text-base sm:text-lg mt-1.5 line-clamp-1">
                          {sub.productName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {sub.size}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right pt-2">
                      <span className="font-black text-2xl sm:text-3xl text-slate-950">
                        ₹{sub.price}
                      </span>
                      <span className="text-xs text-slate-400 block line-through font-semibold">
                        ₹{sub.mrp}
                      </span>
                    </div>
                  </div>

                  {/* Frequency & Next Dispatch Bar */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-medium gap-2">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>Next Milling Dispatch:</span>
                      <strong className="text-slate-950 font-bold">{sub.nextDispatch}</strong>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-600 font-bold self-end sm:self-auto">
                      <RotateCw className="w-3.5 h-3.5 text-orange-600" />
                      <span>Every {sub.frequency} Days</span>
                    </div>
                  </div>

                  {/* 3 Action Pill Buttons */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold pt-1">
                    <button
                      onClick={() => handleSkipNext(sub.id)}
                      className="px-2 sm:px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center justify-center space-x-1 text-center shadow-2xs"
                    >
                      <SkipForward className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">Skip Next Delivery</span>
                    </button>

                    <button
                      onClick={() => handleEditSubscription(sub.productName)}
                      className="px-2 sm:px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center justify-center space-x-1 text-center shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">Edit Subscription</span>
                    </button>

                    <button
                      onClick={() => handleToggleSubscription(sub.id)}
                      className={`px-2 sm:px-3 py-2 rounded-xl border transition-all flex items-center justify-center space-x-1 text-center shadow-2xs ${
                        sub.status === 'active'
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600'
                      }`}
                    >
                      {sub.status === 'active' ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-slate-500" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-white" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: COINS */}
        {activeTab === 'coins' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Available Clear Coins</span>
                <span className="text-3xl font-black text-orange-600">{availableCoins}</span>
                <p className="text-xs text-slate-500 font-medium">Redeemable at checkout on any fresh stoneground flour order</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Earning Rate</span>
                <span className="text-3xl font-black text-emerald-700">5% Cashback</span>
                <p className="text-xs text-slate-500 font-medium">Earn 1 Clear Coin for every ₹20 spent on wholesome grains</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Member Privilege</span>
                <span className="text-3xl font-black text-slate-900">Complimentary Harvests</span>
                <p className="text-xs text-slate-500 font-medium">Free 250g seasonal test flours with every quarterly delivery</p>
              </div>
            </div>

            {/* Ledger (Real Orders) */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recent Clear Coin Ledger</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {orders.length === 0 ? (
                  <p className="py-4 text-slate-500">No coin transactions yet. Place an order to earn 1 ClearCoin per ₹20 spent!</p>
                ) : (
                  orders.slice(0, 10).map((ord) => {
                    const earned = ord.coinsEarned ?? Math.floor(ord.total / 20);
                    const used = ord.coinsUsed ?? 0;
                    return (
                      <React.Fragment key={ord.id}>
                        {earned > 0 && ord.orderStatus !== 'cancelled' && (
                          <div className="py-3 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-900 block">Order #{ord.orderNumber} Fresh Milling Reward</span>
                              <span className="text-[11px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className="font-black text-emerald-700 text-sm">+{earned} Coins</span>
                          </div>
                        )}
                        {used > 0 && (
                          <div className="py-3 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-900 block">Redeemed on Order #{ord.orderNumber}</span>
                              <span className="text-[11px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className="font-black text-rose-600 text-sm">-{used} Coins</span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-slate-950 text-sm sm:text-base">{addr.fullName}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase border border-slate-200">
                        {addr.type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {addr.street}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-xs text-slate-800 font-bold mt-2 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-orange-600" />
                      <span>{addr.phone}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedAddress(addr)}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      {addr.isDefault ? 'Default Delivery Address' : 'Set as Default'}
                    </button>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-950">Your Saved Favorites</h3>
                <p className="text-xs text-slate-500 font-medium">Keep track of your preferred cold-milled stoneground flours</p>
              </div>

              {wishlistedProducts.length > 0 && (
                <button
                  onClick={moveAllWishlistToCart}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all"
                >
                  Move All to Basket
                </button>
              )}
            </div>

            {wishlistedProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Your Wishlist is Empty</h4>
                <p className="text-xs text-slate-500">Save your favorite stoneground attas to quickly access and buy them later.</p>
                <button
                  onClick={onNavigateToShop}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 text-slate-950 font-black text-xs shadow-2xs hover:bg-orange-400 transition-all"
                >
                  Explore Superstore
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistedProducts.map((prod) => (
                  <ProductCard3D
                    key={prod.id}
                    product={prod}
                    onNavigateToDetail={() => onSelectProduct(prod.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          4. BOTTOM TRUST BENEFITS STRIP (4 BADGES MATCHING SCREENSHOT)
          ======================================================== */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-50/60 via-white to-orange-50/60 border border-orange-200/70 p-5 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Benefit 1 */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-100/80 border border-orange-200 flex items-center justify-center text-orange-700 shrink-0 shadow-2xs">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs sm:text-sm text-slate-950 truncate">
                Flexible Delivery
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Skip, pause or reschedule anytime
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
              <Coins className="w-6 h-6 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs sm:text-sm text-slate-950 truncate">
                Earn Grain Coins
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Get rewards on every order
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-100/80 border border-orange-200 flex items-center justify-center text-orange-700 shrink-0 shadow-2xs">
              <Percent className="w-6 h-6 text-orange-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs sm:text-sm text-slate-950 truncate">
                VIP Subscriber Benefits
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Extra 15% off on auto-refill
              </p>
            </div>
          </div>

          {/* Benefit 4 */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
              <Headphones className="w-6 h-6 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs sm:text-sm text-slate-950 truncate">
                Priority Support
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Quick and dedicated assistance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <h3 className="font-black text-slate-950 text-lg">Add New Delivery Location</h3>
            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Full Name *"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                required
              />
              <input
                type="tel"
                placeholder="10-Digit Phone Number *"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                required
              />
              <input
                type="text"
                placeholder="Street Address, House / Flat No. *"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City (Default: Lucknow)"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Pincode (Default: 226010)"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ea580c] hover:bg-[#d94e07] text-white font-bold shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
