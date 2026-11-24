const express = require('express');
const router = express.Router();
const { Setting, User } = require('../models');
const { requireAdmin } = require('../middleware/auth');

function formatDoc(doc) {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

// Default settings blueprint
const defaultStoreSettings = {
  delivery: {
    freeDeliveryThreshold: 499,
    standardDeliveryFee: 49,
    expressDeliveryFee: 79,
    deliverySlots: [
      '2-Hour Farm Express (Lucknow)',
      'Morning Slot (7 AM - 11 AM)',
      'Evening Slot (4 PM - 8 PM)',
      'Standard Next-Day Dispatch'
    ],
    serviceableCities: ['Lucknow', 'Kanpur', 'Ayodhya', 'Delhi NCR']
  },
  payments: {
    onlinePaymentsEnabled: true,
    codEnabled: true,
    codMaxOrderValue: 5000,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ? '••••••••' + process.env.RAZORPAY_KEY_ID.slice(-4) : 'Configured via .env'
  },
  storeProfile: {
    brandName: 'itsclear™ Natural Food Products',
    legalEntityName: 'Infinity Technology / ItsClear Foods Pvt. Ltd.',
    gstin: '09AAECI1234F1Z5',
    fssaiLicense: '12724055000123',
    supportPhone: '+91 88581 80597',
    supportEmail: 'care@itsclear.in',
    warehouseAddress: 'Plot 14, Industrial Area, Kursi Road, Lucknow, UP - 226026'
  },
  grainClub: {
    coinsPerHundredSpent: 5,
    maxCoinsRedeemPercent: 20
  }
};

// 1. GET ALL STORE SETTINGS (Admin Only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const settingsDocs = await Setting.find();
    const config = { ...defaultStoreSettings };

    for (const doc of settingsDocs) {
      if (doc.key && doc.value !== undefined) {
        config[doc.key] = { ...config[doc.key], ...doc.value };
      }
    }

    res.json(config);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// 2. UPDATE A SPECIFIC SETTINGS GROUP (Admin Only)
router.put('/:group', requireAdmin, async (req, res) => {
  try {
    const { group } = req.params;
    const value = req.body;

    if (!['delivery', 'payments', 'storeProfile', 'grainClub'].includes(group)) {
      return res.status(400).json({ error: 'Invalid settings group' });
    }

    const updated = await Setting.findOneAndUpdate(
      { key: group },
      { key: group, value, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, group, value: updated.value });
  } catch (err) {
    console.error('Error updating settings group:', err);
    res.status(500).json({ error: 'Failed to update settings: ' + err.message });
  }
});

// 3. GET STAFF / ADMIN USERS LIST (Admin Only)
router.get('/staff/users', requireAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json(admins.map(formatDoc));
  } catch (err) {
    console.error('Error fetching staff users:', err);
    res.status(500).json({ error: 'Failed to fetch staff accounts' });
  }
});

// 4. PROMOTE / DEMOTE USER ROLE (Admin Only)
router.patch('/staff/role', requireAdmin, async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !['admin', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Valid email and role (admin/customer) are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User with this email not found' });
    }

    res.json({ success: true, user: formatDoc(user) });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router;
