const crypto = require('crypto');
const Razorpay = require('razorpay');

function isOnlinePaymentConfigured() {
  const keyId = String(process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || '').trim();
  const keyLooksValid = /^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId);
  const secretLooksValid = keySecret.length >= 16 && !/replace|example|your_/i.test(keySecret);
  return keyLooksValid && secretLooksValid;
}

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!isOnlinePaymentConfigured()) {
    const error = new Error('Online payments are temporarily unavailable');
    error.status = 503;
    throw error;
  }
  return { keyId, keySecret };
}

function client() {
  const { keyId, keySecret } = credentials();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const { keySecret } = credentials();
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  const supplied = String(razorpaySignature || '');
  if (expected.length !== supplied.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

async function verifyCapturedPayment(proof, expectedAmountPaise) {
  if (!verifyCheckoutSignature(proof)) return false;
  const payment = await client().payments.fetch(proof.razorpayPaymentId);
  if (payment.order_id !== proof.razorpayOrderId || Number(payment.amount) !== expectedAmountPaise) return false;
  if (payment.status === 'authorized') {
    await client().payments.capture(payment.id, expectedAmountPaise, 'INR');
    return true;
  }
  return payment.status === 'captured';
}

module.exports = { client, credentials, isOnlinePaymentConfigured, verifyCapturedPayment };
