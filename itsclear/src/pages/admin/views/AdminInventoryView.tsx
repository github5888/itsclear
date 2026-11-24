import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { api } from '../../../services/api';
import { InventoryItem, InventoryLog } from '../../../types';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  History,
  CheckCircle2,
  RefreshCw,
  Plus,
  Minus,
  ArrowRight,
  X,
  Save,
  Loader2
} from 'lucide-react';

export const AdminInventoryView: React.FC = () => {
  const { notify } = useStore();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Stock Adjustment Modal
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [operationType, setOperationType] = useState<string>('set_stock');
  const [targetStock, setTargetStock] = useState<number>(0);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('Routine Warehouse Restock');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Audit Log Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<InventoryLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [activeLogItem, setActiveLogItem] = useState<InventoryItem | null>(null);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getInventory(lowStockOnly, searchQuery);
      setInventory(data);
    } catch (err: any) {
      notify('Inventory Load Error', err.message || 'Could not fetch inventory.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [lowStockOnly]);

  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustItem(item);
    setOperationType('set_stock');
    setTargetStock(item.stockCount);
    setAdjustQuantity(10);
    setAdjustReason('Routine Warehouse Restock');
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;

    setIsAdjusting(true);
    try {
      let payload: any = {
        productId: adjustItem.productId,
        variantId: adjustItem.variantId,
        operationType,
        reason: adjustReason,
        sku: adjustItem.sku
      };

      if (operationType === 'set_stock') {
        payload.newStock = Number(targetStock);
      } else {
        payload.quantity = Number(adjustQuantity);
      }

      await api.adjustInventory(payload);

      notify('Stock Adjusted', `Successfully updated stock for ${adjustItem.productName} (${adjustItem.size}).`, 'success');
      setAdjustItem(null);
      loadInventory();
    } catch (err: any) {
      notify('Adjustment Failed', err.message || 'Could not update stock.', 'error');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleOpenLogs = async (item?: InventoryItem) => {
    setActiveLogItem(item || null);
    setShowLogModal(true);
    setIsLoadingLogs(true);
    try {
      const logs = await api.getInventoryLogs(item?.productId, item?.variantId);
      setAuditLogs(logs);
    } catch (err: any) {
      notify('Audit Log Error', err.message || 'Could not load inventory audit trail.', 'error');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      item.productName.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.size.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const lowStockCount = inventory.filter(i => i.isLowStock).length;

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & ACTION
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4 text-orange-500" />
            <span>Stock Ledger &amp; Concurrency</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            SKU tracking, real-time stock deductions, low-stock radar, and adjustment audit logs
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => handleOpenLogs()}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Audit Trail Log</span>
          </button>

          <button
            onClick={loadInventory}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            title="Refresh inventory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTERS & METRICS STRIP
      ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setLowStockOnly(prev => !prev)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              lowStockOnly
                ? 'bg-rose-500 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Only Low Stock ({lowStockCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by SKU, item name, pack..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. INVENTORY SKU TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            <span>Loading SKU inventory ledger...</span>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No inventory items found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Pack Size</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Available Units</th>
                  <th className="py-3 px-3">Health</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredInventory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {item.sku}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 truncate max-w-[220px]">
                        {item.productName}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black uppercase">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {item.size}
                    </td>

                    <td className="py-3 px-3 font-black text-slate-900">
                      ₹{item.price}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-sm font-black text-slate-900">
                        {item.stockCount}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">units</span>
                    </td>

                    <td className="py-3 px-3">
                      {item.isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black flex items-center space-x-1 w-max">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Low Stock (&le; {item.lowStockThreshold})</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black w-max block">
                          Adequate
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenLogs(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                          title="View Audit Trail"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] shadow-2xs transition-colors"
                        >
                          Adjust
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
          4. STOCK ADJUSTMENT MODAL
      ───────────────────────────────────────────────────────────── */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Adjust SKU Inventory</h2>
              <button onClick={() => setAdjustItem(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-xs">{adjustItem.productName}</div>
                <div className="text-[11px] text-slate-500">Pack: <span className="font-bold text-slate-700">{adjustItem.size}</span></div>
                <div className="font-mono text-[10px] text-slate-400">SKU: {adjustItem.sku}</div>
              </div>

              {/* Operation Type Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Operation Type</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'set_stock', label: 'Set Stock' },
                    { id: 'add_stock', label: '+ Add Stock' },
                    { id: 'reduce_stock', label: '- Reduce' },
                    { id: 'damaged_stock', label: 'Damaged' },
                    { id: 'returned_stock', label: '+ Return' }
                  ].map(op => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setOperationType(op.id)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                        operationType === op.id
                          ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {operationType === 'set_stock' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Stock Quantity *</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setTargetStock(s => Math.max(0, s - 10))}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      required
                      value={targetStock}
                      onChange={e => setTargetStock(Number(e.target.value))}
                      className="w-full py-2 px-3 text-center text-lg font-black text-slate-900 border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setTargetStock(s => s + 50)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Units to {operationType.includes('reduce') || operationType.includes('damage') ? 'Deduct' : 'Add'} *
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setAdjustQuantity(q => Math.max(1, q - 5))}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      required
                      value={adjustQuantity}
                      onChange={e => setAdjustQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full py-2 px-3 text-center text-lg font-black text-slate-900 border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setAdjustQuantity(q => q + 25)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Current: <strong>{adjustItem.stockCount}</strong> &rarr; Result: <strong>
                      {operationType.includes('reduce') || operationType.includes('damage')
                        ? Math.max(0, adjustItem.stockCount - adjustQuantity)
                        : adjustItem.stockCount + adjustQuantity}
                    </strong> units
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Adjustment *</label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Routine Warehouse Restock">Routine Warehouse Restock</option>
                  <option value="Physical Audit Discrepancy Correction">Physical Audit Discrepancy Correction</option>
                  <option value="Damaged In Transit Write-off">Damaged In Transit Write-off</option>
                  <option value="Customer Return Restock">Customer Return Restock</option>
                  <option value="Batch Fresh Cold Milling Addition">Batch Fresh Cold Milling Addition</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isAdjusting ? 'Updating...' : 'Save Stock'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. AUDIT LOG MODAL
      ───────────────────────────────────────────────────────────── */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">Inventory Audit History</h2>
                <p className="text-[11px] text-slate-500">
                  {activeLogItem ? `Logs for: ${activeLogItem.productName} (${activeLogItem.sku})` : 'Recent adjustments and sales deductions across all SKUs'}
                </p>
              </div>
              <button onClick={() => setShowLogModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingLogs ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                  <span>Loading audit log entries...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No inventory adjustment logs recorded yet. Logs will generate automatically upon stock adjustments or customer sales.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Item / SKU</th>
                      <th className="py-2.5 px-3">Change</th>
                      <th className="py-2.5 px-3">Stock Before &rarr; After</th>
                      <th className="py-2.5 px-3">Type &amp; Reason</th>
                      <th className="py-2.5 px-3">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {log.productName}
                          <span className="block font-mono text-[10px] text-slate-400">{log.sku}</span>
                        </td>
                        <td className="py-2.5 px-3 font-black">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                            log.changeAmount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {log.previousStock} &rarr; <span className="font-bold text-slate-900">{log.newStock}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800 capitalize text-[11px]">{log.actionType.replace(/_/g, ' ')}</div>
                          <div className="text-[10px] text-slate-400">{log.reason}</div>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                          {log.performedBy?.email || 'System'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
