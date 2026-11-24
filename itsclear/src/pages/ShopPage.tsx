import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard3D } from '../components/shop/ProductCard3D';
import {
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  Menu,
  Clock,
  Home,
  Check,
  RotateCcw,
  Sparkles,
  Wheat,
  Droplets,
  Flame,
  Package
} from 'lucide-react';

interface ShopPageProps {
  onSelectProduct: (productId: string) => void;
  initialSearchQuery?: string;
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
  onBackToHome?: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  onSelectProduct,
  initialSearchQuery = '',
  initialCategory = 'all',
  onCategoryChange,
  onBackToHome
}) => {
  const { products } = useStore();

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (onCategoryChange) onCategoryChange(catId);
  };

  // Sidebar Filter States
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1200);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Collapsible accordion states
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [packSizeOpen, setPackSizeOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);
  const [badgesOpen, setBadgesOpen] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Products', icon: LayoutGrid },
    { id: 'atta', label: 'Premium Atta', icon: Wheat },
    { id: 'oil', label: 'Mustard Oil', icon: Droplets },
    { id: 'ghee', label: 'Desi Ghee', icon: Flame },
    { id: 'combos', label: 'Combo Packs', icon: Package }
  ];

  const packSizeOptions = [
    { id: '1 kg', label: '1 kg' },
    { id: '2 kg', label: '2 kg' },
    { id: '5 kg', label: '5 kg' },
    { id: '10 kg', label: '10 kg' },
    { id: '500 ml', label: '500 ml' },
    { id: '1 L', label: '1 Litre' },
    { id: '5 L', label: '5 Litres' }
  ];

  const dietaryTags = [
    'Cold-stone Milled',
    'Cold-Pressed',
    'Bilona Curd Churned',
    '100% Whole Grain',
    'Low GI',
    'Zero Maida',
    'Chemical-Free'
  ];

  const toggleSize = (sizeId: string) => {
    setSelectedSizes(prev =>
      prev.includes(sizeId) ? prev.filter(s => s !== sizeId) : [...prev, sizeId]
    );
  };

  const toggleDietary = (tag: string) => {
    setSelectedDietary(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSizes([]);
    setMaxPrice(1200);
    setInStockOnly(false);
    setSelectedDietary([]);
    setSearchQuery('');
    setSortBy('popular');
    if (onCategoryChange) onCategoryChange('all');
  };

  // Filter products logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSub = p.subTitle ? p.subTitle.toLowerCase().includes(q) : false;
        const matchesTag = p.tagline.toLowerCase().includes(q);
        if (!matchesName && !matchesSub && !matchesTag) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'atta') {
          const isAtta =
            p.category === 'atta' ||
            p.category === 'khapli' ||
            p.category === 'multigrain' ||
            p.category === 'sharbati' ||
            p.category === 'heritage';
          if (!isAtta) return false;
        } else if (selectedCategory === 'oil') {
          if (p.category !== 'oil') return false;
        } else if (selectedCategory === 'ghee') {
          if (p.category !== 'ghee') return false;
        } else if (selectedCategory === 'combos') {
          const isCombo = p.category === 'combos' || p.category === 'combo' || p.id.includes('pack');
          if (!isCombo) return false;
        }
      }

      // 3. Max Price Filter
      if (p.variants && p.variants.length > 0) {
        const hasVariantUnderPrice = p.variants.some((v) => v.price <= maxPrice);
        if (!hasVariantUnderPrice) return false;
      }

      // 4. Pack size filter
      if (selectedSizes.length > 0) {
        const hasMatchingSize = p.variants.some((v) =>
          selectedSizes.some((s) => v.size.toLowerCase().includes(s.toLowerCase()))
        );
        if (!hasMatchingSize) return false;
      }

      // 5. In stock only
      if (inStockOnly) {
        const inStock = p.variants.some((v) => v.inStock && v.stockCount > 0);
        if (!inStock) return false;
      }

      // 6. Dietary & health badges
      if (selectedDietary.length > 0) {
        const fullDesc = (p.benefits.join(' ') + ' ' + p.description + ' ' + (p.composition || '')).toLowerCase();
        const matchesTag = selectedDietary.some(tag => fullDesc.includes(tag.toLowerCase()));
        if (!matchesTag) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.variants[0].price - b.variants[0].price;
      }
      if (sortBy === 'price-high') {
        return b.variants[0].price - a.variants[0].price;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, maxPrice, selectedSizes, inStockOnly, selectedDietary, sortBy]);

  // Category Banner Dynamic Copy
  const categoryHeaderInfo = useMemo(() => {
    switch (selectedCategory) {
      case 'atta':
        return {
          title: 'Premium Atta',
          desc: '100% stoneground ancient Khapli, Sharbati, and 36% Protein flours milled below 28°C on traditional emery stones.'
        };
      case 'oil':
        return {
          title: 'Mustard Oil (Sarson Ka Tel)',
          desc: 'Authentic kachi ghani cold-pressed mustard oil, slowly extracted from Grade-1 mustard seeds without chemical solvents.'
        };
      case 'ghee':
        return {
          title: 'Traditional Desi Ghee',
          desc: 'Authentic Bilona curd-churned pure desi ghee. Simmered on low flame for golden, danedaar granular texture.'
        };
      case 'combos':
        return {
          title: 'Curated Combo Packs',
          desc: 'Thoughtfully paired household food staples for complete monthly kitchen nourishment and optimal value.'
        };
      default:
        return {
          title: 'All Natural Food Staples',
          desc: 'Explore our complete collection of cold-stoneground attas, cold-pressed mustard oil, and bilona desi ghee.'
        };
    }
  }, [selectedCategory]);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 space-y-6">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
        <button
          onClick={onBackToHome}
          className="hover:text-slate-900 flex items-center space-x-1 transition-colors"
        >
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>Home</span>
        </button>
        <span className="text-slate-400 font-light">&gt;</span>
        <button
          onClick={() => handleCategorySelect('all')}
          className="hover:text-slate-900 transition-colors"
        >
          Shop All
        </button>
        {selectedCategory !== 'all' && (
          <>
            <span className="text-slate-400 font-light">&gt;</span>
            <span className="text-slate-900 font-bold capitalize">
              {categories.find(c => c.id === selectedCategory)?.label || selectedCategory}
            </span>
          </>
        )}
      </nav>

      {/* 2. Top Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#fef5ea] via-[#fbf1e4] to-[#f6e7d2] border border-[#ecdac3] p-6 sm:p-8 lg:p-9 overflow-hidden shadow-xs">
        <div className="max-w-2xl relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
            {categoryHeaderInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium leading-relaxed">
            {categoryHeaderInfo.desc}
          </p>
        </div>

        {/* Ambient Product Art */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 max-w-[360px] pointer-events-none hidden sm:flex items-center justify-end pr-6">
          <img
            src="/images/products/khapli-single.jpg"
            alt="ItsClear Natural Food Staples"
            className="h-full object-cover rounded-2xl filter drop-shadow-md mix-blend-multiply opacity-80"
          />
        </div>
      </div>

      {/* Category Pills Bar (Horizontal fast-switcher) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => {
          const CatIcon = c.icon;
          const isActive = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => handleCategorySelect(c.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
                isActive
                  ? 'bg-[#0c1523] text-white shadow-sm font-black'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:text-slate-950'
              }`}
            >
              <CatIcon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Filters Toggle Button */}
      <div className="lg:hidden flex items-center justify-between pb-1">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
          <span>{mobileFilterOpen ? 'Hide Filters' : 'Show Filters & Refinements'}</span>
        </button>
        <span className="text-xs font-black text-slate-700">
          {filteredProducts.length} Products
        </span>
      </div>

      {/* 3. Main Content: Sidebar (Left 3 Cols) + Product Grid (Right 9 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className={`lg:col-span-3 space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6 sticky top-28">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-sm font-black text-slate-900">
                <SlidersHorizontal className="w-4 h-4 text-slate-800" />
                <span>Filters</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter Section */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center justify-between w-full text-xs sm:text-sm font-black text-slate-900 select-none"
              >
                <span>Category</span>
                {categoryOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {categoryOpen && (
                <div className="space-y-1.5 pt-1">
                  {categories.map((c) => {
                    const isSelected = selectedCategory === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleCategorySelect(c.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-orange-50 text-orange-950 border border-orange-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{c.label}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-orange-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Filter Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <button
                type="button"
                onClick={() => setPriceOpen(!priceOpen)}
                className="flex items-center justify-between w-full text-xs sm:text-sm font-black text-slate-900 select-none"
              >
                <span>Max Price: ₹{maxPrice}</span>
                {priceOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {priceOpen && (
                <div className="pt-1 space-y-2">
                  <input
                    type="range"
                    min="70"
                    max="1800"
                    step="25"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>₹70</span>
                    <span>₹1,800</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pack Size Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <button
                type="button"
                onClick={() => setPackSizeOpen(!packSizeOpen)}
                className="flex items-center justify-between w-full text-xs sm:text-sm font-black text-slate-900 select-none"
              >
                <span>Pack Size</span>
                {packSizeOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {packSizeOpen && (
                <div className="space-y-2 pt-1">
                  {packSizeOptions.map((opt) => {
                    const isChecked = selectedSizes.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        onClick={() => toggleSize(opt.id)}
                        className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-700 font-medium select-none group"
                      >
                        <span
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-slate-300 bg-white group-hover:border-orange-400'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <span className={isChecked ? 'font-bold text-slate-950' : 'text-slate-700'}>
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Availability Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <button
                type="button"
                onClick={() => setAvailabilityOpen(!availabilityOpen)}
                className="flex items-center justify-between w-full text-xs sm:text-sm font-black text-slate-900 select-none"
              >
                <span>Availability</span>
                {availabilityOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {availabilityOpen && (
                <div className="pt-1">
                  <label
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-700 font-medium select-none group"
                  >
                    <span
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        inStockOnly
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-slate-300 bg-white group-hover:border-orange-400'
                      }`}
                    >
                      {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <span className={inStockOnly ? 'font-bold text-slate-950' : 'text-slate-700'}>
                      In Stock Only
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Purity & Health Badges */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <button
                type="button"
                onClick={() => setBadgesOpen(!badgesOpen)}
                className="flex items-center justify-between w-full text-xs sm:text-sm font-black text-slate-900 select-none"
              >
                <span>Processing &amp; Purity</span>
                {badgesOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {badgesOpen && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dietaryTags.map((tag) => {
                    const isSelected = selectedDietary.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleDietary(tag)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-orange-100 text-orange-950 border-orange-300 font-black'
                            : 'bg-slate-100/80 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 24-Hour Freshness Guarantee Box */}
            <div className="p-4 rounded-2xl bg-[#fff8f1] border border-orange-200/80 text-xs text-slate-900 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-black text-slate-950">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>Zero Storage Warehousing</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                Dispatched directly from cold chakki and kohlus within 24 hours of packaging for authentic natural freshness.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Products Main Area (Max 3 Product Cards Per Row on Desktop) */}
        <main className="lg:col-span-9 space-y-5">
          {/* Top Bar: Products Count + Sort + Grid/List Controls */}
          <div className="flex items-center justify-between pb-1">
            <span className="font-black text-sm text-slate-900">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </span>

            <div className="flex items-center space-x-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 shadow-2xs">
                <span className="text-slate-500 font-medium">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="popular">Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === 'grid'
                      ? 'bg-orange-100 text-orange-600 shadow-2xs font-bold'
                      : 'border border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === 'list'
                      ? 'bg-orange-100 text-orange-600 shadow-2xs font-bold'
                      : 'border border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                  title="List View"
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid: MAXIMUM 3 CARDS PER ROW ON DESKTOP */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-950">
                Fresh Batch Arriving Soon
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {selectedCategory === 'oil'
                  ? 'Our single-origin cold-pressed mustard oil is currently being prepared in small traditional batches. Products will appear here once laboratory quality is certified.'
                  : selectedCategory === 'ghee'
                  ? 'Our traditional Bilona desi ghee is churned in small artisanal batches. Products will appear as soon as stock is updated.'
                  : 'No products matched your exact filter criteria. Try clearing selected filters or resetting price.'}
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-[#0c1523] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
              >
                View All Available Staples
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard3D
                  key={prod.id}
                  product={prod}
                  onNavigateToDetail={onSelectProduct}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
