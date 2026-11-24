const express = require('express');
const router = express.Router();
const { Order, Product } = require('../models');
const { requireAdmin } = require('../middleware/auth');

// 1. SALES PERFORMANCE REPORT (Admin Only)
router.get('/sales', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => {
      const st = o.orderStatus || o.status;
      return st === 'delivered' || st === 'confirmed';
    });
    const cancelledOrders = orders.filter(o => {
      const st = o.orderStatus || o.status;
      return st === 'cancelled' || st === 'returned' || st === 'refunded';
    });

    const grossRevenue = orders
      .filter(o => {
        const st = o.orderStatus || o.status;
        return st !== 'cancelled' && st !== 'returned' && st !== 'refunded';
      })
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const averageOrderValue = totalOrders > 0 ? Math.round(grossRevenue / (totalOrders - cancelledOrders.length || 1)) : 0;

    // Payment method breakdown
    const paymentMethods = {
      cod: orders.filter(o => o.paymentMethod === 'cod').length,
      online: orders.filter(o => o.paymentMethod === 'razorpay' || o.paymentMethod === 'online').length
    };

    // Daily breakdown for the last 14 days
    const daysMap = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = { date: key, revenue: 0, orders: 0 };
    }

    orders.forEach(o => {
      const st = o.orderStatus || o.status;
      if (st === 'cancelled' || st === 'returned' || st === 'refunded') return;
      const key = new Date(o.createdAt).toISOString().split('T')[0];
      if (daysMap[key]) {
        daysMap[key].revenue += Number(o.total) || 0;
        daysMap[key].orders += 1;
      }
    });

    const dailyTrends = Object.values(daysMap);

    res.json({
      totalOrders,
      completedOrdersCount: completedOrders.length,
      cancelledOrdersCount: cancelledOrders.length,
      grossRevenue,
      averageOrderValue,
      paymentMethods,
      dailyTrends
    });
  } catch (err) {
    console.error('Error fetching sales report:', err);
    res.status(500).json({ error: 'Failed to fetch sales report' });
  }
});

// 2. TOP PRODUCTS & SKUS REPORT (Admin Only)
router.get('/top-products', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { orderStatus: { $nin: ['cancelled', 'returned', 'refunded'] } },
        { status: { $nin: ['cancelled', 'returned', 'refunded'] } }
      ]
    });

    const productSales = {};

    orders.forEach(o => {
      if (!Array.isArray(o.items)) return;
      o.items.forEach(item => {
        const pId = item.product?.id || item.productId || 'unknown';
        const pName = item.product?.name || item.name || 'Unnamed Product';
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || (item.product?.price) || 0;
        const rev = qty * price;

        if (!productSales[pId]) {
          productSales[pId] = {
            id: pId,
            name: pName,
            unitsSold: 0,
            revenue: 0,
            category: item.product?.category || 'grocery'
          };
        }
        productSales[pId].unitsSold += qty;
        productSales[pId].revenue += rev;
      });
    });

    const ranked = Object.values(productSales).sort((a, b) => b.unitsSold - a.unitsSold);

    res.json(ranked);
  } catch (err) {
    console.error('Error fetching top products report:', err);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// 3. INVENTORY HEALTH & VALUATION REPORT (Admin Only)
router.get('/inventory-health', requireAdmin, async (req, res) => {
  try {
    const products = await Product.find();

    let totalCatalogUnits = 0;
    let totalStockValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalVariants = 0;
    const categoryDistribution = {};

    products.forEach(p => {
      const cat = p.category || 'general';
      if (!categoryDistribution[cat]) {
        categoryDistribution[cat] = { count: 0, units: 0 };
      }
      categoryDistribution[cat].count += 1;

      if (Array.isArray(p.variants)) {
        p.variants.forEach(v => {
          totalVariants += 1;
          const stock = Number(v.stockCount) || 0;
          const price = Number(v.price) || 0;
          const threshold = Number(v.lowStockThreshold) || 15;

          totalCatalogUnits += stock;
          totalStockValuation += stock * price;
          categoryDistribution[cat].units += stock;

          if (stock === 0) {
            outOfStockCount += 1;
          } else if (stock <= threshold) {
            lowStockCount += 1;
          }
        });
      }
    });

    res.json({
      totalProducts: products.length,
      totalVariants,
      totalCatalogUnits,
      totalStockValuation,
      lowStockCount,
      outOfStockCount,
      categoryDistribution
    });
  } catch (err) {
    console.error('Error fetching inventory health report:', err);
    res.status(500).json({ error: 'Failed to fetch inventory health report' });
  }
});

module.exports = router;
