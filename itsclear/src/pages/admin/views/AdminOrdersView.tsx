import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { api } from '../../../services/api';
import { Order } from '../../../types';
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
  X,
  CreditCard,
  User,
  FileText,
  AlertCircle,
  Send,
  Printer
} from 'lucide-react';

interface AdminOrdersViewProps {
  onTrackOrder?: (orderId: string) => void;
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({ onTrackOrder }) => {
  const { orders, updateOrderStatus, notify } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Dispatch Modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [pilotName, setPilotName] = useState('Ramesh Kumar (EV Pilot)');
  const [pilotPhone, setPilotPhone] = useState('+91 88581 80597');
  const [vehicleNumber, setVehicleNumber] = useState('UP-32-EV-4419');
  const [deliverySlot, setDeliverySlot] = useState('Within 45 Minutes');
  const [isDispatching, setIsDispatching] = useState(false);

  // Refund Modal
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundOrderTarget, setRefundOrderTarget] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('Customer Quality Request');
  const [isRefunding, setIsRefunding] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.orderStatus !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.shippingAddress?.fullName?.toLowerCase().includes(q);
      const matchPhone = o.shippingAddress?.phone?.includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const handleStageChange = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      updateOrderStatus(orderId, newStatus);
      notify('Fulfillment Status Updated', `Order transitioned to ${newStatus.replace(/_/g, ' ')}.`, 'success');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus } : null);
      }
    } catch (err: any) {
      notify('Update Failed', err.message || 'Could not update order status.', 'error');
    }
  };

  const handleOpenDispatch = (order: Order) => {
    setDispatchOrder(order);
    setPilotName(order.driverName || 'Ramesh Kumar (EV Pilot)');
    setPilotPhone(order.driverPhone || '+91 88581 80597');
    setVehicleNumber(order.vehicleNumber || 'UP-32-EV-4419');
    setDeliverySlot(order.estimatedDelivery || 'Within 45 Minutes');
    setShowDispatchModal(true);
  };

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchOrder) return;

    setIsDispatching(true);
    try {
      const updated = await api.dispatchOrder(dispatchOrder.id, {
        driverName: pilotName,
        driverPhone: pilotPhone,
        vehicleNumber,
        estimatedDelivery: deliverySlot
      });

      updateOrderStatus(dispatchOrder.id, 'out_for_delivery');
      notify('Dispatched via EV Fleet', `Assigned ${pilotName} for order ${dispatchOrder.orderNumber}.`, 'success');
      setShowDispatchModal(false);
      setDispatchOrder(null);
      if (selectedOrder?.id === dispatchOrder.id) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      notify('Dispatch Error', err.message || 'Could not dispatch order.', 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  const handleOpenRefund = (order: Order) => {
    setRefundOrderTarget(order);
    setRefundAmount(Number(order.total || 0));
    setRefundReason('Customer Satisfaction Guarantee');
    setShowRefundModal(true);
  };

  const handleConfirmRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderTarget) return;

    setIsRefunding(true);
    try {
      await api.refundOrder(refundOrderTarget.id, {
        amount: Number(refundAmount),
        reason: refundReason
      });

      notify('Refund Executed', `Processed refund of ₹${refundAmount} for ${refundOrderTarget.orderNumber}.`, 'success');
      setShowRefundModal(false);
      setRefundOrderTarget(null);
    } catch (err: any) {
      notify('Refund Failed', err.message || 'Payment refund could not be completed.', 'error');
    } finally {
      setIsRefunding(false);
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
            <Truck className="w-4 h-4 text-orange-500" />
            <span>Fulfillment &amp; Dispatch Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor stages from Chakki Milling to EV doorstep delivery, pilot assignment &amp; refunds
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. STAGES FILTER & SEARCH BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'confirmed', label: '1. Confirmed' },
            { id: 'milling', label: '2. Milling' },
            { id: 'quality_check', label: '3. Quality Check' },
            { id: 'out_for_delivery', label: '4. Out for Delivery' },
            { id: 'delivered', label: '5. Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'return_requested', label: 'Return Requested' },
            { id: 'returned', label: 'Returned' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order CLR-#, customer name, or phone number..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ORDERS TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No orders found under this fulfillment stage or search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer &amp; Address</th>
                  <th className="py-3 px-3">Items Summary</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Stage Status</th>
                  <th className="py-3 px-3">EV Pilot</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                        <div className="text-[10px] text-slate-400 font-sans">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 truncate max-w-[160px]">
                          {order.shippingAddress?.fullName || 'Guest Customer'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {order.shippingAddress?.city || 'Lucknow'}, {order.shippingAddress?.phone}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">
                          ₹{Number(order.total || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {order.items?.map(i => `${i.quantity}x ${i.product?.name || 'Item'}`).join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {order.paymentMethod?.toUpperCase()} • {order.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStageChange(order.id, e.target.value as any)}
                          className="px-2 py-1 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 focus:outline-hidden"
                        >
                          <option value="confirmed">1. Confirmed</option>
                          <option value="milling">2. Milling</option>
                          <option value="quality_check">3. Quality Check</option>
                          <option value="out_for_delivery">4. Out for Delivery</option>
                          <option value="delivered">5. Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="return_requested">Return Requested</option>
                          <option value="returned">Returned</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {order.driverName ? (
                          <div>
                            <span className="font-bold text-slate-900 block">{order.driverName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{order.vehicleNumber}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenDispatch(order)}
                            className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[10px]"
                          >
                            + Assign EV Pilot
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            title="View Full Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {order.paymentStatus === 'paid' && (
                            <button
                              onClick={() => handleOpenRefund(order)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                              title="Process Refund"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. ORDER DETAIL DRAWER / MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Order Details: {selectedOrder.orderNumber}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <span>Customer Details</span>
                </div>
                <div className="text-slate-700 font-bold">{selectedOrder.shippingAddress?.fullName}</div>
                <div className="text-slate-500">{selectedOrder.shippingAddress?.phone}</div>
                <div className="text-slate-500 font-mono text-[11px]">User ID: {selectedOrder.userId || 'Guest'}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>Shipping Address</span>
                </div>
                <div className="text-slate-700 leading-tight">
                  {selectedOrder.shippingAddress?.addressLine1 || selectedOrder.shippingAddress?.street}
                  {selectedOrder.shippingAddress?.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                </div>
                <div className="text-slate-500">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                </div>
              </div>
            </div>

            {/* Items Checklist */}
            <div className="space-y-2 text-xs">
              <h4 className="font-black text-slate-900 text-xs">Fulfillment Items Checklist</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{item.product?.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Pack: <span className="font-medium text-slate-700">{item.selectedVariant?.size}</span>
                        {item.selectedVariant?.sku && <span className="font-mono text-[10px] ml-2 text-slate-400">SKU: {item.selectedVariant.sku}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900">Qty: {item.quantity}</div>
                      <div className="text-slate-500 text-[11px]">₹{item.selectedVariant?.price * item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount ({selectedOrder.couponCode || 'Promo'}):</span>
                  <span>-₹{selectedOrder.discount}</span>
                </div>
              )}
              {selectedOrder.coinsDiscount && selectedOrder.coinsDiscount > 0 ? (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>ClearCoins Redeemed:</span>
                  <span>-₹{selectedOrder.coinsDiscount}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : `₹${selectedOrder.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-slate-950 font-black text-sm pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span>₹{selectedOrder.total}</span>
              </div>
            </div>

            {/* EV Pilot Status */}
            {selectedOrder.driverName && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-indigo-950">Assigned EV Pilot: {selectedOrder.driverName}</div>
                  <div className="text-[11px] text-indigo-700">Phone: {selectedOrder.driverPhone} • Vehicle: {selectedOrder.vehicleNumber}</div>
                </div>
                <button
                  onClick={() => handleOpenDispatch(selectedOrder)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs"
                >
                  Edit Pilot
                </button>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Packing Slip</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. EV PILOT ASSIGNMENT MODAL
      ───────────────────────────────────────────────────────────── */}
      {showDispatchModal && dispatchOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Assign EV Delivery Pilot</h2>
              <button onClick={() => setShowDispatchModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilot Name *</label>
                <input
                  type="text"
                  required
                  value={pilotName}
                  onChange={e => setPilotName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={pilotPhone}
                  onChange={e => setPilotPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Electric Vehicle Number *</label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Doorstep Window</label>
                <input
                  type="text"
                  value={deliverySlot}
                  onChange={e => setDeliverySlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isDispatching ? 'Assigning...' : 'Confirm EV Dispatch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. REFUND MODAL
      ───────────────────────────────────────────────────────────── */}
      {showRefundModal && refundOrderTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-rose-950">Process Customer Refund</h2>
              <button onClick={() => setShowRefundModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRefund} className="space-y-3">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 leading-tight">
                Order: <span className="font-bold">{refundOrderTarget.orderNumber}</span> • Original Total: <span className="font-black">₹{refundOrderTarget.total}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Refund Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={refundOrderTarget.total}
                  value={refundAmount}
                  onChange={e => setRefundAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-black text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Refund *</label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  placeholder="e.g. Broken packaging or customer return"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRefunding}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isRefunding ? 'Processing...' : 'Execute Refund'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
