const express = require('express');
const router = express.Router();
const { Order, User, Product, Coupon, InventoryLog } = require('../models');
const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/auth');
const { buildOrderQuote } = require('../services/orderPricing');
const { verifyCapturedPayment, client: razorpayClient } = require('../services/razorpayService');
const { mongoose } = require('../db');

function formatOrder(order) {
  if (!order) return null;
  return typeof order.toObject === 'function' ? order.toObject() : order;
}

/**
 * Restores inventory stock for all items in an order and writes an audit log.
 */
async function restoreOrderInventory(order, reason = 'cancelled', adminUser = null) {
  if (!order || !Array.isArray(order.items)) return;
  for (const item of order.items) {
    const productId = item?.product?.id || item?.productId;
    const variantId = item?.selectedVariant?.id || item?.variantId;
    const qty = Math.max(1, parseInt(item?.quantity || 1, 10));
    if (productId && variantId) {
      const prod = await Product.findOne({ id: productId });
      if (prod && Array.isArray(prod.variants)) {
        const vIdx = prod.variants.findIndex(v => v.id === variantId);
        if (vIdx !== -1) {
          const prevStock = Number(prod.variants[vIdx].stockCount || 0);
          const newStock = prevStock + qty;
          prod.variants[vIdx].stockCount = newStock;
          prod.variants[vIdx].inStock = true;
          prod.markModified('variants');
          await prod.save();

          try {
            if (InventoryLog) {
              await InventoryLog.create({
                productId,
                variantId,
                productName: prod.name,
                variantSize: prod.variants[vIdx].size,
                action: 'restore',
                previousStock,
                newStock,
                quantityDifference: qty,
                reason: `Order #${order.orderNumber || order.id} ${reason}`,
                adjustedBy: {
                  userId: adminUser?.id || 'system',
                  name: adminUser?.name || 'Admin / System',
                  email: adminUser?.email || 'admin@itsclear.in'
                }
              });
            }
          } catch (logErr) {
            console.error('Failed to log inventory restoration:', logErr.message);
          }
        }
      }
    }
  }
}

// 1. GET ORDERS (Scoped: Admin sees all or filtered, Customer sees ONLY their own orders)
router.get('/', requireAuth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'admin') {
      if (req.query.userId) {
        filter = { userId: req.query.userId };
      }
    } else {
      filter = { userId: req.user.id };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders.map(formatOrder));
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 1B. GET ADMIN REAL-TIME METRICS (Sales, Volumes, Statuses, Low Stock)
router.get('/admin/metrics', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const validOrders = orders.filter(o => o.orderStatus !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalOrdersCount = orders.length;
    const aov = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

    const statusCounts = {
      confirmed: 0,
      milling: 0,
      quality_check: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
      return_requested: 0,
      returned: 0
    };

    orders.forEach(o => {
      if (statusCounts[o.orderStatus] !== undefined) {
        statusCounts[o.orderStatus]++;
      }
    });

    const pendingFulfillment =
      statusCounts.confirmed +
      statusCounts.milling +
      statusCounts.quality_check +
      statusCounts.out_for_delivery;

    // Calculate low stock items count
    const products = await Product.find();
    let lowStockCount = 0;
    products.forEach(p => {
      if (Array.isArray(p.variants)) {
        p.variants.forEach(v => {
          if (Number(v.stockCount || 0) <= Number(v.lowStockThreshold || 20)) {
            lowStockCount++;
          }
        });
      }
    });

    res.json({
      totalRevenue,
      totalOrders: totalOrdersCount,
      averageOrderValue: aov,
      pendingFulfillment,
      completedOrders: statusCounts.delivered,
      statusCounts,
      lowStockCount,
      recentOrders: orders.slice(0, 8).map(formatOrder)
    });
  } catch (err) {
    console.error('Error calculating admin metrics:', err);
    res.status(500).json({ error: 'Failed to calculate metrics' });
  }
});

// 2. GET SINGLE ORDER BY ID OR ORDER NUMBER
router.get('/:idOrNum', optionalAuth, async (req, res) => {
  try {
    const param = req.params.idOrNum;
    const order = await Order.findOne({
      $or: [{ id: param }, { orderNumber: param }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Enforce ownership if order belongs to a registered user
    if (order.userId) {
      if (!req.user || (req.user.role !== 'admin' && req.user.id !== order.userId)) {
        return res.status(403).json({ error: 'You do not have permission to view this order' });
      }
    }

    res.json(formatOrder(order));
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// 3. CREATE NEW ORDER. Identity, pricing, payment, stock and loyalty are server-authoritative.
router.post('/', requireAuth, async (req, res) => {
  let capturedPaymentId = null;
  let session = null;
  try {
    const o = req.body;
    const paymentMethod = ['upi', 'card', 'netbanking', 'cod'].includes(o.paymentMethod) ? o.paymentMethod : null;
    if (!paymentMethod) return res.status(400).json({ error: 'Invalid payment method' });
    if (paymentMethod === 'cod' && process.env.COD_ENABLED === 'false') {
      return res.status(503).json({ error: 'Cash on Delivery is currently unavailable' });
    }
    const quote = await buildOrderQuote(o, req.user.id);

    if (paymentMethod !== 'cod') {
      const proof = o.paymentProof || {};
      const existingPaymentOrder = await Order.findOne({ providerPaymentId: proof.razorpayPaymentId });
      if (existingPaymentOrder) return res.json(formatOrder(existingPaymentOrder));
      const verified = await verifyCapturedPayment({
        razorpayOrderId: proof.razorpayOrderId,
        razorpayPaymentId: proof.razorpayPaymentId,
        razorpaySignature: proof.razorpaySignature
      }, Math.round(quote.total * 100));
      if (!verified) return res.status(402).json({ error: 'Payment could not be verified' });
      capturedPaymentId = proof.razorpayPaymentId;
    }

    const orderId = 'ord-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const orderNum = 'CLR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const coinsEarned = Math.floor(quote.total / 20);

    let created;
    async function performOrderOperations(activeSession) {
      const transactionalQuote = await buildOrderQuote(o, req.user.id, activeSession);
      if (transactionalQuote.total !== quote.total) {
        const changed = new Error('Order total changed. Please review your cart and try again.');
        changed.status = 409;
        throw changed;
      }

      for (const deduction of transactionalQuote.stockDeductions) {
        const queryOpts = {
          arrayFilters: [{ 'variant.id': deduction.variantId, 'variant.stockCount': { $gte: deduction.quantity } }]
        };
        if (activeSession) queryOpts.session = activeSession;

        const result = await Product.updateOne(
          {
            id: deduction.productId,
            variants: { $elemMatch: { id: deduction.variantId, inStock: true, stockCount: { $gte: deduction.quantity } } }
          },
          {
            $inc: { 'variants.$[variant].stockCount': -deduction.quantity }
          },
          queryOpts
        );
        if (result.modifiedCount !== 1) {
          const stockError = new Error('Stock changed during checkout. Please review your cart.');
          stockError.status = 409;
          throw stockError;
        }
      }

      const orderDocuments = await Order.create([{
        id: orderId,
        orderNumber: orderNum,
        userId: req.user.id,
        items: transactionalQuote.normalizedItems,
        subtotal: transactionalQuote.subtotal,
        discount: transactionalQuote.discount,
        couponCode: transactionalQuote.couponCode,
        coinsUsed: transactionalQuote.coinsUsed,
        coinsDiscount: transactionalQuote.coinsDiscount,
        coinsEarned,
        tax: transactionalQuote.tax,
        deliveryFee: transactionalQuote.deliveryFee,
        ecoPackaging: o.ecoPackaging !== undefined ? Boolean(o.ecoPackaging) : true,
        gstin: typeof o.gstin === 'string' ? o.gstin.trim().toUpperCase() : '',
        total: transactionalQuote.total,
        shippingAddress: o.shippingAddress,
        deliverySlot: o.deliverySlot || '2-Hour Farm Express',
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentProvider: paymentMethod === 'cod' ? '' : 'razorpay',
        providerOrderId: o.paymentProof?.razorpayOrderId || '',
        providerPaymentId: o.paymentProof?.razorpayPaymentId || undefined,
        orderStatus: 'confirmed',
        estimatedDelivery: 'Within 2 Hours (Express Fresh Chakki Delivery)',
        trackingStep: 1,
        driverName: '',
        driverPhone: '',
        vehicleNumber: '',
        millingDate: 'Today Fresh Cold-Stone Milled'
      }], activeSession ? { session: activeSession } : undefined);
      created = orderDocuments[0];

      const netCoinDelta = coinsEarned - transactionalQuote.coinsUsed;
      if (netCoinDelta) {
        const userOpts = activeSession ? { session: activeSession } : {};
        const userResult = await User.updateOne(
          { id: req.user.id, clearCoins: { $gte: transactionalQuote.coinsUsed } },
          { $inc: { clearCoins: netCoinDelta } },
          userOpts
        );
        if (userResult.modifiedCount !== 1) {
          const coinError = new Error('Coin balance changed. Please review your order.');
          coinError.status = 409;
          throw coinError;
        }
      }
    }

    try {
      session = await mongoose.startSession();
      await session.withTransaction(async () => {
        await performOrderOperations(session);
      });
    } catch (txnError) {
      // Fallback for standalone MongoDB (Docker container without replica set)
      if (
        txnError.message &&
        (txnError.message.includes('replica set') ||
         txnError.message.includes('Transaction numbers') ||
         txnError.message.includes('standalone'))
      ) {
        if (session) {
          try { await session.endSession(); } catch (e) {}
          session = null;
        }
        await performOrderOperations(null);
      } else {
        throw txnError;
      }
    }

    res.status(201).json(formatOrder(created));
  } catch (err) {
    console.error('Error placing order:', err);
    if (capturedPaymentId) {
      try {
        const payment = await razorpayClient().payments.fetch(capturedPaymentId);
        if (payment.status === 'captured') {
          await razorpayClient().payments.refund(capturedPaymentId, { speed: 'normal', notes: { reason: 'order_creation_failed' } });
        }
      } catch (refundError) {
        console.error('Automatic payment refund failed:', refundError.message);
      }
    }
    res.status(err.status || 500).json({ error: err.message || 'Failed to place order' });
  } finally {
    if (session) await session.endSession();
  }
});

// 4. UPDATE ORDER STATUS (Admin Only)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'milling', 'quality_check', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const stepMap = {
      confirmed: 1,
      milling: 2,
      quality_check: 3,
      out_for_delivery: 4,
      delivered: 5,
      cancelled: 0,
      return_requested: 5,
      returned: 5
    };

    const existing = await Order.findOne({ id: req.params.id });
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updateFields = {
      orderStatus: status,
      trackingStep: stepMap[status] ?? 1,
      updatedAt: new Date()
    };

    // Assign delivery partner when out_for_delivery or allow custom assigned driver
    if (status === 'out_for_delivery' && !existing.driverName) {
      updateFields.driverName = req.body.driverName || process.env.DEFAULT_DRIVER_NAME || 'Ramesh Kumar (EV Pilot)';
      updateFields.driverPhone = req.body.driverPhone || process.env.DEFAULT_DRIVER_PHONE || '+91 88581 80597';
      updateFields.vehicleNumber = req.body.vehicleNumber || process.env.DEFAULT_DRIVER_VEHICLE || 'UP-32-EV-4419';
    }

    if (status === 'delivered' && existing.paymentMethod === 'cod') {
      updateFields.paymentStatus = 'paid';
    }

    if (status === 'returned' && existing.paymentStatus === 'paid') {
      updateFields.refundStatus = 'refunded';
    }

    // Automatically replenish inventory when order is cancelled or returned by admin
    if (
      (status === 'cancelled' || status === 'returned') &&
      existing.orderStatus !== 'cancelled' &&
      existing.orderStatus !== 'returned'
    ) {
      await restoreOrderInventory(existing, status === 'returned' ? 'admin_return' : 'admin_cancellation', req.user);
    }

    const updated = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateFields },
      { new: true }
    );

    res.json(formatOrder(updated));
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// 5. CANCEL ORDER (Customer or Admin - allowed before out_for_delivery)
router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only cancel your own orders' });
    }

    if (!['confirmed', 'milling', 'quality_check'].includes(order.orderStatus)) {
      return res.status(400).json({ error: `Order cannot be cancelled once it is ${order.orderStatus.replace(/_/g, ' ')}` });
    }

    if (order.paymentStatus === 'paid' && order.providerPaymentId) {
      try {
        await razorpayClient().payments.refund(order.providerPaymentId, {
          speed: 'normal',
          notes: { orderId: order.id, reason: reason || 'customer_cancelled' }
        });
      } catch (refundError) {
        console.error('Cancellation refund failed:', refundError.message);
        return res.status(502).json({ error: 'Refund could not be initiated. The order was not cancelled; please contact support.' });
      }
    }

    // Restore stock and record inventory logs for each item
    await restoreOrderInventory(order, reason ? `customer_cancelled: ${reason}` : 'customer_cancelled', req.user);

    // Reverse ClearCoins (refund coinsUsed, deduct coinsEarned)
    if (order.userId) {
      const coinAdjustment = Number(order.coinsUsed || 0) - Number(order.coinsEarned || 0);
      if (coinAdjustment !== 0) {
        await User.findOneAndUpdate(
          { id: order.userId },
          { $inc: { clearCoins: coinAdjustment } }
        );
      }
    }

    const updated = await Order.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          orderStatus: 'cancelled',
          trackingStep: 0,
          cancelReason: reason || 'Cancelled by customer',
          cancelledAt: new Date(),
          refundStatus: order.paymentStatus === 'paid' ? 'refund_initiated' : 'none',
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    res.json(formatOrder(updated));
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// 6. REQUEST RETURN / REPLACEMENT (Customer - only after delivered)
router.post('/:id/return', requireAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only return your own orders' });
    }

    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ error: 'Returns can only be requested after the order is delivered' });
    }

    const updated = await Order.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          orderStatus: 'return_requested',
          returnReason: reason || 'Quality or packaging issue',
          returnRequestedAt: new Date(),
          refundStatus: 'pickup_scheduled',
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    res.json(formatOrder(updated));
  } catch (err) {
    console.error('Error requesting return:', err);
    res.status(500).json({ error: 'Failed to request return' });
  }
});

// 7. ASSIGN EV PILOT / DISPATCH (Admin Only)
router.patch('/:id/dispatch', requireAdmin, async (req, res) => {
  try {
    const { driverName, driverPhone, vehicleNumber, estimatedDelivery } = req.body;
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const updateFields = {
      orderStatus: 'out_for_delivery',
      trackingStep: 4,
      driverName: driverName || 'Ramesh Kumar (EV Pilot)',
      driverPhone: driverPhone || '+91 88581 80597',
      vehicleNumber: vehicleNumber || 'UP-32-EV-4419',
      estimatedDelivery: estimatedDelivery || 'Within 45 Minutes',
      updatedAt: new Date()
    };

    const updated = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateFields },
      { new: true }
    );

    res.json(formatOrder(updated));
  } catch (err) {
    console.error('Error dispatching order:', err);
    res.status(500).json({ error: 'Failed to dispatch order' });
  }
});

// 8. ISSUE REFUND (Admin Only - Razorpay or Manual COD Refund)
router.post('/:id/refund', requireAdmin, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.paymentMethod !== 'cod' && order.providerPaymentId && order.paymentStatus === 'paid') {
      try {
        const refundOpts = {
          speed: 'normal',
          notes: { orderId: order.id, reason: reason || 'admin_issued_refund' }
        };
        if (amount && Number(amount) > 0) {
          refundOpts.amount = Math.round(Number(amount) * 100);
        }
        await razorpayClient().payments.refund(order.providerPaymentId, refundOpts);
      } catch (refundError) {
        console.error('Razorpay refund error:', refundError.message);
        return res.status(502).json({ error: 'Payment gateway refund failed: ' + refundError.message });
      }
    }

    const updated = await Order.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          refundStatus: 'refunded',
          orderStatus: order.orderStatus === 'cancelled' ? 'cancelled' : 'returned',
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    res.json(formatOrder(updated));
  } catch (err) {
    console.error('Error processing refund:', err);
    res.status(500).json({ error: 'Failed to process refund: ' + err.message });
  }
});

module.exports = router;
