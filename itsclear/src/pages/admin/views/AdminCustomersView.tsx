import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
  Users,
  Search,
  Coins,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  X,
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role?: string;
  clearCoins?: number;
  membershipTier?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
}

export const AdminCustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  // ClearCoins adjustment modal state
  const [coinModalCustomer, setCoinModalCustomer] = useState<CustomerItem | null>(null);
  const [coinAdjustmentType, setCoinAdjustmentType] = useState<'add' | 'deduct'>('add');
  const [coinAmount, setCoinAmount] = useState<number>(100);
  const [coinReason, setCoinReason] = useState<string>('Loyalty appreciation reward');
  const [coinUpdating, setCoinUpdating] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers({ search, page, limit: 30 });
      setCustomers(res.customers || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setErrorToast(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleOpenProfile = async (customer: CustomerItem) => {
    try {
      setProfileLoading(true);
      setSelectedCustomer(customer);
      const res = await api.getCustomerDetail(customer.id);
      setSelectedCustomer(res.customer);
      setCustomerOrders(res.orders || []);
    } catch (err: any) {
      setErrorToast(err.message || 'Failed to load customer profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveCoins = async () => {
    if (!coinModalCustomer) return;
    try {
      setCoinUpdating(true);
      const changeAmount = coinAdjustmentType === 'add' ? coinAmount : -coinAmount;
      const res = await api.adjustCustomerCoins(coinModalCustomer.id, {
        changeAmount,
        reason: coinReason
      });

      setSuccessToast(`ClearCoins updated! New balance: ${res.newCoins} coins.`);
      setCoinModalCustomer(null);
      fetchCustomers();

      if (selectedCustomer && selectedCustomer.id === coinModalCustomer.id) {
        setSelectedCustomer({ ...selectedCustomer, clearCoins: res.newCoins });
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Failed to adjust ClearCoins');
    } finally {
      setCoinUpdating(false);
    }
  };

  // Aggregated quick stats
  const totalSpendAll = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const totalOrdersAll = customers.reduce((acc, c) => acc + (c.totalOrders || 0), 0);
  const totalCoinsAll = customers.reduce((acc, c) => acc + (c.clearCoins || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold text-sm">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorToast && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold text-sm">{errorToast}</span>
          </div>
          <button onClick={() => setErrorToast(null)} className="text-rose-700 hover:text-rose-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-orange-600" />
            <span>Customer Roster &amp; Profiles</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Manage customer accounts, lifetime order history, delivery addresses, and ClearCoins loyalty balances.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 font-bold text-sm flex items-center space-x-2 shadow-xs transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-slate-950 mt-1">{total}</div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">Registered accounts in MongoDB</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-950 mt-1">{totalOrdersAll}</div>
          <div className="text-xs text-emerald-700 font-medium mt-0.5">Across current roster</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Lifetime Spend</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-950 mt-1">₹{totalSpendAll.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">Delivered &amp; active purchases</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>ClearCoins In Circulation</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalCoinsAll.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">Valued at ₹{(totalCoinsAll * 0.2).toFixed(0)}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone number..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all shadow-xs shrink-0"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
                setTimeout(fetchCustomers, 50);
              }}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Loading customer roster...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Customers Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-black uppercase text-slate-500 border-b border-slate-200/90 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Location &amp; Tier</th>
                  <th className="py-3.5 px-4 text-center">ClearCoins</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4 text-right">Lifetime Spend</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-black text-sm flex items-center justify-center border border-orange-200 shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {c.role === 'admin' && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black border border-purple-200">
                                Admin
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Joined {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center space-x-1.5 text-slate-800 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center space-x-1.5 text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs font-bold text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{c.city || 'Lucknow'}</span>
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          {c.membershipTier || 'Silver Grain'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setCoinModalCustomer(c)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-black text-xs transition-colors"
                        title="Click to adjust ClearCoins"
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span>{c.clearCoins || 0}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-slate-900">{c.totalOrders}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setCoinModalCustomer(c)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-amber-200 text-amber-800 hover:bg-amber-50 transition-colors"
                        >
                          Coins
                        </button>
                        <button
                          onClick={() => handleOpenProfile(c)}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-950 hover:bg-orange-600 text-white transition-colors"
                        >
                          View
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

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-orange-100 border border-orange-200 text-orange-700 font-black text-lg flex items-center justify-center">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-950 text-lg leading-tight">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Customer ID: {selectedCustomer.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Email Address</span>
                  <span className="font-extrabold text-xs text-slate-900 break-all">{selectedCustomer.email}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone</span>
                  <span className="font-extrabold text-xs text-slate-900">{selectedCustomer.phone || 'N/A'}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">City</span>
                  <span className="font-extrabold text-xs text-slate-900">{selectedCustomer.city || 'Lucknow'}</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">ClearCoins</span>
                  <span className="font-black text-base text-amber-900">{selectedCustomer.clearCoins || 0}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Orders</span>
                  <span className="font-black text-base text-emerald-900">{customerOrders.length}</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Lifetime Spend</span>
                  <span className="font-black text-base text-blue-900">
                    ₹{customerOrders
                      .filter(o => {
                        const st = o.orderStatus || o.status;
                        return st !== 'cancelled' && st !== 'returned' && st !== 'refunded';
                      })
                      .reduce((sum, o) => sum + (Number(o.total) || 0), 0)
                      .toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                  <span>Order History ({customerOrders.length})</span>
                </h4>

                {profileLoading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-6 h-6 text-orange-500 animate-spin mx-auto" />
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-400 font-medium">No previous orders found for this customer.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {customerOrders.map(o => (
                      <div
                        key={o.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-xs text-slate-900">{o.id}</span>
                            {(() => {
                              const st = o.orderStatus || o.status || 'confirmed';
                              return (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  st === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                  st === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                  st === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {st.replace(/_/g, ' ')}
                                </span>
                              );
                            })()}
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })} • {o.items?.length || 0} item(s)
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-sm text-slate-950 block">₹{Number(o.total || 0).toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{o.paymentMethod || 'COD'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setCoinModalCustomer(selectedCustomer);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Adjust ClearCoins</span>
              </button>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust ClearCoins Modal */}
      {coinModalCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-950 text-base">Adjust ClearCoins</h3>
                  <p className="text-xs text-slate-500 font-medium">{coinModalCustomer.name}</p>
                </div>
              </div>
              <button
                onClick={() => setCoinModalCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Balance */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">Current Balance:</span>
              <span className="font-black text-lg text-amber-950">{coinModalCustomer.clearCoins || 0} Coins</span>
            </div>

            {/* Action Type: Add or Deduct */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCoinAdjustmentType('add')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all ${
                  coinAdjustmentType === 'add'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Credit (Add)</span>
              </button>

              <button
                type="button"
                onClick={() => setCoinAdjustmentType('deduct')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all ${
                  coinAdjustmentType === 'deduct'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Debit (Deduct)</span>
              </button>
            </div>

            {/* Coins Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Number of Coins
              </label>
              <input
                type="number"
                min="1"
                value={coinAmount}
                onChange={(e) => setCoinAmount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Reason / Internal Note
              </label>
              <input
                type="text"
                value={coinReason}
                onChange={(e) => setCoinReason(e.target.value)}
                placeholder="e.g. Loyalty appreciation, order delay refund"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            {/* Live Calculation Preview */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 flex items-center justify-between">
              <span>New Resulting Balance:</span>
              <strong className="text-slate-900 font-black">
                {coinAdjustmentType === 'add'
                  ? (coinModalCustomer.clearCoins || 0) + coinAmount
                  : Math.max(0, (coinModalCustomer.clearCoins || 0) - coinAmount)}{' '}
                Coins
              </strong>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCoinModalCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCoins}
                disabled={coinUpdating}
                className="px-5 py-2 bg-slate-950 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                {coinUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Coins className="w-3.5 h-3.5" />}
                <span>Confirm Adjustment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
