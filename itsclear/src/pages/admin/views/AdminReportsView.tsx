import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  RefreshCw,
  Layers,
  CreditCard,
  Truck,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const [salesData, setSalesData] = useState<any | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [inventoryHealth, setInventoryHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      const [sales, top, inv] = await Promise.all([
        api.getReportsSales(),
        api.getReportsTopProducts(),
        api.getReportsInventoryHealth()
      ]);
      setSalesData(sales);
      setTopProducts(top || []);
      setInventoryHealth(inv);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, []);

  const maxDailyRevenue = salesData?.dailyTrends?.reduce((max: number, d: any) => Math.max(max, d.revenue), 1) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-orange-600" />
            <span>Reports &amp; Store Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Real-time financial performance, category health, inventory valuation, and top-selling SKUs.
          </p>
        </div>

        <button
          onClick={loadAllReports}
          disabled={loading}
          className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 font-bold text-sm flex items-center space-x-2 shadow-xs transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {loading ? (
        <div className="p-20 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Calculating financial reports and inventory valuation...</p>
        </div>
      ) : (
        <>
          {/* 1. KEY FINANCIAL KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-950 mt-1">
                ₹{(salesData?.grossRevenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Excludes cancelled/refunded</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Average Order Value</span>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-3xl font-black text-slate-950 mt-1">
                ₹{(salesData?.averageOrderValue || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                Across {salesData?.completedOrdersCount || 0} active orders
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Inventory Valuation</span>
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-950 mt-1">
                ₹{(inventoryHealth?.totalStockValuation || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                {inventoryHealth?.totalCatalogUnits || 0} total units in stock
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Low Stock SKUs</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-3xl font-black text-rose-600 mt-1">
                {inventoryHealth?.lowStockCount || 0}
              </div>
              <div className="text-xs text-rose-600 font-bold mt-1">
                Requires stone milling / replenishment
              </div>
            </div>
          </div>

          {/* 2. 14-DAY REVENUE TREND GRAPH */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-950 text-base">Daily Revenue Trend</h3>
                <p className="text-xs text-slate-500 font-medium">Sales performance over the last 14 days</p>
              </div>
              <div className="text-xs font-bold text-slate-500 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-orange-500 inline-block" />
                  <span>Revenue (₹)</span>
                </span>
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="pt-6 pb-2">
              <div className="h-48 flex items-end justify-between gap-2 border-b border-slate-200 px-2">
                {salesData?.dailyTrends?.map((d: any) => {
                  const heightPercent = Math.max(8, Math.round((d.revenue / maxDailyRevenue) * 100));
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-md z-10">
                        {d.date}: ₹{d.revenue.toLocaleString('en-IN')} ({d.orders} orders)
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[32px] rounded-t-lg transition-all ${
                          d.revenue > 0 ? 'bg-orange-500 group-hover:bg-orange-600' : 'bg-slate-100'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 font-medium rotate-45 sm:rotate-0 origin-left block mt-1">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. TWO COLUMNS: PAYMENT SPLIT & CATEGORY DISTRIBUTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Method Breakdown */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-slate-950 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <span>Payment Gateways &amp; Settlement</span>
              </h3>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Cash on Delivery (COD)</span>
                    <span>{salesData?.paymentMethods?.cod || 0} orders</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.round(
                          ((salesData?.paymentMethods?.cod || 0) / (salesData?.totalOrders || 1)) * 100
                        )}%`
                      }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Online / Razorpay Pre-Paid</span>
                    <span>{salesData?.paymentMethods?.online || 0} orders</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.round(
                          ((salesData?.paymentMethods?.online || 0) / (salesData?.totalOrders || 1)) * 100
                        )}%`
                      }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Stock Distribution */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-slate-950 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Category Inventory Distribution</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {Object.entries(inventoryHealth?.categoryDistribution || {}).map(([cat, info]: any) => (
                  <div key={cat} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                      {cat}
                    </span>
                    <span className="font-black text-lg text-slate-950 mt-0.5 block">{info.units} Units</span>
                    <span className="text-xs text-slate-500 font-medium">{info.count} product(s)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. TOP PERFORMING PRODUCTS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-950 text-base">Top Selling Products</h3>
                <p className="text-xs text-slate-500 font-medium">Ranked by volume sold across customer orders</p>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {topProducts.length} Items Listed
              </span>
            </div>

            {topProducts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm font-medium">
                No orders recorded yet to calculate sales ranks.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50/80 text-xs font-black uppercase text-slate-500 border-b border-slate-200 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Units Sold</th>
                      <th className="py-3 px-4 text-right">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topProducts.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-black text-xs text-slate-400">
                          #{String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-900">{p.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-black text-emerald-700">{p.unitsSold}</td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          ₹{p.revenue.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
