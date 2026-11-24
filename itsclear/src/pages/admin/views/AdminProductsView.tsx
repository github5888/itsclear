import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { api } from '../../../services/api';
import { Product, ProductCategory, ProductVariant, Category, GalleryItem } from '../../../types';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Upload,
  Layers,
  Sparkles,
  Save,
  X,
  Boxes,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Tag,
  AlertTriangle,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Archive,
  ExternalLink,
  Globe,
  Sliders,
  DollarSign
} from 'lucide-react';

interface AdminProductsViewProps {
  onSelectProduct?: (productId: string) => void;
}

type ProductTab = 'general' | 'images' | 'variants' | 'inventory' | 'seo';

export const AdminProductsView: React.FC<AdminProductsViewProps> = ({ onSelectProduct }) => {
  const { products, addProduct, updateProduct, deleteProduct, notify } = useStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection for bulk actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Editor Modal
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductTab>('general');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Safe delete modal
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New variant in-progress form
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
    size: '',
    unit: 'kg',
    price: 0,
    originalPrice: 0,
    stockCount: 50,
    reservedStock: 0,
    lowStockThreshold: 15,
    sku: ''
  });

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleOpenCreate = () => {
    const defaultCat = categories[0]?.slug || 'atta';
    setEditingProduct({
      id: '',
      name: '',
      subTitle: '',
      category: defaultCat as ProductCategory,
      tagline: '',
      description: '',
      origin: 'Sehore, Madhya Pradesh',
      harvestSeason: 'Harvest 2026',
      labTestBatch: 'CLR-' + Math.floor(1000 + Math.random() * 9000),
      purityScore: 100,
      featured: true,
      status: 'published',
      rating: 5.0,
      reviewCount: 0,
      images: ['/images/products/khapli-single.jpg'],
      gallery: [
        {
          id: 'img-init-1',
          url: '/images/products/khapli-single.jpg',
          alt: 'Primary View',
          isPrimary: true,
          sortOrder: 0
        }
      ],
      modelType: 'atta-sack',
      themeColor: '#d97706',
      secondaryColor: '#0b192c',
      variants: [
        {
          id: 'var-1',
          sku: 'CLR-5KG',
          size: '5 kg Pack',
          unit: 'kg',
          price: 440,
          originalPrice: 520,
          stockCount: 100,
          reservedStock: 0,
          lowStockThreshold: 15,
          inStock: true
        }
      ],
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: ['itsclear', 'atta', 'chakki']
      },
      customAttributes: {}
    });
    setActiveTab('general');
    setIsDirty(false);
    setShowEditor(true);
  };

  const handleOpenEdit = (p: Product) => {
    // Ensure gallery is populated
    let gallery = p.gallery || [];
    if (gallery.length === 0 && p.images && p.images.length > 0) {
      gallery = p.images.map((url, idx) => ({
        id: `img-${idx}`,
        url,
        alt: `${p.name} - View ${idx + 1}`,
        isPrimary: idx === 0,
        sortOrder: idx
      }));
    }

    setEditingProduct({
      ...p,
      gallery,
      images: Array.isArray(p.images) ? [...p.images] : [],
      variants: Array.isArray(p.variants) ? [...p.variants] : [],
      customAttributes: p.customAttributes || {},
      status: p.status || 'published',
      seo: p.seo || {
        metaTitle: `${p.name} | itsclear`,
        metaDescription: p.tagline || p.subTitle || '',
        keywords: [p.category, 'pure', 'cold milled']
      }
    });
    setActiveTab('general');
    setIsDirty(false);
    setShowEditor(true);
  };

  // MULTI-IMAGE SIMULTANEOUS UPLOAD
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const fileList = Array.from(files);
      const res = await api.uploadMultipleImages(fileList);

      if (res && res.files) {
        const currentGallery = editingProduct?.gallery || [];
        const startSort = currentGallery.length;

        const newGalleryItems: GalleryItem[] = res.files.map((f, idx) => ({
          id: f.id || `img-${Date.now().toString(36)}-${idx}`,
          url: f.url,
          alt: f.alt || editingProduct?.name || 'Product Photo',
          isPrimary: currentGallery.length === 0 && idx === 0,
          sortOrder: startSort + idx
        }));

        const updatedGallery = [...currentGallery, ...newGalleryItems];
        const updatedImages = updatedGallery.map(g => g.url);

        setEditingProduct(prev => ({
          ...prev!,
          gallery: updatedGallery,
          images: updatedImages
        }));
        setIsDirty(true);
        notify('Images Uploaded', `${res.files.length} photo(s) added to gallery.`, 'success');
      }
    } catch (err: any) {
      notify('Upload Failed', err.message || 'Could not upload images.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    if (!editingProduct?.gallery) return;
    const updated = editingProduct.gallery.map((g, idx) => ({
      ...g,
      isPrimary: idx === index
    }));
    // Reorder so primary is first
    const primary = updated[index];
    const others = updated.filter((_, idx) => idx !== index);
    const sorted = [primary, ...others].map((item, idx) => ({ ...item, sortOrder: idx }));

    setEditingProduct(prev => ({
      ...prev!,
      gallery: sorted,
      images: sorted.map(s => s.url)
    }));
    setIsDirty(true);
    notify('Primary Cover Set', 'Primary image updated for store cards.', 'success');
  };

  const handleRemoveImage = (index: number) => {
    if (!editingProduct?.gallery) return;
    const updated = editingProduct.gallery.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some(g => g.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setEditingProduct(prev => ({
      ...prev!,
      gallery: updated,
      images: updated.map(u => u.url)
    }));
    setIsDirty(true);
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if (!editingProduct?.gallery) return;
    const newGallery = [...editingProduct.gallery];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newGallery.length) return;

    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIdx];
    newGallery[targetIdx] = temp;

    const renumbered = newGallery.map((g, idx) => ({ ...g, sortOrder: idx }));
    setEditingProduct(prev => ({
      ...prev!,
      gallery: renumbered,
      images: renumbered.map(g => g.url)
    }));
    setIsDirty(true);
  };

  // ADD VARIANT
  const handleAddVariant = () => {
    if (!newVariant.size || !newVariant.price) {
      notify('Incomplete Variant', 'Pack size and price are required.', 'error');
      return;
    }

    const cleanSize = (newVariant.size || '1 Unit').trim();
    const defaultSku = `CLR-${(editingProduct?.category || 'PROD').toUpperCase()}-${cleanSize.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`;

    const createdVariant: ProductVariant = {
      id: 'var-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
      size: cleanSize,
      unit: newVariant.unit || 'kg',
      price: Number(newVariant.price),
      originalPrice: Number(newVariant.originalPrice || newVariant.price),
      stockCount: Number(newVariant.stockCount || 50),
      reservedStock: 0,
      lowStockThreshold: Number(newVariant.lowStockThreshold || 15),
      inStock: Number(newVariant.stockCount || 50) > 0,
      sku: (newVariant.sku && newVariant.sku.trim() !== '') ? newVariant.sku.trim().toUpperCase() : defaultSku
    };

    setEditingProduct(prev => ({
      ...prev!,
      variants: [...(prev?.variants || []), createdVariant]
    }));
    setIsDirty(true);

    setNewVariant({
      size: '',
      unit: 'kg',
      price: 0,
      originalPrice: 0,
      stockCount: 50,
      reservedStock: 0,
      lowStockThreshold: 15,
      sku: ''
    });
    notify('Variant Added', `Added ${createdVariant.size} (₹${createdVariant.price})`, 'success');
  };

  const handleRemoveVariant = (variantId: string) => {
    setEditingProduct(prev => ({
      ...prev!,
      variants: prev?.variants?.filter(v => v.id !== variantId) || []
    }));
    setIsDirty(true);
  };

  // DUPLICATE PRODUCT
  const handleDuplicateProduct = async (p: Product) => {
    try {
      const res = await api.duplicateProduct(p.id);
      addProduct(res);
      notify('Product Duplicated', `Created "${res.name}" in Draft status.`, 'success');
    } catch (err: any) {
      notify('Duplicate Failed', err.message || 'Could not duplicate product.', 'error');
    }
  };

  // BULK ACTIONS
  const handleBulkStatusChange = async (status: 'published' | 'draft' | 'archived') => {
    if (selectedProductIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      await api.bulkUpdateProductStatus({
        productIds: selectedProductIds,
        status
      });
      // Update local state
      products.forEach(p => {
        if (selectedProductIds.includes(p.id)) {
          updateProduct({ ...p, status });
        }
      });
      setSelectedProductIds([]);
      notify('Bulk Update Applied', `Updated ${selectedProductIds.length} products to ${status}.`, 'success');
    } catch (err: any) {
      notify('Bulk Update Failed', err.message, 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  // SAVE PRODUCT
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim()) {
      notify('Missing Title', 'Product title is required.', 'error');
      return;
    }
    if (!editingProduct.variants || editingProduct.variants.length === 0) {
      notify('No Variants', 'Product must have at least one variant size & price.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingProduct.id && editingProduct.id !== '') {
        await api.updateProduct(editingProduct.id, editingProduct);
        updateProduct(editingProduct as Product);
        notify('Product Updated', `Successfully updated "${editingProduct.name}".`, 'success');
      } else {
        const created = await api.createProduct(editingProduct);
        addProduct(created);
        notify('Product Created', `Added "${created.name}" to catalog.`, 'success');
      }
      setShowEditor(false);
      setEditingProduct(null);
      setIsDirty(false);
    } catch (err: any) {
      notify('Save Failed', err.message || 'Could not save product.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // SAFE DELETE EXECUTION
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await api.deleteProduct(deleteTarget.id);
      deleteProduct(deleteTarget.id);
      notify('Product Deleted', `Permanently removed "${deleteTarget.name}".`, 'success');
      setDeleteTarget(null);
    } catch (err: any) {
      if (err.hasOrders) {
        setDeleteError(err.message);
      } else {
        notify('Delete Failed', err.message || 'Could not delete product.', 'error');
        setDeleteTarget(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveInstead = async () => {
    if (!deleteTarget) return;
    try {
      await api.updateProductStatus(deleteTarget.id, 'archived');
      updateProduct({ ...deleteTarget, status: 'archived' });
      notify('Product Archived', `Product "${deleteTarget.name}" is now safely archived.`, 'success');
      setDeleteTarget(null);
      setDeleteError(null);
    } catch (err: any) {
      notify('Archive Failed', err.message, 'error');
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;
    if (selectedStatusFilter !== 'all' && (p.status || 'published') !== selectedStatusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchVariant = p.variants?.some(v => v.sku?.toLowerCase().includes(q) || v.size.toLowerCase().includes(q));
      if (!matchName && !matchCategory && !matchVariant) return false;
    }
    return true;
  });

  const selectedCategoryObj = categories.find(c => c.slug === editingProduct?.category);

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & TOP CONTROLS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <Package className="w-4 h-4 text-orange-500" />
            <span>Product Management Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            E-Commerce Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage single &amp; multi-category products, packaging variants, galleries, inventory, and SEO.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTERS, SEARCH & BULK TOOLBAR
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'published', 'draft', 'archived'] as const).map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all ${
                  selectedStatusFilter === st
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st} ({products.filter(p => st === 'all' || (p.status || 'published') === st).length})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, SKU, variety..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Category Filter & Bulk Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-500">Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>
                  {c.name} ({products.filter(p => p.category === c.slug).length})
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Action Controls */}
          {selectedProductIds.length > 0 && (
            <div className="flex items-center space-x-2 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl animate-fade-in">
              <span className="font-bold text-orange-950">
                {selectedProductIds.length} product(s) selected:
              </span>
              <button
                disabled={bulkActionLoading}
                onClick={() => handleBulkStatusChange('published')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
              >
                Publish All
              </button>
              <button
                disabled={bulkActionLoading}
                onClick={() => handleBulkStatusChange('draft')}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px]"
              >
                Draft All
              </button>
              <button
                disabled={bulkActionLoading}
                onClick={() => handleBulkStatusChange('archived')}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px]"
              >
                Archive All
              </button>
              <button
                onClick={() => setSelectedProductIds([])}
                className="text-slate-500 hover:text-slate-800 font-bold ml-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. PRODUCT CARDS LIST
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Table/List Header */}
        <div className="flex items-center justify-between px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
              onChange={handleSelectAll}
              className="rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
            <span>Select All Products ({filteredProducts.length})</span>
          </div>
          <span>Actions &amp; Settings</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Products Matched</h3>
            <p className="text-xs text-slate-400 mt-1">Try changing your search term or filters.</p>
          </div>
        ) : (
          filteredProducts.map(p => {
            const isSelected = selectedProductIds.includes(p.id);
            const primaryImg = p.gallery?.find(g => g.isPrimary)?.url || p.images?.[0] || '/images/products/khapli-single.jpg';
            const status = p.status || 'published';

            return (
              <div
                key={p.id}
                className={`p-4 rounded-3xl bg-white border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected ? 'border-orange-400 bg-orange-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Left: Checkbox + Image + Details */}
                <div className="flex items-start sm:items-center space-x-3.5 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      setSelectedProductIds(prev =>
                        prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                      );
                    }}
                    className="mt-1 sm:mt-0 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />

                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <img
                      src={primaryImg}
                      alt={p.name}
                      className="w-full h-full object-contain filter drop-shadow-xs"
                    />
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                        {p.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                        {p.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                        status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {p.subTitle || p.tagline || '100% Cold-Milled Single-Origin'}
                    </p>

                    {/* Variants Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {p.variants?.map(v => (
                        <span
                          key={v.id}
                          className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-700"
                        >
                          <strong>{v.size}</strong>: ₹{v.price} ({v.stockCount} in stock)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                  {/* Duplicate Button */}
                  <button
                    onClick={() => handleDuplicateProduct(p)}
                    title="Duplicate into Draft"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Studio</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      setDeleteTarget(p);
                      setDeleteError(null);
                    }}
                    title="Delete or Archive Product"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. 5-TAB PRODUCT STUDIO MODAL
      ───────────────────────────────────────────────────────────── */}
      {showEditor && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-orange-500 text-white shadow-xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-950 text-lg leading-tight">
                    {editingProduct.id ? `Edit: ${editingProduct.name}` : 'Create New Store Product'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Configure general specs, multi-image gallery, pack variants, stock ledger, and SEO
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isDirty && !window.confirm('You have unsaved changes. Discard?')) return;
                  setShowEditor(false);
                }}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5-Tab Navigation Bar */}
            <div className="flex items-center border-b border-slate-200 px-4 bg-white overflow-x-auto">
              {[
                { id: 'general', label: 'General Info', icon: Sliders },
                { id: 'images', label: 'Gallery Media', icon: ImageIcon, badge: editingProduct.gallery?.length || 0 },
                { id: 'variants', label: 'Variants & Pricing', icon: DollarSign, badge: editingProduct.variants?.length || 0 },
                { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
                { id: 'seo', label: 'SEO & Metadata', icon: Globe }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ProductTab)}
                    className={`py-3 px-4 font-bold text-xs flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
              {/* TAB 1: GENERAL INFO */}
              {activeTab === 'general' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name || ''}
                        onChange={e => {
                          setEditingProduct(prev => ({ ...prev!, name: e.target.value }));
                          setIsDirty(true);
                        }}
                        placeholder="e.g. itsclear 100% Khapli Stoneground Atta"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-extrabold text-sm text-slate-900 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">
                        Category *
                      </label>
                      <select
                        value={editingProduct.category}
                        onChange={e => {
                          setEditingProduct(prev => ({ ...prev!, category: e.target.value as any }));
                          setIsDirty(true);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white text-slate-900"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Subtitle / Variety Line</label>
                      <input
                        type="text"
                        value={editingProduct.subTitle || ''}
                        onChange={e => {
                          setEditingProduct(prev => ({ ...prev!, subTitle: e.target.value }));
                          setIsDirty(true);
                        }}
                        placeholder="e.g. 100% Ancient Emmer Wheat (Low GI 42)"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Marketing Tagline</label>
                      <input
                        type="text"
                        value={editingProduct.tagline || ''}
                        onChange={e => {
                          setEditingProduct(prev => ({ ...prev!, tagline: e.target.value }));
                          setIsDirty(true);
                        }}
                        placeholder="e.g. Diabetics' Choice • Zero Spike"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Product Story &amp; Details</label>
                    <textarea
                      rows={3}
                      value={editingProduct.description || ''}
                      onChange={e => {
                        setEditingProduct(prev => ({ ...prev!, description: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder="Detailed origin, traditional milling, farm source, nutritional benefits..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Origin Farm</label>
                      <input
                        type="text"
                        value={editingProduct.origin || ''}
                        onChange={e => {
                          setEditingProduct(prev => ({ ...prev!, origin: e.target.value }));
                          setIsDirty(true);
                        }}
                        placeholder="e.g. Sehore, Madhya Pradesh"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Harvest Season</label>
                      <input
                        type="text"
                        value={editingProduct.harvestSeason || ''}
                        onChange={e => {
                          setEditingProduct(prev => ({ ...prev!, harvestSeason: e.target.value }));
                          setIsDirty(true);
                        }}
                        placeholder="e.g. Fresh Daily Batch 2026"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Publish State</label>
                      <select
                        value={editingProduct.status || 'published'}
                        onChange={e => {
                          setEditingProduct(prev => ({ ...prev!, status: e.target.value as any }));
                          setIsDirty(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                      >
                        <option value="published">Published (Live in Store)</option>
                        <option value="draft">Draft (Admin Only)</option>
                        <option value="archived">Archived (Deactivated)</option>
                      </select>
                    </div>
                  </div>

                  {/* Category Custom Attributes */}
                  {selectedCategoryObj && selectedCategoryObj.attributeSchema?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                      <h4 className="font-black text-amber-950 text-xs">
                        {selectedCategoryObj.name} Specific Specifications
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedCategoryObj.attributeSchema.map(attr => (
                          <div key={attr.key}>
                            <label className="block font-bold text-amber-900 mb-1">{attr.label}</label>
                            <input
                              type={attr.type === 'number' ? 'number' : 'text'}
                              value={editingProduct.customAttributes?.[attr.key] || (editingProduct as any)[attr.key] || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setEditingProduct(prev => ({
                                  ...prev!,
                                  [attr.key]: val,
                                  customAttributes: {
                                    ...(prev?.customAttributes || {}),
                                    [attr.key]: val
                                  }
                                }));
                                setIsDirty(true);
                              }}
                              placeholder={attr.placeholder || `Enter ${attr.label}`}
                              className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MULTI-IMAGE GALLERY */}
              {activeTab === 'images' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Product Image Gallery</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Upload multiple photos simultaneously. Click &quot;Make Primary&quot; to set the storefront cover.
                      </p>
                    </div>

                    <label className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs cursor-pointer shadow-xs transition-all">
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Photos (Multi)'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleMultipleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {(!editingProduct.gallery || editingProduct.gallery.length === 0) ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                      <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">No gallery images added yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click the button above to upload JPG, PNG, or WEBP files.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {editingProduct.gallery.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          className={`relative rounded-2xl bg-white border p-2 transition-all flex flex-col justify-between ${
                            img.isPrimary ? 'border-orange-500 ring-2 ring-orange-200 shadow-sm' : 'border-slate-200'
                          }`}
                        >
                          {/* Image Box */}
                          <div className="w-full h-36 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center p-1">
                            <img src={img.url} alt={img.alt} className="w-full h-full object-contain filter drop-shadow-xs" />
                          </div>

                          {img.isPrimary && (
                            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-orange-500 text-white font-black text-[9px] uppercase tracking-wider shadow-xs">
                              Primary Cover
                            </span>
                          )}

                          {/* Controls Row */}
                          <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                            {!img.isPrimary ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="text-[10px] font-bold text-orange-600 hover:text-orange-700"
                              >
                                Make Primary
                              </button>
                            ) : (
                              <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Cover</span>
                              </span>
                            )}

                            <div className="flex items-center space-x-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, 'up')}
                                  className="p-1 text-slate-400 hover:text-slate-800"
                                  title="Move Left"
                                >
                                  <ArrowUp className="w-3 h-3 rotate-[-90deg]" />
                                </button>
                              )}
                              {idx < editingProduct.gallery.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, 'down')}
                                  className="p-1 text-slate-400 hover:text-slate-800"
                                  title="Move Right"
                                >
                                  <ArrowDown className="w-3 h-3 rotate-[-90deg]" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                title="Delete Image"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VARIANTS & PRICING */}
              {activeTab === 'variants' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Packaging Sizes &amp; Pricing Matrix</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Configure pack sizes (g, kg, ml, L), unit price, MRP, and unique SKU identifiers.
                      </p>
                    </div>
                  </div>

                  {/* Existing Variants Table */}
                  <div className="space-y-2">
                    {editingProduct.variants?.map((v, idx) => (
                      <div
                        key={v.id || idx}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-sm text-slate-900">{v.size}</span>
                          <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {v.sku}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-xs">
                          <div>
                            <span className="text-slate-400 font-medium mr-1">Sale:</span>
                            <span className="font-black text-slate-950">₹{v.price}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium mr-1">MRP:</span>
                            <span className="line-through text-slate-400">₹{v.originalPrice}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium mr-1">Stock:</span>
                            <span className="font-bold text-slate-800">{v.stockCount}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Variant Box */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-2xs space-y-3">
                    <span className="font-black text-xs text-slate-900 uppercase tracking-wider block">
                      + Add New Pack Variant
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Pack Name</label>
                        <input
                          type="text"
                          value={newVariant.size || ''}
                          onChange={e => setNewVariant(prev => ({ ...prev, size: e.target.value }))}
                          placeholder="e.g. 5 kg Bori Sack"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Unit</label>
                        <select
                          value={newVariant.unit || 'kg'}
                          onChange={e => setNewVariant(prev => ({ ...prev, unit: e.target.value }))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="L">L</option>
                          <option value="ml">ml</option>
                          <option value="pack">pack</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Selling Price (₹)</label>
                        <input
                          type="number"
                          value={newVariant.price || ''}
                          onChange={e => setNewVariant(prev => ({ ...prev, price: Number(e.target.value) }))}
                          placeholder="440"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">MRP (₹)</label>
                        <input
                          type="number"
                          value={newVariant.originalPrice || ''}
                          onChange={e => setNewVariant(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
                          placeholder="520"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Initial Stock</label>
                        <input
                          type="number"
                          value={newVariant.stockCount || ''}
                          onChange={e => setNewVariant(prev => ({ ...prev, stockCount: Number(e.target.value) }))}
                          placeholder="100"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                      >
                        Add Variant to Matrix
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: INVENTORY & STOCK */}
              {activeTab === 'inventory' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Inventory &amp; Low-Stock Thresholds</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Monitor stock counts, reserved orders, and set alert triggers.
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    {editingProduct.variants?.map((v, idx) => (
                      <div key={v.id || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-sm text-slate-900">{v.size}</span>
                            <span className="font-mono text-xs text-slate-400">({v.sku})</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                            Reserved: {v.reservedStock || 0} unit(s) • Threshold: {v.lowStockThreshold || 15} units
                          </span>
                        </div>

                        {/* Direct Stock Input */}
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Available Units</label>
                            <input
                              type="number"
                              min="0"
                              value={v.stockCount}
                              onChange={e => {
                                const count = Math.max(0, Number(e.target.value));
                                const updated = editingProduct.variants?.map((item, i) =>
                                  i === idx ? { ...item, stockCount: count, inStock: count > 0 } : item
                                );
                                setEditingProduct(prev => ({ ...prev!, variants: updated }));
                                setIsDirty(true);
                              }}
                              className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 font-black text-slate-900 text-right bg-slate-50 focus:bg-white focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SEO & METADATA */}
              {activeTab === 'seo' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Search Engine Optimization (SEO)</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Configure custom title tags, meta descriptions, and indexing keywords.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Meta Title</label>
                      <input
                        type="text"
                        value={editingProduct.seo?.metaTitle || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setEditingProduct(prev => ({
                            ...prev!,
                            seo: { ...(prev?.seo || {}), metaTitle: val }
                          }));
                          setIsDirty(true);
                        }}
                        placeholder={`${editingProduct.name || 'Product'} | itsclear Pure & Unadulterated`}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Meta Description</label>
                      <textarea
                        rows={2}
                        value={editingProduct.seo?.metaDescription || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setEditingProduct(prev => ({
                            ...prev!,
                            seo: { ...(prev?.seo || {}), metaDescription: val }
                          }));
                          setIsDirty(true);
                        }}
                        placeholder="Concise summary for search engines and social sharing..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    {/* Google Search Preview Snippet */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                        Google Search Preview
                      </span>
                      <div className="text-blue-700 font-medium text-sm hover:underline cursor-pointer">
                        {editingProduct.seo?.metaTitle || editingProduct.name || 'Product Title'} | itsclear.in
                      </div>
                      <div className="text-emerald-700 text-xs">https://itsclear.in/product/{editingProduct.id || 'sku'}</div>
                      <div className="text-slate-600 text-xs line-clamp-2">
                        {editingProduct.seo?.metaDescription || editingProduct.tagline || '100% pure stoneground chakki atta and cold-pressed staples.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Action Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 bg-white sticky bottom-0">
                <div className="text-xs text-slate-400 font-medium">
                  {isDirty && <span className="text-amber-600 font-bold">• You have unsaved edits</span>}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isDirty && !window.confirm('Discard unsaved edits?')) return;
                      setShowEditor(false);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaving ? 'Saving...' : 'Save Product'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. PRODUCT DELETE CONFIRMATION & SAFETY MODAL
      ───────────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-950 text-base">Delete Product Safety Check</h3>
                <p className="text-xs text-slate-500 font-medium">{deleteTarget.name}</p>
              </div>
            </div>

            {deleteError ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
                <p className="font-bold">{deleteError}</p>
                <p className="text-slate-600">
                  Archiving hides the product from your public storefront and category pages while safely preserving customer order receipts.
                </p>
                <button
                  onClick={handleArchiveInstead}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                >
                  Archive Product Instead
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>?
                If customers have previously purchased this product, the system will prevent permanent deletion and recommend archiving.
              </p>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              {!deleteError && (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Confirm Permanent Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
