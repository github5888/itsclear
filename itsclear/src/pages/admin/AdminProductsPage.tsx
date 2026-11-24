import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory, ProductVariant } from '../../types';
import { Product3DCanvas } from '../../components/three/Product3DCanvas';
import { api } from '../../services/api';
import {
  Plus,
  Trash2,
  Package,
  Eye,
  Sliders,
  Sparkles,
  Wheat,
  Droplets,
  Flame,
  CheckCircle2,
  Award,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Layers
} from 'lucide-react';

interface AdminProductsPageProps {
  onBackToDashboard: () => void;
  onSelectProduct: (productId: string) => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({
  onBackToDashboard,
  onSelectProduct
}) => {
  const { products, addProduct, updateProduct, deleteProduct, notify } = useStore();

  const [showAddForm, setShowAddForm] = useState(false);

  // New Product Form State
  const [name, setName] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('atta');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('Madhya Pradesh & Rajasthan');
  const [harvestSeason, setHarvestSeason] = useState('Harvest 2026');
  const [labBatch, setLabBatch] = useState('CLR-' + Math.floor(1000 + Math.random() * 9000));
  const [themeColor, setThemeColor] = useState('#d97706');
  const [modelType, setModelType] = useState<Product['modelType']>('atta-sack');
  const [productImage, setProductImage] = useState<string>('/images/products/khapli-single.jpg');
  const [isFeatured, setIsFeatured] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState(false);

  // Category Specific Specs
  const [extractionMethod, setExtractionMethod] = useState('Cold-Pressed Kachi Ghani (Wooden Kohlu)');
  const [seedVariety, setSeedVariety] = useState('Grade-1 Natural Mustard Seeds');
  const [churningMethod, setChurningMethod] = useState('Traditional Bilona Hand-Churned Curd Method');
  const [gheeTexture, setGheeTexture] = useState('Golden Danedaar (Granular)');
  const [storageInstructions, setStorageInstructions] = useState('Store in a cool dry place, away from sunlight');
  const [smokePoint, setSmokePoint] = useState('High Smoke Point 250°C');
  const [comboItemsStr, setComboItemsStr] = useState('5kg Khapli Wheat Atta, 1L Cold Pressed Mustard Oil');
  const [flourType, setFlourType] = useState('100% Stoneground Whole Wheat');
  const [millingSpeed, setMillingSpeed] = useState('Cold Stone Milled < 28°C');

  // Variant State
  const [varSize, setVarSize] = useState('5 kg Bag');
  const [varPrice, setVarPrice] = useState(440);
  const [varOriginal, setVarOriginal] = useState(520);
  const [varStock, setVarStock] = useState(100);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await api.uploadImage(file);
      if (res && res.url) {
        setProductImage(res.url);
        notify('Image Uploaded', 'Product photo saved successfully.', 'success');
      }
    } catch (err: any) {
      const localUrl = URL.createObjectURL(file);
      setProductImage(localUrl);
      notify('Photo Selected', 'Local image preview loaded.', 'info');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCategoryChange = (cat: ProductCategory) => {
    setCategory(cat);
    if (cat === 'oil') {
      setModelType('oil-bottle');
      setThemeColor('#ea580c');
      setVarSize('1 Litre Bottle');
      setVarPrice(240);
      setVarOriginal(280);
      setOrigin('Bharatpur & Alwar, Rajasthan');
      setProductImage('/images/products/protein-single.jpg');
    } else if (cat === 'ghee') {
      setModelType('ghee-jar');
      setThemeColor('#d97706');
      setVarSize('500g Glass Jar');
      setVarPrice(680);
      setVarOriginal(750);
      setOrigin('Malwa & Saurashtra');
      setProductImage('/images/products/khapli-sizes-badges.jpg');
    } else if (cat === 'combos' || cat === 'combo') {
      setModelType('atta-eco-box');
      setThemeColor('#0c1523');
      setVarSize('Family Kitchen Combo');
      setVarPrice(899);
      setVarOriginal(1080);
      setOrigin('Direct Farm Hub, Lucknow');
      setProductImage('/images/products/khapli-sizes-grid.jpg');
    } else {
      setModelType('atta-kraft');
      setThemeColor('#d97706');
      setVarSize('5 kg (Bori)');
      setVarPrice(440);
      setVarOriginal(520);
      setOrigin('Solapur & Sangli, Maharashtra');
      setProductImage('/images/products/khapli-single.jpg');
    }
  };

  const previewProduct: Product = {
    id: 'preview-prod',
    name: name || 'ItsClear Pure Staple',
    subTitle: subTitle || 'Natural Everyday Essential',
    category,
    tagline: tagline || '100% Cold-Processed • Zero Adulteration • Direct From Farm',
    description: description || 'Thoughtfully sourced and traditionally cold-processed to preserve essential natural nutrition.',
    origin,
    harvestSeason,
    labTestBatch: labBatch,
    purityScore: 100,
    featured: isFeatured,
    isActive,
    rating: 5.0,
    reviewCount: 0,
    images: productImage ? [productImage] : ['/images/products/khapli-single.jpg'],
    modelType,
    themeColor,
    secondaryColor: '#1e293b',
    flourType,
    millingSpeed,
    extractionMethod,
    seedVariety,
    churningMethod,
    gheeTexture,
    storageInstructions,
    smokePoint,
    comboItems: comboItemsStr.split(',').map(s => s.trim()).filter(Boolean),
    rotiSoftnessScore: 10,
    variants: [
      {
        id: 'var-preview',
        size: varSize,
        weightInKg: 5,
        price: varPrice,
        originalPrice: varOriginal,
        inStock: true,
        stockCount: varStock
      }
    ],
    nutrition: {
      energy: '380 kcal',
      protein: '14.0g',
      carbs: '65.0g',
      fat: '4.0g'
    },
    benefits: ['100% Traditional Cold Processing', 'Zero Synthetic Additives or Adulterants', 'Direct Farmer Traceability'],
    certifications: ['NABL Partner Lab Certified', 'FSSAI Approved']
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notify('Missing Name', 'Please provide a product title.', 'warning');
      return;
    }

    const newProd: Product = {
      ...previewProduct,
      id: 'itsclear-' + (category || 'food') + '-' + Date.now().toString(36),
      variants: [
        {
          id: 'var-' + Date.now().toString(36),
          size: varSize,
          weightInKg: varSize.includes('10') ? 10 : varSize.includes('5') ? 5 : varSize.includes('2') ? 2 : 1,
          price: Number(varPrice),
          originalPrice: Number(varOriginal),
          inStock: true,
          stockCount: Number(varStock)
        }
      ]
    };

    try {
      await addProduct(newProd);
      setShowAddForm(false);
      setName('');
      setSubTitle('');
      setTagline('');
      setDescription('');
      notify('Product Created', `${newProd.name} published to store.`, 'success');
    } catch (err: any) {
      notify('Error', err.message || 'Failed to create product', 'error');
    }
  };

  const toggleProductActive = async (prod: Product) => {
    const updatedStatus = prod.isActive === false ? true : false;
    try {
      await updateProduct({ ...prod, isActive: updatedStatus });
      notify('Status Updated', `${prod.name} is now ${updatedStatus ? 'Active' : 'Inactive'}.`, 'info');
    } catch (err: any) {
      notify('Update Error', err.message || 'Failed to update status', 'error');
    }
  };

  const toggleProductFeatured = async (prod: Product) => {
    try {
      await updateProduct({ ...prod, featured: !prod.featured });
      notify('Featured Updated', `${prod.name} featured state updated.`, 'info');
    } catch (err: any) {
      notify('Update Error', err.message || 'Failed to update featured', 'error');
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors mb-2 block"
          >
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Its<span className="text-[#ea580c]">Clear</span>™ Natural Food Product Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-category inventory: Premium Atta, Mustard Oil, Desi Ghee &amp; Combos ({products.length} products total)
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#0c1523] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all self-start active:scale-95"
        >
          <Plus className="w-4 h-4 text-orange-400" />
          <span>{showAddForm ? 'Close Add Form' : 'Add New Product'}</span>
        </button>
      </div>

      {/* ADD NEW PRODUCT FORM */}
      {showAddForm && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-amber-500/30 space-y-6 shadow-xl">
          <div className="flex items-center space-x-2 text-orange-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Multi-Category Product Creator</span>
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-2">
                1. Select Food Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'atta', label: 'Premium Atta', icon: Wheat, desc: 'Stoneground Chakki Flours' },
                  { id: 'oil', label: 'Mustard Oil', icon: Droplets, desc: 'Cold-Pressed Sarson Ka Tel' },
                  { id: 'ghee', label: 'Desi Ghee', icon: Flame, desc: 'Bilona Curd Churned' },
                  { id: 'combos', label: 'Combo Packs', icon: Package, desc: 'Curated Kitchen Bundles' }
                ].map((c) => {
                  const CatIcon = c.icon;
                  const isSelected = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCategoryChange(c.id as any)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-[#0c1523] text-white border-slate-900 shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <CatIcon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-orange-400' : 'text-slate-600'}`} />
                      <div className="text-xs font-black">{c.label}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {c.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={category === 'oil' ? 'e.g. ItsClear Kachi Ghani Mustard Oil' : category === 'ghee' ? 'e.g. ItsClear Bilona Desi Ghee' : 'e.g. ItsClear Khapli Wheat Atta'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtitle / Quality Tag
                </label>
                <input
                  type="text"
                  placeholder={category === 'oil' ? '100% Cold-Pressed • Natural Pungency' : category === 'ghee' ? 'Hand Churned • Golden Danedaar' : '100% Ancient Emmer • Low GI'}
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Category-Specific Specifications */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-900 block uppercase tracking-wider">
                Category-Specific Attributes ({category.toUpperCase()})
              </span>

              {category === 'oil' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Extraction Method</label>
                    <input
                      type="text"
                      value={extractionMethod}
                      onChange={(e) => setExtractionMethod(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Seed Variety</label>
                    <input
                      type="text"
                      value={seedVariety}
                      onChange={(e) => setSeedVariety(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Smoke Point</label>
                    <input
                      type="text"
                      value={smokePoint}
                      onChange={(e) => setSmokePoint(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              ) : category === 'ghee' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Churning Method</label>
                    <input
                      type="text"
                      value={churningMethod}
                      onChange={(e) => setChurningMethod(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Ghee Texture</label>
                    <input
                      type="text"
                      value={gheeTexture}
                      onChange={(e) => setGheeTexture(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Storage Instructions</label>
                    <input
                      type="text"
                      value={storageInstructions}
                      onChange={(e) => setStorageInstructions(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              ) : category === 'combos' || category === 'combo' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Bundled Items (Comma Separated)</label>
                  <input
                    type="text"
                    value={comboItemsStr}
                    onChange={(e) => setComboItemsStr(e.target.value)}
                    placeholder="e.g. 5kg Khapli Wheat Atta, 1L Cold-Pressed Mustard Oil"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Milling Speed</label>
                    <input
                      type="text"
                      value={millingSpeed}
                      onChange={(e) => setMillingSpeed(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Flour Type</label>
                    <input
                      type="text"
                      value={flourType}
                      onChange={(e) => setFlourType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Initial Variant & Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Pack Size Label *</label>
                <input
                  type="text"
                  required
                  value={varSize}
                  onChange={(e) => setVarSize(e.target.value)}
                  placeholder="e.g. 1 Litre / 5 kg / 500g"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={varPrice}
                  onChange={(e) => setVarPrice(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  value={varOriginal}
                  onChange={(e) => setVarOriginal(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Stock Units</label>
                <input
                  type="number"
                  value={varStock}
                  onChange={(e) => setVarStock(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Image & Origin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Photo URL or Upload</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={productImage}
                    onChange={(e) => setProductImage(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer border border-slate-200">
                    Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Farm Origin</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="flex items-center space-x-6 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 accent-orange-600"
                />
                <span>Featured on Homepage</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span>Active in Store (Customers can buy)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm shadow-md transition-all active:scale-95"
            >
              Publish Natural Food Product to Store
            </button>
          </form>
        </div>
      )}

      {/* Existing Products Inventory Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Published Catalog Inventory
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {products.length} Items Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price Range</th>
                <th className="p-3">Total Stock</th>
                <th className="p-3">Featured</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const totalStock = p.variants ? p.variants.reduce((acc, v) => acc + (v.stockCount || 0), 0) : 0;
                const lowestPrice = p.variants && p.variants.length > 0 ? Math.min(...p.variants.map(v => v.price)) : 0;
                const activeState = p.isActive !== false;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                        {p.category === 'oil' ? (
                          <Droplets className="w-4 h-4 text-orange-600" />
                        ) : p.category === 'ghee' ? (
                          <Flame className="w-4 h-4 text-amber-600" />
                        ) : p.category === 'combos' || p.category === 'combo' ? (
                          <Package className="w-4 h-4 text-slate-700" />
                        ) : (
                          <Wheat className="w-4 h-4 text-amber-700" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-[10px] text-slate-500">{p.origin}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                        {p.category}
                      </span>
                    </td>

                    <td className="p-3 font-bold text-slate-900">
                      ₹{lowestPrice}
                    </td>

                    <td className="p-3 font-bold">
                      <span className={totalStock < 30 ? 'text-rose-600' : 'text-emerald-700'}>
                        {totalStock} units
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => toggleProductFeatured(p)}
                        className={`text-xs font-bold transition-colors ${
                          p.featured ? 'text-amber-600 font-black' : 'text-slate-400'
                        }`}
                      >
                        {p.featured ? '★ Featured' : '☆ Standard'}
                      </button>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => toggleProductActive(p)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                          activeState
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {activeState ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="p-3 text-right space-x-1.5">
                      <button
                        onClick={() => onSelectProduct(p.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                        title="View Live Product"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
