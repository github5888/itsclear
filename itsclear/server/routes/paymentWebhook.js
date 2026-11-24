const crypto = require('crypto');
const { Order } = require('../models');

module.exports = async function paymentWebhook(req, res) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(503).json({ error: 'Webhook is not configured' });
    const signature = String(req.headers['x-razorpay-signature'] || '');
    const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(req.body.toString('utf8'));
    const payment = event.payload?.payment?.entity;
    if (payment?.id) {
      const orderQuery = {
        $or: [
          { providerPaymentId: payment.id },
          ...(payment.order_id ? [{ providerOrderId: payment.order_id }] : [])
        ]
      };

      if (event.event === 'payment.captured') {
        await Order.updateOne(
          orderQuery,
          {
            $set: {
              paymentStatus: 'paid',
              providerPaymentId: payment.id,
              orderStatus: 'confirmed',
              updatedAt: new Date()
            }
          }
        );
      } else if (event.event === 'payment.failed') {
        await Order.updateOne(
          { ...orderQuery, paymentStatus: { $ne: 'paid' } },
          { $set: { paymentStatus: 'failed', updatedAt: new Date() } }
        );
      }
    }

    const refund = event.payload?.refund?.entity;
    if (refund?.payment_id && event.event === 'refund.processed') {
      const refundQuery = {
        $or: [
          { providerPaymentId: refund.payment_id },
          ...(refund.notes?.orderId ? [{ id: refund.notes.orderId }] : [])
        ]
      };
      await Order.updateOne(
        refundQuery,
        { $set: { paymentStatus: 'refunded', refundStatus: 'refunded', updatedAt: new Date() } }
      );
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Payment webhook failed:', error.message);
    res.status(400).json({ error: 'Invalid webhook payload' });
  }
};
