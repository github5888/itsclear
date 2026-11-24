const express = require('express');
const router = express.Router();
const { SiteContent } = require('../models');
const { requireAdmin } = require('../middleware/auth');

function formatDoc(doc) {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

// Default fallbacks for core CMS sections
const defaultContentMap = {
  hero_banners: [
    {
      id: 'banner-1',
      badge: 'NATURAL FOOD ESSENTIALS',
      headline: 'Pure Goodness. Everyday Essentials.',
      subtitle: 'Discover premium atta, mustard oil, and desi ghee — thoughtfully selected for your everyday kitchen. Unadulterated, cold-processed, and direct from verified single-origin sources.',
      primaryCtaText: 'Shop All Products',
      primaryCtaLink: '/shop',
      secondaryCtaText: 'Explore Categories',
      secondaryCtaLink: '#categories',
      imageUrl: '/images/products/khapli-single.jpg',
      isActive: true
    }
  ],
  homepage_sections: [
    { id: 'hero', name: 'Hero Carousel', isVisible: true, sortOrder: 1 },
    { id: 'categories', name: 'Shop by Category', isVisible: true, sortOrder: 2 },
    { id: 'featured', name: 'Featured Kitchen Essentials', isVisible: true, sortOrder: 3 },
    { id: 'why_choose', name: 'Why Choose ItsClear', isVisible: true, sortOrder: 4 },
    { id: 'grain_calculator', name: 'Roti Yield Calculator', isVisible: true, sortOrder: 5 },
    { id: 'certifications', name: 'Quality Benchmarks & Certifications', isVisible: true, sortOrder: 6 },
    { id: 'grain_club', name: 'Grain Club Membership Banner', isVisible: true, sortOrder: 7 }
  ],
  announcement_bar: {
    message: 'Fresh Cold Chakki Delivery in Lucknow • Free Shipping ≥ ₹499 • 100% Pure, Cold-Processed & Unadulterated',
    couponBadge: 'Use code CLEAR50 for 10% OFF',
    isVisible: true
  }
};

// 1. GET CMS CONTENT BY KEY (Public & Admin)
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const item = await SiteContent.findOne({ key });
    if (!item) {
      // Return fallback default if key matches known content
      if (defaultContentMap[key]) {
        return res.json({ key, data: defaultContentMap[key], isFallback: true });
      }
      return res.status(404).json({ error: 'Content section not found' });
    }
    res.json(formatDoc(item));
  } catch (err) {
    console.error('Error fetching site content:', err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// 2. UPDATE CMS CONTENT BY KEY (Admin Only)
router.put('/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { data } = req.body;

    if (data === undefined) {
      return res.status(400).json({ error: 'Data payload is required' });
    }

    const updated = await SiteContent.findOneAndUpdate(
      { key },
      {
        key,
        data,
        lastUpdatedBy: {
          userId: req.user.id || null,
          name: req.user.name || 'Admin',
          email: req.user.email || 'admin@itsclear.in'
        }
      },
      { upsert: true, new: true }
    );

    res.json(formatDoc(updated));
  } catch (err) {
    console.error('Error saving site content:', err);
    res.status(500).json({ error: 'Failed to save content: ' + err.message });
  }
});

module.exports = router;
