import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { Floating3DIcon } from '../../components/three/Floating3DIcon';
import {
  Truck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  MapPin,
  Phone,
  Eye,
  ArrowLeft
} from 'lucide-react';

interface AdminOrdersPageProps {
  onBackToDashboard: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({
  onBackToDashboard,
  onTrackOrder
}) => {
  const { orders, updateOrderStatus } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.orderStatus !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.shippingAddress.fullName.toLowerCase().includes(q);
      const matchPhone = o.shippingAddress.phone.includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors mb-2 block"
          >
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Order Fulfillment & Dispatch Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage stage statuses, assign EV pilots, and monitor real-time fulfillment
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'milling', label: 'Milling' },
            { id: 'quality_check', label: 'Lab Checked' },
            { id: 'out_for_delivery', label: 'Out for Delivery' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'return_requested', label: 'Return Requested' },
            { id: 'returned', label: 'Returned' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, phone..."
            className="w-full sm:w-64 bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-sm"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-xs shadow-sm">
            No orders match the selected filter.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-slate-900 text-base">#{order.orderNumber}</span>
                    <span className="text-xs text-amber-700 font-bold font-mono">
                      (₹{order.total} • {order.paymentMethod.toUpperCase()} {order.paymentStatus.toUpperCase()})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Placed: {new Date(order.createdAt).toLocaleString()} • Slot: <strong className="text-slate-800">{order.deliverySlot}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Status Dropdown */}
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold cursor-pointer focus:outline-none focus:border-amber-500"
                  >
                    <option value="confirmed">1. Confirmed</option>
                    <option value="milling">2. Cold Milling</option>
                    <option value="quality_check">3. Lab Quality Check</option>
                    <option value="out_for_delivery">4. Out for Delivery</option>
                    <option value="delivered">5. Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="return_requested">Return Requested</option>
                    <option value="returned">Returned &amp; Refunded</option>
                  </select>

                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Live Tracking</span>
                  </button>
                </div>
              </div>

              {/* Items in order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {order.items.map((it) => (
                  <div
                    key={it.selectedVariant.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <span className="font-bold text-slate-900 block truncate">{it.product.name}</span>
                    <span className="text-slate-600 text-[11px]">
                      {it.quantity}x {it.selectedVariant.size} • ₹{it.selectedVariant.price * it.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Customer Shipping Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100 gap-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {order.shippingAddress.fullName} — {order.shippingAddress.street}, {order.shippingAddress.city} ({order.shippingAddress.pincode})
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-700 font-mono font-semibold">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{order.shippingAddress.phone}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
