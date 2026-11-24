const { Product, Coupon, User } = require('../models');

function positiveInteger(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function validateAddress(address) {
  const required = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'];
  if (!address || typeof address !== 'object' || required.some(key => !String(address[key] || '').trim())) {
    const error = new Error('A complete shipping address is required');
    error.status = 400;
    throw error;
  }
  if (!/^\d{6}$/.test(String(address.pincode))) {
    const error = new Error('Pincode must contain exactly 6 digits');
    error.status = 400;
    throw error;
  }
  if (!/^\d{10}$/.test(String(address.phone).replace(/\D/g, '').slice(-10))) {
    const error = new Error('Phone number must contain exactly 10 digits');
    error.status = 400;
    throw error;
  }
}

async function buildOrderQuote(payload, userId, session = null) {
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  if (rawItems.length === 0 || rawItems.length > 50) {
    const error = new Error('Order must contain between 1 and 50 items');
    error.status = 400;
    throw error;
  }
  validateAddress(payload.shippingAddress);

  let subtotal = 0;
  const normalizedItems = [];
  const stockDeductions = [];

  for (const item of rawItems) {
    const productId = String(item?.product?.id || '');
    const variantId = String(item?.selectedVariant?.id || '');
    const quantity = positiveInteger(item?.quantity);
    if (quantity > 25) {
      const error = new Error('Maximum quantity per product is 25');
      error.status = 400;
      throw error;
    }

    const query = Product.findOne({ id: productId });
    if (session) query.session(session);
    const product = await query;
    if (!product) {
      const error = new Error(`Product is unavailable: ${productId || 'unknown product'}`);
      error.status = 400;
      throw error;
    }
    const variant = product.variants.find(candidate => candidate.id === variantId);
    if (!variant) {
      const error = new Error(`Variant is unavailable for ${product.name}`);
      error.status = 400;
      throw error;
    }
    if (!variant.inStock || Number(variant.stockCount || 0) < quantity) {
      const error = new Error(`Insufficient stock for ${product.name} (${variant.size})`);
      error.status = 409;
      throw error;
    }

    subtotal += Number(variant.price) * quantity;
    normalizedItems.push({
      product: {
        id: product.id,
        name: product.name,
        images: product.images,
        category: product.category
      },
      selectedVariant: {
        id: variant.id,
        size: variant.size,
        weightInKg: variant.weightInKg,
        price: Number(variant.price),
        originalPrice: Number(variant.originalPrice || variant.price)
      },
      quantity
    });
    stockDeductions.push({ productId, variantId, quantity });
  }

  let couponDiscount = 0;
  let couponCode = null;
  let freeShipping = false;
  if (payload.couponCode) {
    const code = String(payload.couponCode).trim().toUpperCase();
    const query = Coupon.findOne({ code, active: true });
    if (session) query.session(session);
    const coupon = await query;
    if (!coupon) {
      const error = new Error('Coupon is invalid or inactive');
      error.status = 400;
      throw error;
    }
    if (subtotal < Number(coupon.minOrderValue || 0)) {
      const error = new Error(`Coupon requires a minimum order of ₹${coupon.minOrderValue}`);
      error.status = 400;
      throw error;
    }
    couponCode = code;
    freeShipping = code === 'FREESHIP';
    couponDiscount = freeShipping ? 0 : coupon.discountType === 'percentage'
      ? Math.round(subtotal * Number(coupon.discountValue) / 100)
      : Math.min(subtotal, Number(coupon.discountValue));
  }

  let coinsUsed = 0;
  const requestedCoins = Math.max(0, Number.parseInt(payload.coinsUsed || 0, 10));
  if (requestedCoins && userId) {
    const query = User.findOne({ id: userId });
    if (session) query.session(session);
    const user = await query;
    const maxRedeemable = Math.floor((subtotal - couponDiscount) * 0.5);
    coinsUsed = Math.min(requestedCoins, Number(user?.clearCoins || 0), Math.max(0, maxRedeemable));
  }

  const discount = couponDiscount + coinsUsed;
  const afterDiscount = Math.max(0, subtotal - discount);
  const deliveryFee = afterDiscount >= 499 || freeShipping ? 0 : 49;
  const tax = 0;
  const total = afterDiscount + deliveryFee + tax;

  return {
    normalizedItems,
    stockDeductions,
    subtotal,
    discount,
    couponCode,
    coinsUsed,
    coinsDiscount: coinsUsed,
    deliveryFee,
    tax,
    total
  };
}

module.exports = { buildOrderQuote };
