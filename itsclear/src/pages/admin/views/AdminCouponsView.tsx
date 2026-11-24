import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { api } from '../../../services/api';
import { Coupon, Category } from '../../../types';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Percent,
  X,
  Save,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Sliders
} from 'lucide-react';

export const AdminCouponsView: React.FC = () => {
  const { notify } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [couponsData, catsData] = await Promise.all([
        api.getAdminCoupons().catch(() => []),
        api.getCategories().catch(() => [])
      ]);
      setCoupons(couponsData);
      setCategories(catsData);
    } catch (err: any) {
      notify('Coupons Error', err.message || 'Could not fetch coupons.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 499,
      description: '',
      usageLimit: 0,
      applicableCategories: [],
      canStackWithCoins: false,
      canStackWithCombos: false,
      active: true
    });
    setShowModal(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon?.code?.trim()) {
      notify('Missing Code', 'Coupon code is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.createCoupon({
        ...editingCoupon,
        code: editingCoupon.code.trim().toUpperCase()
      } as any);

      notify('Coupon Saved', `Coupon "${editingCoupon.code.toUpperCase()}" saved.`, 'success');
      setShowModal(false);
      setEditingCoupon(null);
      loadData();
    } catch (err: any) {
      notify('Save Failed', err.message || 'Could not save coupon.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (code: string) => {
    try {
      await api.toggleCoupon(code);
      notify('Status Toggled', `Coupon ${code} status changed.`, 'success');
      loadData();
    } catch (err: any) {
      notify('Toggle Failed', err.message || 'Could not toggle coupon status.', 'error');
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await api.deleteCoupon(code);
      notify('Coupon Deleted', `Coupon ${code} removed.`, 'success');
      loadData();
    } catch (err: any) {
      notify('Delete Failed', err.message || 'Could not delete coupon.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <Tag className="w-4 h-4 text-orange-500" />
            <span>Promotions &amp; Stacking Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Offers &amp; Promotional Coupons
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure promo codes, min basket requirements, category whitelists, and anti-stacking guards
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Promo Code</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. COUPONS TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            <span>Loading promo codes...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No active coupons found. Click &quot;New Promo Code&quot; to configure your first discount coupon.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Promo Code</th>
                  <th className="py-3 px-3">Benefit</th>
                  <th className="py-3 px-3">Min Order</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Anti-Stacking Guards</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {coupons.map((c) => (
                  <tr key={c.code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-black text-slate-950 text-sm">
                      {c.code}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-black text-emerald-700 text-xs">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900">
                      ₹{c.minOrderValue}
                    </td>

                    <td className="py-3 px-3 text-slate-500 max-w-[200px] truncate">
                      {c.description || 'General store discount'}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-col space-y-0.5 text-[10px]">
                        <span className={c.canStackWithCoins ? 'text-amber-700 font-bold' : 'text-slate-400'}>
                          {c.canStackWithCoins ? '✓ Stacks with ClearCoins' : '✕ No ClearCoins stacking'}
                        </span>
                        <span className={c.canStackWithCombos ? 'text-amber-700 font-bold' : 'text-slate-400'}>
                          {c.canStackWithCombos ? '✓ Stacks with Combos' : '✕ No Combo stacking'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleStatus(c.code)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                          c.active ?? true ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {c.active ?? true ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.code)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. NEW / EDIT COUPON MODAL
      ───────────────────────────────────────────────────────────── */}
      {showModal && editingCoupon && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Create Promotional Coupon</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={editingCoupon.code || ''}
                    onChange={e => setEditingCoupon(prev => ({ ...prev!, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. CLEAR15"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-black text-slate-900 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discountType}
                    onChange={e => setEditingCoupon(prev => ({ ...prev!, discountType: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="flat">Flat Amount (₹ OFF)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingCoupon.discountValue || ''}
                    onChange={e => setEditingCoupon(prev => ({ ...prev!, discountValue: Number(e.target.value) }))}
                    placeholder={editingCoupon.discountType === 'percentage' ? '15%' : '₹100'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCoupon.minOrderValue || 0}
                    onChange={e => setEditingCoupon(prev => ({ ...prev!, minOrderValue: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Description</label>
                <input
                  type="text"
                  value={editingCoupon.description || ''}
                  onChange={e => setEditingCoupon(prev => ({ ...prev!, description: e.target.value }))}
                  placeholder="e.g. 15% off on your fresh cold chakki order"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {/* Anti-Stacking Controls */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <h4 className="font-black text-amber-950 text-xs">Anti-Stacking &amp; Margin Protection</h4>
                <div className="space-y-2 pt-1">
                  <label className="flex items-center space-x-2 font-bold text-amber-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCoupon.canStackWithCoins}
                      onChange={e => setEditingCoupon(prev => ({ ...prev!, canStackWithCoins: e.target.checked }))}
                      className="rounded-md text-orange-500"
                    />
                    <span>Allow customer to redeem ClearCoins alongside this coupon</span>
                  </label>

                  <label className="flex items-center space-x-2 font-bold text-amber-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCoupon.canStackWithCombos}
                      onChange={e => setEditingCoupon(prev => ({ ...prev!, canStackWithCombos: e.target.checked }))}
                      className="rounded-md text-orange-500"
                    />
                    <span>Allow coupon discount on already-bundled Combo packs</span>
                  </label>
                </div>
              </div>

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
                  <span>{isSaving ? 'Saving...' : 'Save Promo Code'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
