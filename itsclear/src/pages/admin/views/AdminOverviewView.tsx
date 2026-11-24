import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { api } from '../../../services/api';
import { AdminMetrics, Order } from '../../../types';
import { AdminModuleTab } from '../../../components/admin/AdminLayout';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Plus,
  Truck,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Banknote,
  Boxes,
  Layers,
  Clock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface AdminOverviewViewProps {
  onNavigate: (module: AdminModuleTab) => void;
  onSelectProduct?: (productId: string) => void;
  onTrackOrder?: (orderId: string) => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  onNavigate,
  onTrackOrder
}) => {
  const { products, orders, updateOrderStatus, updateProduct, notify } = useStore();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminOrderMetrics();
      setMetrics(data);
    } catch (err) {
      // Fallback calculation using local store
      const validOrders = orders.filter(o => o.orderStatus !== 'cancelled');
      const totalRev = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const lowStock = products.filter(p => p.variants?.some(v => Number(v.stockCount || 0) <= 20)).length;

      setMetrics({
        totalRevenue: totalRev,
        totalOrders: orders.length,
        averageOrderValue: validOrders.length > 0 ? Math.round(totalRev / validOrders.length) : 0,
        pendingFulfillment: orders.filter(o => ['confirmed', 'milling', 'quality_check', 'out_for_delivery'].includes(o.orderStatus)).length,
        completedOrders: orders.filter(o => o.orderStatus === 'delivered').length,
        statusCounts: {},
        lowStockCount: lowStock,
        recentOrders: orders.slice(0, 8)
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [orders, products]);

  const handleQuickRestock = async (productId: string, variantId: string) => {
    try {
      await api.adjustInventory({
        productId,
        variantId,
        changeAmount: 50,
        reason: 'Quick +50 Restock from Dashboard'
      });
      notify('Inventory Restocked', '+50 units added to variant.', 'success');
      fetchMetrics();
    } catch (err: any) {
      // Fallback to client update
      const prod = products.find(p => p.id === productId);
      if (prod) {
        const updated = {
          ...prod,
          variants: prod.variants.map(v =>
            v.id === variantId ? { ...v, stockCount: Number(v.stockCount || 0) + 50 } : v
          )
        };
        updateProduct(updated);
        notify('Inventory Restocked', `Added +50 units to ${prod.name}`, 'success');
      }
    }
  };

  const lowStockVariants: Array<{ productId: string; prodName: string; variantId: string; size: string; stock: number }> = [];
  products.forEach(p => {
    p.variants?.forEach(v => {
      if (Number(v.stockCount || 0) <= 25) {
        lowStockVariants.push({
          productId: p.id,
          prodName: p.name,
          variantId: v.id,
          size: v.size,
          stock: Number(v.stockCount || 0)
        });
      }
    });
  });

  const totalRev = metrics?.totalRevenue ?? 0;
  const totalOrders = metrics?.totalOrders ?? orders.length;
  const pendingCount = metrics?.pendingFulfillment ?? 0;
  const lowCount = metrics?.lowStockCount ?? lowStockVariants.length;

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & ACTION BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span>Store Operations Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Store Performance &amp; Pulse
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real sales revenue, fulfillment statuses, and inventory health across Atta, Oil &amp; Ghee
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchMetrics}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('products')}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => onNavigate('orders')}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>Dispatch Center</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. KEY METRIC CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Gross Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950">
              ₹{totalRev.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real Customer Orders</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950">
              {totalOrders}
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-1">
              Avg Order: ₹{metrics?.averageOrderValue || (totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0)}
            </div>
          </div>
        </div>

        {/* Pending Fulfillment */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">In Fulfillment</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950">
              {pendingCount}
            </div>
            <div className="text-[11px] font-bold text-amber-600 mt-1">
              Milling &amp; EV Dispatches
            </div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock SKUs</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950">
              {lowCount}
            </div>
            <div className="text-[11px] font-bold text-rose-600 mt-1">
              {lowCount > 0 ? 'Urgent Restock Required' : 'All SKUs Healthy'}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. TWO COLUMN SECTION: LOW STOCK RADAR & QUICK ACTIONS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Alert Radar */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Inventory Alert Radar</h3>
                <p className="text-[11px] text-slate-500">SKUs with &le; 25 units available in warehouse</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowStockVariants.length === 0 ? (
            <div className="py-8 text-center text-xs font-medium text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              All grain and food variants are safely stocked above minimum thresholds.
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockVariants.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {item.prodName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Pack Size: <span className="font-medium text-slate-700">{item.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-700 text-xs font-black">
                      {item.stock} left
                    </span>
                    <button
                      onClick={() => handleQuickRestock(item.productId, item.variantId)}
                      className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-2xs"
                    >
                      +50 Units
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Operational Quick Actions */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900">Direct Module Controls</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Navigate straight into operations and configuration workflows:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => onNavigate('categories')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200/80 hover:border-orange-200 text-left transition-all group"
              >
                <div className="flex items-center space-x-2.5">
                  <Layers className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-orange-950">Category Management</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600" />
              </button>

              <button
                onClick={() => onNavigate('content')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200/80 hover:border-orange-200 text-left transition-all group"
              >
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-orange-950">Website Content CMS</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600" />
              </button>

              <button
                onClick={() => onNavigate('grain-club')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200/80 hover:border-orange-200 text-left transition-all group"
              >
                <div className="flex items-center space-x-2.5">
                  <Package className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-orange-950">Grain Club Subscriptions</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600" />
              </button>

              <button
                onClick={() => onNavigate('coupons')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200/80 hover:border-orange-200 text-left transition-all group"
              >
                <div className="flex items-center space-x-2.5">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-orange-950">Offers &amp; Coupons</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600" />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Security: SuperAdmin</span>
            <span>Server: Express 5001</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. RECENT ORDERS STREAM
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Live Customer Orders Stream</h3>
            <p className="text-[11px] text-slate-500">Real-time orders received from online and cash-on-delivery checkouts</p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <span>Manage All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No customer orders placed yet. Orders will appear here as soon as customers check out.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.slice(0, 6).map((order) => {
                  const statusColors: Record<string, string> = {
                    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
                    milling: 'bg-amber-50 text-amber-800 border-amber-200',
                    quality_check: 'bg-purple-50 text-purple-700 border-purple-200',
                    out_for_delivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 truncate max-w-[130px]">
                          {order.shippingAddress?.fullName || 'Customer'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {order.shippingAddress?.city || 'Lucknow'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {order.items?.length || 0} product(s)
                      </td>
                      <td className="py-3 px-3 font-black text-slate-900">
                        ₹{Number(order.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {order.paymentMethod?.toUpperCase()} • {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          statusColors[order.orderStatus] || 'bg-slate-100 text-slate-600'
                        }`}>
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigate('orders')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
