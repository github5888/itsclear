const express = require('express');
const router = express.Router();
const { Review, Product, Order } = require('../models');
const { optionalAuth } = require('../middleware/auth');

// GET /api/reviews (can filter by productId)
router.get('/', async (req, res) => {
  try {
    const { productId } = req.query;
    const filter = productId ? { productId } : {};
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews.map(r => (typeof r.toObject === 'function' ? r.toObject() : r)));
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews -> submit new review (verifies Certified Buyer if logged-in user has delivered order)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { productId, author, city, rating, comment } = req.body;
    if (!productId || !author || !comment) {
      return res.status(400).json({ error: 'ProductId, author, and comment are required' });
    }

    let isCertifiedBuyer = false;
    if (req.user && req.user.id) {
      const deliveredOrder = await Order.findOne({
        userId: req.user.id,
        orderStatus: 'delivered',
        'items.product.id': productId
      });
      isCertifiedBuyer = Boolean(deliveredOrder);
    }

    const id = 'rev-' + Date.now().toString(36);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const created = await Review.create({
      id,
      productId,
      author: author.trim(),
      city: city || 'Lucknow',
      rating: Math.min(5, Math.max(1, Number(rating || 5))),
      comment: comment.trim(),
      verified: isCertifiedBuyer,
      date: dateStr
    });

    // Update product review count and average rating
    const allReviews = await Review.find({ productId });
    if (allReviews.length > 0) {
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      const roundedRating = Math.round(avg * 10) / 10;
      await Product.findOneAndUpdate(
        { id: productId },
        {
          $set: { rating: roundedRating },
          $inc: { reviewCount: 1 }
        }
      );
    }

    res.status(201).json(typeof created.toObject === 'function' ? created.toObject() : created);
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

module.exports = router;
