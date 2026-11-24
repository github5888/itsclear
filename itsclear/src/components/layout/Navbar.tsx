import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { BrandName } from '../common/BrandName';
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Menu,
  X,
  SlidersHorizontal,
  LogOut,
  Truck,
  Zap,
  Coins,
  Package,
  Home,
  BookOpen,
  Wheat,
  Droplets,
  Flame,
  LayoutGrid,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSearch?: (query: string) => void;
  onSelectProduct?: (productId: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onSearch,
  onSelectProduct,
  onSelectCategory
}) => {
  const {
    products,
    cartItemCount,
    wishlist,
    setIsCartDrawerOpen,
    user,
    isAuthenticated,
    isAdminAuthenticated,
    currentUser,
    openAuthModal,
    logout
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const shopMenuRef = useRef<HTMLDivElement>(null);

  // Close shop dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target as Node)) {
        setShopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const matchingProducts = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.subTitle && p.subTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    setCurrentTab('shop');
    setShowSearchResults(false);
  };

  const shopCategories = [
    { id: 'all', label: 'All Products', desc: 'Browse complete natural food catalog', icon: LayoutGrid },
    { id: 'atta', label: 'Premium Atta', desc: 'Khapli, Sharbati & 36% Protein flour', icon: Wheat },
    { id: 'oil', label: 'Mustard Oil', desc: 'Cold-pressed authentic Sarson Ka Tel', icon: Droplets },
    { id: 'ghee', label: 'Desi Ghee', desc: 'Traditional Bilona curd-churned golden ghee', icon: Flame },
    { id: 'combos', label: 'Combo Packs', desc: 'Curated staple pairings & family packs', icon: Package }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setShopMenuOpen(false);
    setMobileMenuOpen(false);
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    } else {
      setCurrentTab('shop');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#0c1523] text-slate-200 px-3 py-1.5 text-[11px] sm:text-xs font-medium border-b border-slate-800">
        <div className="w-full px-2 sm:px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-3.5 h-3.5 text-amber-500" />
            <span>Fresh Cold Delivery in <strong>Lucknow</strong> • Free Shipping ≥ ₹499</span>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-slate-300">
            <span className="text-slate-700">|</span>
            <Droplets className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Pure, Cold-Processed &amp; Unadulterated</span>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-amber-400 font-bold">
            <span className="text-slate-700">|</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Use code <strong>CLEAR50</strong> for 10% OFF</span>
          </div>
        </div>
      </div>

      <div className="w-full px-3 sm:px-6 lg:px-6 xl:px-10 2xl:px-16">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3 lg:gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setCurrentTab('home')}
            className="flex items-center cursor-pointer select-none group shrink-0 py-1"
          >
            <BrandName size="md" theme="dark" />
          </div>

          {/* Desktop Search Bar with Live Suggestions Dropdown */}
          <div className="hidden md:block relative w-48 lg:w-60 xl:w-72 2xl:w-80 shrink">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchResults(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                  if (onSearch) onSearch(e.target.value);
                }}
                placeholder="Search Atta, Mustard Oil, Ghee..."
                className="w-full bg-slate-100/90 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs lg:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
            </form>

            {/* Live Autocomplete Suggestions Dropdown */}
            {showSearchResults && matchingProducts.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 divide-y divide-slate-100"
                onMouseLeave={() => setShowSearchResults(false)}
              >
                <div className="p-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Suggested Products ({matchingProducts.length})</span>
                  <button
                    onClick={() => setShowSearchResults(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>
                {matchingProducts.map((p) => (
                  <div
                    key={'search-' + p.id}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(p.id);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="p-3 flex items-center space-x-3 hover:bg-orange-50/70 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-12 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      {p.images && p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {p.subTitle || p.tagline}
                      </p>
                    </div>
                    <span className="text-xs font-black text-slate-950 shrink-0">
                      ₹{p.variants[0]?.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links: Home | Shop All ⌄ | Our Story | Grain Club | Orders */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 shrink-0">
            {/* 1. Home */}
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                currentTab === 'home'
                  ? 'bg-amber-50/90 text-amber-900 border border-amber-200/90 shadow-2xs font-black'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Home className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${currentTab === 'home' ? 'text-amber-600' : 'text-slate-500'}`} />
              <span>Home</span>
            </button>

            {/* 2. Shop All (Dropdown Mega Menu) */}
            <div
              ref={shopMenuRef}
              className="relative"
              onMouseEnter={() => setShopMenuOpen(true)}
            >
              <button
                onClick={() => setCurrentTab('shop')}
                className={`px-3 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                  currentTab === 'shop'
                    ? 'bg-amber-50/90 text-amber-900 border border-amber-200/90 shadow-2xs font-black'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <LayoutGrid className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${currentTab === 'shop' ? 'text-amber-600' : 'text-slate-500'}`} />
                <span>Shop All</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${shopMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {shopMenuOpen && (
                <div
                  onMouseLeave={() => setShopMenuOpen(false)}
                  className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {shopCategories.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className="w-full p-2.5 rounded-xl hover:bg-orange-50/70 text-left transition-colors flex items-start space-x-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-100/60 text-orange-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          <CatIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                            {cat.label}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            {cat.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Our Story */}
            <button
              onClick={() => setCurrentTab('our-story')}
              className={`px-3 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                currentTab === 'our-story'
                  ? 'bg-amber-50/90 text-amber-900 border border-amber-200/90 shadow-2xs font-black'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${currentTab === 'our-story' ? 'text-amber-600' : 'text-slate-500'}`} />
              <span>Our Story</span>
            </button>

            {/* 4. Grain Club */}
            <button
              onClick={() => setCurrentTab('profile')}
              className={`px-3 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                currentTab === 'profile'
                  ? 'bg-amber-50/90 text-amber-900 border border-amber-200/90 shadow-2xs font-black'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Coins className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${currentTab === 'profile' ? 'text-amber-600' : 'text-slate-500'}`} />
              <span>Grain Club</span>
            </button>

            {/* 5. Orders */}
            <button
              onClick={() => setCurrentTab('orders')}
              className={`px-3 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                currentTab === 'orders'
                  ? 'bg-amber-50/90 text-amber-900 border border-amber-200/90 shadow-2xs font-black'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Package className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${currentTab === 'orders' ? 'text-amber-600' : 'text-slate-500'}`} />
              <span>Orders</span>
            </button>
          </nav>

          {/* Right Action Icons: Search | Wishlist | Sign In / Account | Basket */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Mobile Search Quick Trigger */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Customer Authentication State Pill */}
            {!isAuthenticated ? (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center space-x-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentTab('profile')}
                  className="flex items-center space-x-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-bold hover:bg-amber-100 transition-all shadow-2xs"
                  title="My Profile & Coins"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="truncate max-w-[60px] sm:max-w-[100px] font-extrabold">
                    {currentUser?.name || user.name}
                  </span>
                  <span className="text-[11px] text-amber-950 bg-amber-200 px-1.5 py-0.5 rounded-lg font-black hidden xl:inline-flex items-center space-x-1">
                    <Coins className="w-3 h-3 text-amber-700 inline" />
                    <span>{currentUser?.clearCoins || user.clearCoins}</span>
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}

            {/* Admin Portal Button - Hidden from public; only visible for authenticated admin */}
            {(isAdminAuthenticated || currentTab.startsWith('admin')) && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                  currentTab.startsWith('admin')
                    ? 'bg-slate-950 text-amber-400 border-slate-800 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Admin Portal"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xl:inline">Admin</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => setCurrentTab('wishlist')}
              className="hidden sm:flex relative p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-rose-500 hover:border-slate-300 transition-all shadow-2xs"
              title="Saved Items"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Basket Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center space-x-1.5 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Basket</span>
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                {cartItemCount}
              </span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              placeholder="Search Atta, Mustard Oil, Ghee..."
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Primary Nav Links */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center space-x-2"
            >
              <Home className="w-4 h-4 text-amber-600" />
              <span>Home</span>
            </button>
            <button
              onClick={() => { setCurrentTab('shop'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center space-x-2"
            >
              <LayoutGrid className="w-4 h-4 text-orange-600" />
              <span>Shop All</span>
            </button>
            <button
              onClick={() => { setCurrentTab('our-story'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Our Story</span>
            </button>
            <button
              onClick={() => { setCurrentTab('profile'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center space-x-2"
            >
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Grain Club</span>
            </button>
            <button
              onClick={() => { setCurrentTab('orders'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center space-x-2 col-span-2"
            >
              <Package className="w-4 h-4 text-slate-700" />
              <span>Order History &amp; Tracking</span>
            </button>
          </div>

          {/* Shop Categories Quick Links in Mobile */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Shop Categories
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {shopCategories.filter(c => c.id !== 'all').map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="p-2 rounded-lg bg-orange-50/50 hover:bg-orange-100/60 text-[11px] font-bold text-slate-800 text-left transition-colors flex items-center space-x-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
