const express = require('express');
const router = express.Router();
const { SubscriptionPlan } = require('../models');
const { requireAdmin } = require('../middleware/auth');

function formatDoc(doc) {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

// Default subscription plans fallback
const defaultPlans = [
  {
    id: 'sub-weekly',
    name: 'Weekly Fresh Refill',
    frequency: 'weekly',
    discountPercentage: 15,
    eligibleCategories: ['atta', 'oil', 'ghee'],
    description: 'Weekly deliveries milled within 24 hours. Cancel or pause anytime.',
    isActive: true
  },
  {
    id: 'sub-biweekly',
    name: 'Fortnightly Grain Refill',
    frequency: 'biweekly',
    discountPercentage: 12,
    eligibleCategories: ['atta', 'oil', 'ghee'],
    description: 'Bi-weekly delivery schedule ideal for medium-sized households.',
    isActive: true
  },
  {
    id: 'sub-monthly',
    name: 'Monthly Pantry Refill',
    frequency: 'monthly',
    discountPercentage: 10,
    eligibleCategories: ['atta', 'oil', 'ghee', 'combos'],
    description: 'Monthly grocery replenishment with free delivery guaranteed.',
    isActive: true
  }
];

// 1. GET ALL PLANS (Public)
router.get('/', async (req, res) => {
  try {
    let plans = await SubscriptionPlan.find({ isActive: true });
    if (!plans || plans.length === 0) {
      // Seed default plans if empty
      for (const p of defaultPlans) {
        await SubscriptionPlan.findOneAndUpdate({ id: p.id }, { $setOnInsert: p }, { upsert: true });
      }
      plans = await SubscriptionPlan.find({ isActive: true });
    }
    res.json(plans.map(formatDoc));
  } catch (err) {
    console.error('Error fetching subscription plans:', err);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// 2. GET ALL PLANS FOR ADMIN (Includes inactive)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ frequency: 1 });
    res.json(plans.map(formatDoc));
  } catch (err) {
    console.error('Error fetching admin subscription plans:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// 3. CREATE / UPDATE SUBSCRIPTION PLAN (Admin Only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { id, name, frequency, discountPercentage, eligibleCategories, description, isActive } = req.body;
    if (!name || discountPercentage === undefined) {
      return res.status(400).json({ error: 'Plan name and discount percentage are required' });
    }

    const planId = id || 'sub-' + (frequency || 'plan') + '-' + Date.now().toString(36);

    const plan = await SubscriptionPlan.findOneAndUpdate(
      { id: planId },
      {
        id: planId,
        name,
        frequency: frequency || 'monthly',
        discountPercentage: Number(discountPercentage),
        eligibleCategories: Array.isArray(eligibleCategories) ? eligibleCategories : ['atta', 'oil', 'ghee'],
        description: description || '',
        isActive: isActive !== undefined ? Boolean(isActive) : true
      },
      { upsert: true, new: true }
    );

    res.status(201).json(formatDoc(plan));
  } catch (err) {
    console.error('Error saving subscription plan:', err);
    res.status(500).json({ error: 'Failed to save plan' });
  }
});

// 4. DELETE SUBSCRIPTION PLAN (Admin Only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await SubscriptionPlan.deleteOne({ id: req.params.id });
    res.json({ success: true, message: 'Plan removed.' });
  } catch (err) {
    console.error('Error deleting subscription plan:', err);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

module.exports = router;
