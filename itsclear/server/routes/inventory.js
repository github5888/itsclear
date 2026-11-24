const express = require('express');
const router = express.Router();
const { Product, InventoryLog } = require('../models');
const { requireAdmin } = require('../middleware/auth');

function formatDoc(doc) {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

// 1. GET ALL INVENTORY ITEMS (Flattened list of all product variants with stock)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { lowStockOnly, search } = req.query;
    const products = await Product.find().sort({ name: 1 });

    let inventoryItems = [];
    for (const prod of products) {
      if (!Array.isArray(prod.variants)) continue;
      for (const variant of prod.variants) {
        const threshold = Number(variant.lowStockThreshold || 20);
        const isLowStock = Number(variant.stockCount || 0) <= threshold;

        if (lowStockOnly === 'true' && !isLowStock) continue;

        if (search) {
          const q = search.toLowerCase();
          const matchName = prod.name.toLowerCase().includes(q);
          const matchSku = (variant.sku || '').toLowerCase().includes(q);
          const matchSize = (variant.size || '').toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchSize) continue;
        }

        inventoryItems.push({
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          imageUrl: prod.images?.[0] || '',
          variantId: variant.id,
          sku: variant.sku || (prod.id.replace('itsclear-', '') + '-' + variant.size.replace(/\s+/g, '').toLowerCase()),
          size: variant.size,
          price: variant.price,
          stockCount: Number(variant.stockCount || 0),
          inStock: Boolean(variant.inStock),
          lowStockThreshold: threshold,
          isLowStock
        });
      }
    }

    res.json(inventoryItems);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// 2. ADJUST STOCK COUNT FOR A SPECIFIC VARIANT (Admin Only)
router.post('/adjust', requireAdmin, async (req, res) => {
  try {
    const {
      productId,
      variantId,
      operationType = 'set_stock',
      quantity,
      newStock,
      changeAmount,
      reason,
      sku,
      lowStockThreshold
    } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({ error: 'productId and variantId are required' });
    }

    const prod = await Product.findOne({ id: productId });
    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const vIdx = prod.variants.findIndex(v => v.id === variantId);
    if (vIdx === -1) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    const prevStock = Number(prod.variants[vIdx].stockCount || 0);
    let targetStock;
    let diff;
    let resolvedAction = operationType;

    if (operationType === 'add_stock' || operationType === 'returned_stock') {
      const qty = Math.max(0, Number(quantity || changeAmount || 0));
      diff = qty;
      targetStock = prevStock + qty;
    } else if (operationType === 'reduce_stock' || operationType === 'damaged_stock') {
      const qty = Math.max(0, Number(quantity || Math.abs(changeAmount || 0)));
      diff = -qty;
      targetStock = Math.max(0, prevStock - qty);
    } else if (newStock !== undefined) {
      targetStock = Math.max(0, Number(newStock));
      diff = targetStock - prevStock;
      resolvedAction = 'set_stock';
    } else if (changeAmount !== undefined) {
      diff = Number(changeAmount);
      targetStock = Math.max(0, prevStock + diff);
      resolvedAction = diff >= 0 ? 'add_stock' : 'reduce_stock';
    } else {
      return res.status(400).json({ error: 'Valid quantity, newStock, or changeAmount is required' });
    }

    prod.variants[vIdx].stockCount = targetStock;
    prod.variants[vIdx].inStock = targetStock > 0;
    if (sku) prod.variants[vIdx].sku = sku;
    if (lowStockThreshold !== undefined) {
      prod.variants[vIdx].lowStockThreshold = Number(lowStockThreshold);
    }
    prod.markModified('variants');
    await prod.save();

    // Log the audit event
    const log = await InventoryLog.create({
      productId: prod.id,
      productName: prod.name,
      variantId,
      sku: prod.variants[vIdx].sku || sku || '',
      previousStock: prevStock,
      newStock: targetStock,
      changeAmount: diff,
      actionType: resolvedAction,
      reason: reason || `Inventory update: ${resolvedAction.replace('_', ' ')} (${diff > 0 ? '+' : ''}${diff})`,
      performedBy: {
        userId: req.user?.id || 'admin',
        name: req.user?.name || 'Administrator',
        email: req.user?.email || 'admin@itsclear.in'
      }
    });

    res.json({
      success: true,
      variant: prod.variants[vIdx],
      log: formatDoc(log)
    });
  } catch (err) {
    console.error('Error adjusting inventory:', err);
    res.status(500).json({ error: 'Failed to adjust inventory: ' + err.message });
  }
});

// 2B. BULK ADJUST INVENTORY (Admin Only)
router.post('/bulk-adjust', requireAdmin, async (req, res) => {
  try {
    const { adjustments } = req.body;
    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({ error: 'adjustments array is required' });
    }

    let successCount = 0;
    const errors = [];

    for (const item of adjustments) {
      try {
        const { productId, variantId, operationType = 'set_stock', quantity, reason } = item;
        const prod = await Product.findOne({ id: productId });
        if (!prod) continue;
        const vIdx = prod.variants.findIndex(v => v.id === variantId);
        if (vIdx === -1) continue;

        const prevStock = Number(prod.variants[vIdx].stockCount || 0);
        let targetStock = prevStock;
        let diff = 0;

        if (operationType === 'add_stock' || operationType === 'returned_stock') {
          const qty = Math.max(0, Number(quantity || 0));
          diff = qty;
          targetStock = prevStock + qty;
        } else if (operationType === 'reduce_stock' || operationType === 'damaged_stock') {
          const qty = Math.max(0, Number(quantity || 0));
          diff = -qty;
          targetStock = Math.max(0, prevStock - qty);
        } else {
          targetStock = Math.max(0, Number(quantity || 0));
          diff = targetStock - prevStock;
        }

        prod.variants[vIdx].stockCount = targetStock;
        prod.variants[vIdx].inStock = targetStock > 0;
        prod.markModified('variants');
        await prod.save();

        await InventoryLog.create({
          productId: prod.id,
          productName: prod.name,
          variantId,
          sku: prod.variants[vIdx].sku || '',
          previousStock: prevStock,
          newStock: targetStock,
          changeAmount: diff,
          actionType: operationType,
          reason: reason || 'Bulk inventory adjustment',
          performedBy: {
            userId: req.user?.id || 'admin',
            name: req.user?.name || 'Administrator',
            email: req.user?.email || 'admin@itsclear.in'
          }
        });

        successCount++;
      } catch (err) {
        errors.push({ item, error: err.message });
      }
    }

    res.json({
      success: true,
      processed: successCount,
      total: adjustments.length,
      errors
    });
  } catch (err) {
    console.error('Error in bulk inventory adjust:', err);
    res.status(500).json({ error: 'Failed to process bulk inventory adjustments' });
  }
});

// 3. GET INVENTORY AUDIT LOGS
router.get('/logs', requireAdmin, async (req, res) => {
  try {
    const { productId, variantId, limit = 50 } = req.query;
    const filter = {};
    if (productId) filter.productId = productId;
    if (variantId) filter.variantId = variantId;

    const logs = await InventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(logs.map(formatDoc));
  } catch (err) {
    console.error('Error fetching inventory logs:', err);
    res.status(500).json({ error: 'Failed to fetch inventory logs' });
  }
});

module.exports = router;
