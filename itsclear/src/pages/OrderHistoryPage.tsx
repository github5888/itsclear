import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Floating3DIcon } from '../components/three/Floating3DIcon';
import {
  Package,
  Clock,
  Truck,
  RotateCcw,
  Download,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';

interface OrderHistoryPageProps {
  onTrackOrder: (orderId: string) => void;
  onNavigateToShop: () => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onTrackOrder, onNavigateToShop }) => {
  const { orders, addToCart, setIsCartDrawerOpen, cancelOrder, requestReturn, notify } = useStore();

  const [modalState, setModalState] = useState<{ type: 'cancel' | 'return'; orderId: string; orderNumber: string } | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReorder = (order: typeof orders[0]) => {
    order.items.forEach(item => {
      addToCart(item.product, item.selectedVariant, item.quantity);
    });
    setIsCartDrawerOpen(true);
    notify('Items Added to Basket', 'Re-order items placed in your basket!', 'success');
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalState || !reason.trim()) return;
    setIsSubmitting(true);
    try {
      if (modalState.type === 'cancel') {
        await cancelOrder(modalState.orderId, reason.trim());
      } else {
        await requestReturn(modalState.orderId, reason.trim());
      }
      setModalState(null);
      setReason('');
    } catch {
      // handled in StoreContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadInvoice = (order: typeof orders[0]) => {
    if (order.orderStatus !== 'delivered') {
      notify('Invoice Pending', 'Tax Invoice is generated once the order is delivered.', 'warning');
      return;
    }
    try {
      const doc = new jsPDF();
      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, 210, 42, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('ITSCLEAR', 20, 18);

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('100% Pure Stoneground Chakki Atta • FSSAI: 10022091000124', 20, 26);
      doc.text(`Seller GSTIN: ${import.meta.env.VITE_SELLER_GSTIN || 'Not configured'} • HSN Code: 1101`, 20, 32);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('TAX INVOICE', 145, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice No: INV-${order.orderNumber}`, 145, 25);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 145, 31);

      // Customer info
      doc.text(`Bill To: ${order.shippingAddress.fullName} (${order.shippingAddress.phone})`, 20, 52);
      doc.text(`Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 20, 58);
      if (order.gstin) {
        doc.text(`Buyer GSTIN: ${order.gstin}`, 20, 64);
      }

      // Items
      let y = 76;
      doc.setFillColor(15, 23, 42);
      doc.rect(20, y, 170, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Item Description (HSN 1101)', 24, y + 5.5);
      doc.text('Qty', 120, y + 5.5);
      doc.text('CGST/SGST', 138, y + 5.5);
      doc.text('Amount (INR)', 166, y + 5.5);

      y += 12;
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');

      order.items.forEach((item, idx) => {
        doc.text(`${idx + 1}. ${item.product.name.slice(0, 38)} (${item.selectedVariant.size})`, 24, y);
        doc.text(String(item.quantity), 122, y);
        doc.text('0% (Exempt)', 138, y);
        doc.text(`Rs. ${item.selectedVariant.price * item.quantity}`, 168, y);
        y += 8;
      });

      y += 6;
      doc.text(`Subtotal: Rs. ${order.subtotal}`, 135, y);
      if (order.discount > 0) {
        y += 6;
        doc.text(`Discounts (Coupon/Coins): -Rs. ${order.discount}`, 135, y);
      }
      y += 6;
      doc.text(`Delivery Fee: ${order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee}`}`, 135, y);
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text(`Grand Total: Rs. ${order.total}`, 135, y);

      y += 18;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Computer generated Tax Invoice. Authorized Signatory — itsclear Stoneground Mills.', 20, y);

      doc.save(`TaxInvoice_${order.orderNumber}.pdf`);
      notify('Invoice Downloaded', `Tax Invoice for Order #${order.orderNumber} saved.`, 'success');
    } catch (e) {
      console.error(e);
      notify('Error', 'Could not generate PDF invoice.', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      case 'return_requested':
      case 'returned':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-300 text-xs font-bold">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{status === 'returned' ? 'Returned & Refunded' : 'Return Requested'}</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold animate-pulse">
            <Truck className="w-3.5 h-3.5" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'milling':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 text-xs font-bold">
            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            <span>Cold Stone Milling</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Order Confirmed</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Order History & Farm Shipments
          </h1>
          <p className="text-xs text-amber-700 font-bold mt-0.5">
            Track real-time delivery, cancel or return orders, and download GST invoices
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <Floating3DIcon size="lg" color="gold">
            <Package className="w-6 h-6 text-amber-600" />
          </Floating3DIcon>
          <h3 className="font-black text-lg text-slate-900">No orders placed yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Order stone-ground Khapli or High-Protein Atta to experience live delivery tracking.
          </p>
          <button
            onClick={onNavigateToShop}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const canCancel = ['confirmed', 'milling', 'quality_check'].includes(order.orderStatus);
            const canReturn = order.orderStatus === 'delivered';
            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-5"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <Floating3DIcon size="sm" color="gold">
                      <Package className="w-4 h-4 text-amber-600" />
                    </Floating3DIcon>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(order.orderStatus)}
                    <span className="text-lg font-black text-amber-700">
                      ₹{order.total}
                    </span>
                  </div>
                </div>

                {/* Refund / Cancel Banner if applicable */}
                {order.refundStatus && order.refundStatus !== 'none' && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
                    Refund Status: {order.refundStatus.replace(/_/g, ' ').toUpperCase()}
                    {order.cancelReason ? ` • Reason: ${order.cancelReason}` : ''}
                    {order.returnReason ? ` • Reason: ${order.returnReason}` : ''}
                  </div>
                )}

                {/* Items in this order */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((it) => (
                    <div
                      key={it.selectedVariant.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-orange-600 shadow-sm">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {it.product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {it.quantity}x {it.selectedVariant.size} • ₹{it.selectedVariant.price * it.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    <span>Ship To: </span>
                    <strong className="text-slate-800">
                      {order.shippingAddress.fullName} ({order.shippingAddress.city})
                    </strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canCancel && (
                      <button
                        onClick={() => {
                          setReason('Ordered by mistake');
                          setModalState({ type: 'cancel', orderId: order.id, orderNumber: order.orderNumber });
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}

                    {canReturn && (
                      <button
                        onClick={() => {
                          setReason('Damaged packaging or quality concern');
                          setModalState({ type: 'return', orderId: order.id, orderNumber: order.orderNumber });
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Return / Replace</span>
                      </button>
                    )}

                    {order.orderStatus === 'delivered' && (
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>GST Invoice</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-amber-800 text-xs font-bold transition-all border border-slate-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-Order</span>
                    </button>

                    <button
                      onClick={() => onTrackOrder(order.id)}
                      className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel / Return Reason Modal */}
      {modalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">
              {modalState.type === 'cancel' ? 'Cancel Order' : 'Request Return / Replacement'} #{modalState.orderNumber}
            </h3>
            <form onSubmit={handleConfirmAction} className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Select or enter reason:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              >
                {modalState.type === 'cancel' ? (
                  <>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Need to change delivery address">Need to change delivery address</option>
                    <option value="Found better price / coupon">Found better price / coupon</option>
                    <option value="Expected delivery time too long">Expected delivery time too long</option>
                  </>
                ) : (
                  <>
                    <option value="Damaged packaging or quality concern">Damaged packaging or quality concern</option>
                    <option value="Wrong pack weight / variant delivered">Wrong pack weight / variant delivered</option>
                    <option value="Missing item in package">Missing item in package</option>
                  </>
                )}
              </select>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalState(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : modalState.type === 'cancel' ? 'Confirm Cancel' : 'Submit Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
