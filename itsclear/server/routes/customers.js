const express = require('express');
const router = express.Router();
const { User, Order } = require('../models');
const { requireAdmin } = require('../middleware/auth');

function formatDoc(doc) {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

// 1. GET ALL CUSTOMERS (Admin Only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (search) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalUsers = await User.countDocuments(filter);

    // Aggregate orders for customer stats (total orders, lifetime spend)
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const uObj = formatDoc(u);
        const orders = await Order.find({
          $or: [
            { userId: u.id },
            { 'customer.email': u.email },
            { 'customer.phone': u.phone }
          ]
        }).select('id total orderStatus status createdAt');

        const totalOrders = orders.length;
        const totalSpent = orders
          .filter(o => {
            const st = o.orderStatus || o.status;
            return st !== 'cancelled' && st !== 'returned' && st !== 'refunded';
          })
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const lastOrder = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        return {
          ...uObj,
          totalOrders,
          totalSpent,
          lastOrderDate: lastOrder ? lastOrder.createdAt : null
        };
      })
    );

    res.json({
      customers: enrichedUsers,
      total: totalUsers,
      page: Number(page),
      totalPages: Math.ceil(totalUsers / Number(limit))
    });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// 2. GET SINGLE CUSTOMER DETAILS (Admin Only)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const orders = await Order.find({
      $or: [
        { userId: user.id },
        { 'customer.email': user.email },
        { 'customer.phone': user.phone }
      ]
    }).sort({ createdAt: -1 });

    const totalSpent = orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    res.json({
      customer: formatDoc(user),
      orders: orders.map(formatDoc),
      metrics: {
        totalOrders: orders.length,
        totalSpent,
        clearCoins: user.clearCoins || 0
      }
    });
  } catch (err) {
    console.error('Error fetching customer detail:', err);
    res.status(500).json({ error: 'Failed to fetch customer detail' });
  }
});

// 3. ADJUST CUSTOMER CLEARCOINS (Admin Only)
router.patch('/:id/coins', requireAdmin, async (req, res) => {
  try {
    const { changeAmount, reason } = req.body;
    if (changeAmount === undefined || isNaN(Number(changeAmount))) {
      return res.status(400).json({ error: 'Valid changeAmount is required' });
    }

    const user = await User.findOne({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const prevCoins = Number(user.clearCoins || 0);
    const newCoins = Math.max(0, prevCoins + Number(changeAmount));

    user.clearCoins = newCoins;
    await user.save();

    console.log(`🪙 ClearCoins adjusted for ${user.email}: ${prevCoins} -> ${newCoins} (${reason || 'Admin adjustment'})`);

    res.json({
      success: true,
      previousCoins: prevCoins,
      newCoins,
      difference: Number(changeAmount),
      reason: reason || 'Admin manual balance adjustment'
    });
  } catch (err) {
    console.error('Error adjusting ClearCoins:', err);
    res.status(500).json({ error: 'Failed to adjust ClearCoins' });
  }
});

module.exports = router;
