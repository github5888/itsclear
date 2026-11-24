import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { api } from '../../../services/api';
import { StoreSettings } from '../../../types';
import {
  Settings,
  Truck,
  CreditCard,
  Building,
  Users,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { notify } = useStore();
  const [activeTab, setActiveTab] = useState<'delivery' | 'payments' | 'store' | 'staff'>('delivery');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<StoreSettings>({
    delivery: {
      freeDeliveryThreshold: 499,
      standardDeliveryFee: 49,
      expressDeliveryFee: 79,
      deliverySlots: [
        '2-Hour Farm Express (Lucknow)',
        'Morning Slot (7 AM - 11 AM)',
        'Evening Slot (4 PM - 8 PM)',
        'Standard Next-Day Dispatch'
      ],
      serviceableCities: ['Lucknow', 'Kanpur', 'Ayodhya', 'Delhi NCR']
    },
    payments: {
      onlinePaymentsEnabled: true,
      codEnabled: true,
      codMaxOrderValue: 5000,
      razorpayKeyId: 'Configured via .env'
    },
    storeProfile: {
      brandName: 'itsclear™ Natural Food Products',
      legalEntityName: 'Infinity Technology / ItsClear Foods Pvt. Ltd.',
      gstin: '09AAECI1234F1Z5',
      fssaiLicense: '12724055000123',
      supportPhone: '+91 88581 80597',
      supportEmail: 'care@itsclear.in',
      warehouseAddress: 'Plot 14, Industrial Area, Kursi Road, Lucknow, UP - 226026'
    },
    grainClub: {
      coinsPerHundredSpent: 5,
      maxCoinsRedeemPercent: 20
    }
  });

  // Staff State
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [isUpdatingStaff, setIsUpdatingStaff] = useState(false);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const [settingsData, staffData] = await Promise.all([
        api.getStoreSettings().catch(() => null),
        api.getStaffUsers().catch(() => [])
      ]);

      if (settingsData) setSettings(settingsData);
      setStaffUsers(staffData);
    } catch (err: any) {
      notify('Settings Load Warning', err.message || 'Using standard defaults.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveGroup = async (group: 'delivery' | 'payments' | 'storeProfile') => {
    setIsSaving(true);
    try {
      await api.updateStoreSettingsGroup(group, settings[group]);
      notify('Settings Saved', `${group.toUpperCase()} settings updated successfully.`, 'success');
    } catch (err: any) {
      notify('Save Failed', err.message || 'Could not update settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromoteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim() || !newStaffEmail.includes('@')) {
      notify('Invalid Email', 'Please enter a valid administrator email address.', 'error');
      return;
    }

    setIsUpdatingStaff(true);
    try {
      await api.updateStaffRole(newStaffEmail.trim().toLowerCase(), 'admin');
      notify('Administrator Added', `Granted administrator role to ${newStaffEmail}.`, 'success');
      setNewStaffEmail('');
      const updatedStaff = await api.getStaffUsers();
      setStaffUsers(updatedStaff);
    } catch (err: any) {
      notify('Promotion Failed', err.message || 'User not found or update error.', 'error');
    } finally {
      setIsUpdatingStaff(false);
    }
  };

  const handleRevokeStaff = async (email: string) => {
    if (!window.confirm(`Revoke administrator role from ${email}?`)) return;

    try {
      await api.updateStaffRole(email, 'customer');
      notify('Role Revoked', `Administrator role revoked from ${email}.`, 'success');
      const updatedStaff = await api.getStaffUsers();
      setStaffUsers(updatedStaff);
    } catch (err: any) {
      notify('Update Failed', err.message || 'Could not revoke role.', 'error');
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
            <Settings className="w-4 h-4 text-orange-500" />
            <span>Store Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Store &amp; Fulfillment Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure delivery rules, payment options, store profile, and staff administrator access
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SETTINGS TABS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('delivery')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'delivery' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Delivery &amp; Shipping</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'payments' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payments &amp; COD</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'store' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Legal &amp; Warehouse</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'staff' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff &amp; Roles ({staffUsers.length})</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. TAB 1: DELIVERY & SHIPPING
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'delivery' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5 max-w-2xl text-xs">
          <div>
            <h3 className="text-sm font-black text-slate-900">Delivery Rules &amp; Thresholds</h3>
            <p className="text-[11px] text-slate-500">Configure thresholds for free shipping and local EV deliveries</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Free Delivery Basket Threshold (₹) *</label>
              <input
                type="number"
                min="0"
                value={settings.delivery.freeDeliveryThreshold}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  delivery: { ...prev.delivery, freeDeliveryThreshold: Number(e.target.value) }
                }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Orders above this get free delivery automatically</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.delivery.standardDeliveryFee}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  delivery: { ...prev.delivery, standardDeliveryFee: Number(e.target.value) }
                }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Serviceable Cities (Comma Separated)</label>
            <input
              type="text"
              value={settings.delivery.serviceableCities?.join(', ')}
              onChange={e => {
                const cities = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                setSettings(prev => ({
                  ...prev,
                  delivery: { ...prev.delivery, serviceableCities: cities }
                }));
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handleSaveGroup('delivery')}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Delivery Settings'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. TAB 2: PAYMENTS & COD
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5 max-w-2xl text-xs">
          <div>
            <h3 className="text-sm font-black text-slate-900">Checkout Payment Methods</h3>
            <p className="text-[11px] text-slate-500">Enable or disable online payment gateway and cash on delivery</p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.payments.onlinePaymentsEnabled}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  payments: { ...prev.payments, onlinePaymentsEnabled: e.target.checked }
                }))}
                className="rounded-md text-orange-500 mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-900 block">Razorpay Online Gateway (UPI, Cards, NetBanking)</span>
                <span className="text-[11px] text-slate-500">Key: {settings.payments.razorpayKeyId}</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.payments.codEnabled}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  payments: { ...prev.payments, codEnabled: e.target.checked }
                }))}
                className="rounded-md text-orange-500 mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-900 block">Cash on Delivery (COD)</span>
                <span className="text-[11px] text-slate-500">Allow customers to pay cash or UPI at the doorstep</span>
              </div>
            </label>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Cash on Delivery Basket Cap (₹)</label>
              <input
                type="number"
                value={settings.payments.codMaxOrderValue || 5000}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  payments: { ...prev.payments, codMaxOrderValue: Number(e.target.value) }
                }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Orders above this value must be paid online to prevent returns</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handleSaveGroup('payments')}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Payment Settings'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. TAB 3: LEGAL & WAREHOUSE
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'store' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5 max-w-2xl text-xs">
          <div>
            <h3 className="text-sm font-black text-slate-900">Store Profile &amp; Regulatory Invoicing</h3>
            <p className="text-[11px] text-slate-500">Legal entity information printed on packing slips and customer invoices</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={settings.storeProfile?.brandName || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  storeProfile: { ...prev.storeProfile, brandName: e.target.value }
                }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Legal Entity / Company Name</label>
              <input
                type="text"
                value={settings.storeProfile?.legalEntityName || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  storeProfile: { ...prev.storeProfile, legalEntityName: e.target.value }
                }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={settings.storeProfile?.gstin || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  storeProfile: { ...prev.storeProfile, gstin: e.target.value }
                }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">FSSAI License Number</label>
              <input
                type="text"
                value={settings.storeProfile?.fssaiLicense || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  storeProfile: { ...prev.storeProfile, fssaiLicense: e.target.value }
                }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer Support Phone</label>
              <input
                type="text"
                value={settings.storeProfile?.supportPhone || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  storeProfile: { ...prev.storeProfile, supportPhone: e.target.value }
                }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.storeProfile?.supportEmail || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  storeProfile: { ...prev.storeProfile, supportEmail: e.target.value }
                }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Milling Warehouse &amp; Dispatch Facility Address</label>
            <input
              type="text"
              value={settings.storeProfile?.warehouseAddress || ''}
              onChange={e => setSettings(prev => ({
                ...prev,
                storeProfile: { ...prev.storeProfile, warehouseAddress: e.target.value }
              }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handleSaveGroup('storeProfile')}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. TAB 4: STAFF & ROLES
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'staff' && (
        <div className="space-y-6 max-w-2xl text-xs">
          {/* Add Staff */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">Authorize New Administrator</h3>
            <p className="text-[11px] text-slate-500">
              Enter the email of a registered user to promote them to administrator status
            </p>

            <form onSubmit={handlePromoteStaff} className="flex gap-2">
              <input
                type="email"
                required
                value={newStaffEmail}
                onChange={e => setNewStaffEmail(e.target.value)}
                placeholder="staff@itsclear.in"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
              />
              <button
                type="submit"
                disabled={isUpdatingStaff}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs disabled:opacity-50 shrink-0"
              >
                {isUpdatingStaff ? 'Adding...' : '+ Grant Admin Access'}
              </button>
            </form>
          </div>

          {/* Current Staff List */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900">Active Authorized Administrators</h3>
            <div className="divide-y divide-slate-100">
              {staffUsers.map((user) => (
                <div key={user.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{user.name || 'Admin User'}</div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                      {user.role}
                    </span>
                    {staffUsers.length > 1 && (
                      <button
                        onClick={() => handleRevokeStaff(user.email)}
                        className="text-rose-600 hover:underline text-[11px] font-bold"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
