import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { api } from '../../../services/api';
import { Category, CategoryAttributeDefinition } from '../../../types';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Package,
  Droplets,
  Flame,
  Wheat,
  X,
  Save,
  Upload,
  Loader2
} from 'lucide-react';

export const AdminCategoriesView: React.FC = () => {
  const { notify } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic Attribute State inside Modal
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrLabel, setNewAttrLabel] = useState('');
  const [newAttrType, setNewAttrType] = useState<'text' | 'number' | 'select' | 'boolean'>('text');
  const [newAttrPlaceholder, setNewAttrPlaceholder] = useState('');

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminCategories();
      setCategories(data);
    } catch (err: any) {
      notify('Categories Load Error', err.message || 'Could not fetch categories from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory({
      id: '',
      slug: '',
      name: '',
      description: '',
      imageUrl: '/images/products/khapli-single.jpg',
      icon: 'Package',
      sortOrder: (categories.length || 0) + 1,
      isActive: true,
      eligibleForSubscription: true,
      attributeSchema: [],
      seo: { title: '', description: '' }
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory({ ...cat, attributeSchema: cat.attributeSchema || [] });
    setShowModal(true);
  };

  const handleAddAttribute = () => {
    if (!newAttrKey.trim() || !newAttrLabel.trim()) {
      notify('Incomplete Field', 'Both attribute key and label are required.', 'info');
      return;
    }

    const cleanKey = newAttrKey.trim().replace(/[^a-zA-Z0-9_]/g, '');
    const newAttr: CategoryAttributeDefinition = {
      key: cleanKey,
      label: newAttrLabel.trim(),
      type: newAttrType,
      placeholder: newAttrPlaceholder.trim()
    };

    setEditingCategory(prev => ({
      ...prev!,
      attributeSchema: [...(prev?.attributeSchema || []), newAttr]
    }));

    setNewAttrKey('');
    setNewAttrLabel('');
    setNewAttrPlaceholder('');
  };

  const handleRemoveAttribute = (index: number) => {
    setEditingCategory(prev => ({
      ...prev!,
      attributeSchema: prev?.attributeSchema?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) {
      notify('Missing Name', 'Category name is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory.id && editingCategory.id !== '') {
        await api.updateCategory(editingCategory.id, editingCategory);
        notify('Category Saved', `Updated category "${editingCategory.name}".`, 'success');
      } else {
        await api.createCategory(editingCategory);
        notify('Category Created', `Created category "${editingCategory.name}".`, 'success');
      }
      setShowModal(false);
      setEditingCategory(null);
      loadCategories();
    } catch (err: any) {
      notify('Save Failed', err.message || 'Could not save category.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      await api.deleteCategory(cat.id);
      notify('Category Deleted', `Category "${cat.name}" removed successfully.`, 'success');
      loadCategories();
    } catch (err: any) {
      notify('Delete Blocked', err.message || 'Cannot delete category with active products.', 'error');
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await api.updateCategory(cat.id, { isActive: !cat.isActive });
      notify('Status Updated', `Category is now ${!cat.isActive ? 'Active' : 'Inactive'}.`, 'success');
      loadCategories();
    } catch (err: any) {
      notify('Update Failed', err.message || 'Failed to update status.', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await api.uploadImage(file);
      if (res && res.url) {
        setEditingCategory(prev => ({ ...prev!, imageUrl: res.url }));
        notify('Image Uploaded', 'Category media saved.', 'success');
      }
    } catch (err: any) {
      notify('Upload Error', err.message || 'Failed to upload photo.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & ACTION
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-orange-500" />
            <span>Multi-Category Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Product Category Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, configure attributes, and manage catalog categories for Atta, Oil, Ghee, Combos, and new staples
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CATEGORIES TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            <span>Loading category hierarchy...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No categories defined. Click &quot;New Category&quot; to initialize a category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Order</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Slug</th>
                  <th className="py-3 px-3">Products</th>
                  <th className="py-3 px-3">Custom Specs</th>
                  <th className="py-3 px-3">Subscriptions</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">
                      #{cat.sortOrder}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {cat.imageUrl ? (
                            <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{cat.name}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {cat.description || 'No description provided'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {cat.slug}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-black text-slate-800 text-[10px]">
                        {cat.productCount || 0} active
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {cat.attributeSchema?.length || 0} custom fields
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        cat.eligibleForSubscription ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {cat.eligibleForSubscription ? 'Auto-Refill Allowed' : 'One-Time Only'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                          cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          title="Edit Category & Attributes"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORY MODAL (ADD / EDIT)
      ───────────────────────────────────────────────────────────── */}
      {showModal && editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 my-8 p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingCategory.id ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-5 text-xs">
              {/* Category Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category Title *</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingCategory(prev => ({
                        ...prev!,
                        name: val,
                        slug: prev?.id ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                      }));
                    }}
                    placeholder="e.g. Desi Ghee"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.slug || ''}
                    onChange={e => setEditingCategory(prev => ({ ...prev!, slug: e.target.value }))}
                    placeholder="e.g. desi-ghee"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={e => setEditingCategory(prev => ({ ...prev!, description: e.target.value }))}
                  placeholder="e.g. Traditional Bilona A2 Desi Cow Ghee made from fresh curd"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Image & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Image URL / Media Asset</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingCategory.imageUrl || ''}
                      onChange={e => setEditingCategory(prev => ({ ...prev!, imageUrl: e.target.value }))}
                      placeholder="/images/products/desi-ghee-pouch.jpg"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500 text-xs"
                    />
                    <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold shrink-0 cursor-pointer flex items-center space-x-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? '...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sort Priority</label>
                  <input
                    type="number"
                    value={editingCategory.sortOrder || 1}
                    onChange={e => setEditingCategory(prev => ({ ...prev!, sortOrder: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editingCategory.isActive ?? true}
                    onChange={e => setEditingCategory(prev => ({ ...prev!, isActive: e.target.checked }))}
                    className="rounded-md text-orange-500"
                  />
                  <span>Category Active &amp; Visible in Store</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editingCategory.eligibleForSubscription ?? true}
                    onChange={e => setEditingCategory(prev => ({ ...prev!, eligibleForSubscription: e.target.checked }))}
                    className="rounded-md text-orange-500"
                  />
                  <span>Allow Grain Club Auto-Refill</span>
                </label>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  CUSTOM ATTRIBUTES SCHEMA DEFINITION
              ───────────────────────────────────────────────────────────── */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">Category-Specific Specifications</h4>
                    <p className="text-[11px] text-slate-500">
                      Define custom specs that products in this category will display (e.g. Smoke Point, Milling Speed)
                    </p>
                  </div>
                </div>

                {/* Existing Defined Attributes */}
                <div className="space-y-1.5">
                  {editingCategory.attributeSchema?.map((attr, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs">
                      <div className="space-x-2">
                        <span className="font-bold text-slate-900">{attr.label}</span>
                        <span className="font-mono text-[10px] text-slate-400">({attr.key})</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-bold uppercase">{attr.type}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Attribute Inputs */}
                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newAttrLabel}
                    onChange={e => {
                      setNewAttrLabel(e.target.value);
                      if (!newAttrKey) {
                        setNewAttrKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                      }
                    }}
                    placeholder="Label (e.g. Smoke Point)"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={newAttrKey}
                    onChange={e => setNewAttrKey(e.target.value)}
                    placeholder="Key (e.g. smokePoint)"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
                  />
                  <select
                    value={newAttrType}
                    onChange={e => setNewAttrType(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                  >
                    + Add Field
                  </button>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
