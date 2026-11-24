import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { api } from '../../../services/api';
import { SubscriptionPlan, Category } from '../../../types';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Calendar,
  Percent,
  Coins,
  Save,
  X,
  Users,
  Repeat
} from 'lucide-react';

export const AdminGrainClubView: React.FC = () => {
  const { notify } = useStore();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Loyalty Coin Settings State
  const [coinRate, setCoinRate] = useState(5); // 5 coins per 100
  const [maxRedeemPercent, setMaxRedeemPercent] = useState(20);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plansData, catsData, settingsData] = await Promise.all([
        api.getAdminSubscriptionPlans().catch(() => []),
        api.getCategories().catch(() => []),
        api.getStoreSettings().catch(() => null)
      ]);

      setPlans(plansData);
      setCategories(catsData);
      if (settingsData?.grainClub) {
        setCoinRate(settingsData.grainClub.coinsPerHundredSpent || 5);
        setMaxRedeemPercent(settingsData.grainClub.maxCoinsRedeemPercent || 20);
      }
    } catch (err: any) {
      notify('Grain Club Error', err.message || 'Could not load subscription data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingPlan({
      id: '',
      name: '',
      frequency: 'monthly',
      discountPercentage: 15,
      eligibleCategories: ['atta', 'oil', 'ghee'],
      description: 'Scheduled doorstep refills with subscriber discount.',
      isActive: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan({ ...plan });
    setShowModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan?.name?.trim()) {
      notify('Missing Name', 'Plan name is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.saveSubscriptionPlan(editingPlan);
      notify('Plan Saved', `Subscription plan "${editingPlan.name}" saved.`, 'success');
      setShowModal(false);
      setEditingPlan(null);
      loadData();
    } catch (err: any) {
      notify('Save Failed', err.message || 'Could not save plan.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      await api.deleteSubscriptionPlan(id);
      notify('Plan Removed', 'Subscription plan deleted.', 'success');
      loadData();
    } catch (err: any) {
      notify('Delete Failed', err.message || 'Could not remove plan.', 'error');
    }
  };

  const handleSaveCoinsRule = async () => {
    try {
      await api.updateStoreSettingsGroup('grainClub', {
        coinsPerHundredSpent: Number(coinRate),
        maxCoinsRedeemPercent: Number(maxRedeemPercent)
      });
      notify('Loyalty Config Saved', 'ClearCoins earning & redemption rules updated.', 'success');
    } catch (err: any) {
      notify('Save Failed', err.message || 'Could not save loyalty settings.', 'error');
    }
  };

  const toggleCategoryEligibility = (slug: string) => {
    if (!editingPlan) return;
    const current = editingPlan.eligibleCategories || [];
    const updated = current.includes(slug)
      ? current.filter(c => c !== slug)
      : [...current, slug];
    setEditingPlan(prev => ({ ...prev!, eligibleCategories: updated }));
  };

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Recurring Subscriptions &amp; Loyalty</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Grain Club &amp; Auto-Refill Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure delivery refill cycles, subscriber discounts, eligible categories, and ClearCoins rules
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Subscription Plan</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SUBSCRIPTION PLANS GRID
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900">Active Auto-Refill Plans</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 font-black text-[10px] uppercase tracking-wider border border-orange-200">
                    {plan.frequency}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-black text-slate-900">{plan.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{plan.description}</p>

                <div className="pt-2 text-2xl font-black text-emerald-600">
                  {plan.discountPercentage}% OFF
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-900 block">Eligible Categories:</span>
                  <div className="flex flex-wrap gap-1">
                    {plan.eligibleCategories?.map(cat => (
                      <span key={cat} className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-[10px]">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Status: {plan.isActive ? 'Active' : 'Disabled'}</span>
                <span className="font-mono">id: {plan.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CLEARCOINS LOYALTY RULES
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 max-w-2xl">
        <div className="flex items-center space-x-2 text-amber-600">
          <Coins className="w-5 h-5" />
          <h3 className="text-sm font-black text-slate-900">ClearCoins Loyalty Rewards Configuration</h3>
        </div>
        <p className="text-xs text-slate-500">
          Customers earn ClearCoins with each delivered order. Coins can be redeemed for order discounts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Coins Earned per ₹100 Spent</label>
            <input
              type="number"
              min="1"
              max="50"
              value={coinRate}
              onChange={e => setCoinRate(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">1 ClearCoin = ₹1.00 Discount</span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Max % Order Payable by Coins</label>
            <input
              type="number"
              min="5"
              max="100"
              value={maxRedeemPercent}
              onChange={e => setMaxRedeemPercent(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Prevents total zero-margin checkouts</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSaveCoinsRule}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Loyalty Rules</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. SUBSCRIPTION PLAN MODAL
      ───────────────────────────────────────────────────────────── */}
      {showModal && editingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">
                {editingPlan.id ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Display Name *</label>
                <input
                  type="text"
                  required
                  value={editingPlan.name || ''}
                  onChange={e => setEditingPlan(prev => ({ ...prev!, name: e.target.value }))}
                  placeholder="e.g. Monthly Pantry Refill"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Refill Frequency</label>
                  <select
                    value={editingPlan.frequency}
                    onChange={e => setEditingPlan(prev => ({ ...prev!, frequency: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="weekly">Weekly (Every 7 Days)</option>
                    <option value="biweekly">Bi-weekly (Every 14 Days)</option>
                    <option value="monthly">Monthly (Every 30 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subscriber Discount (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={editingPlan.discountPercentage || 15}
                    onChange={e => setEditingPlan(prev => ({ ...prev!, discountPercentage: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-black text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Description</label>
                <input
                  type="text"
                  value={editingPlan.description || ''}
                  onChange={e => setEditingPlan(prev => ({ ...prev!, description: e.target.value }))}
                  placeholder="e.g. Fresh cold stoneground grains delivered right to your kitchen"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Eligible Categories for Auto-Refill</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {categories.map(c => {
                    const isEligible = editingPlan.eligibleCategories?.includes(c.slug);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCategoryEligibility(c.slug)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          isEligible ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
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
                  <span>{isSaving ? 'Saving...' : 'Save Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
