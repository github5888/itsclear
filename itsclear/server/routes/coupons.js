const express = require('express');
const router = express.Router();
const { Coupon } = require('../models');
const { requireAdmin } = require('../middleware/auth');

function formatDoc(doc) {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

// 1. GET ACTIVE COUPONS (Public)
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      active: true,
      $or: [
        { validUntil: null },
        { validUntil: { $gte: now } }
      ]
    }).sort({ createdAt: -1 });
    res.json(coupons.map(formatDoc));
  } catch (err) {
    console.error('Error fetching coupons:', err);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// 2. GET ALL COUPONS FOR ADMIN (Includes inactive, expired, and usage metrics)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons.map(formatDoc));
  } catch (err) {
    console.error('Error fetching admin coupons:', err);
    res.status(500).json({ error: 'Failed to fetch admin coupons' });
  }
});

// 3. CREATE OR UPDATE COUPON (Admin Only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      description,
      validFrom,
      validUntil,
      usageLimit,
      applicableCategories,
      canStackWithCoins,
      canStackWithCombos,
      active
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: 'Code, discountType, and discountValue are required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const updateData = {
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      description: description || '',
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      usageLimit: Number(usageLimit || 0),
      applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : [],
      canStackWithCoins: Boolean(canStackWithCoins),
      canStackWithCombos: Boolean(canStackWithCombos),
      active: active !== undefined ? Boolean(active) : true
    };

    const coupon = await Coupon.findOneAndUpdate(
      { code: cleanCode },
      { $set: updateData },
      { upsert: true, new: true }
    );

    res.status(201).json(formatDoc(coupon));
  } catch (err) {
    console.error('Error saving coupon:', err);
    res.status(500).json({ error: 'Failed to save coupon: ' + err.message });
  }
});

// 4. TOGGLE COUPON STATUS (Admin Only)
router.patch('/:code/toggle', requireAdmin, async (req, res) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

    coupon.active = !coupon.active;
    await coupon.save();
    res.json(formatDoc(coupon));
  } catch (err) {
    console.error('Error toggling coupon:', err);
    res.status(500).json({ error: 'Failed to toggle coupon' });
  }
});

// 5. DELETE COUPON (Admin Only)
router.delete('/:code', requireAdmin, async (req, res) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const deleted = await Coupon.findOneAndDelete({ code: cleanCode });
    if (!deleted) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ success: true, message: `Coupon ${cleanCode} deleted.` });
  } catch (err) {
    console.error('Error deleting coupon:', err);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

module.exports = router;
