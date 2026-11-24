const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { buildOrderQuote } = require('../services/orderPricing');
const { client, credentials } = require('../services/razorpayService');

router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const quote = await buildOrderQuote(req.body, req.user.id);
    const receipt = `clr_${Date.now().toString(36)}_${req.user.id.slice(-8)}`.slice(0, 40);
    const providerOrder = await client().orders.create({
      amount: Math.round(quote.total * 100),
      currency: 'INR',
      receipt,
      notes: { userId: req.user.id }
    });
    res.status(201).json({
      keyId: credentials().keyId,
      providerOrderId: providerOrder.id,
      amount: providerOrder.amount,
      currency: providerOrder.currency,
      quote: {
        subtotal: quote.subtotal,
        discount: quote.discount,
        deliveryFee: quote.deliveryFee,
        tax: quote.tax,
        total: quote.total
      }
    });
  } catch (error) {
    console.error('Payment order creation failed:', error.message);
    res.status(error.status || 500).json({ error: error.message || 'Unable to initialize payment' });
  }
});

module.exports = router;
