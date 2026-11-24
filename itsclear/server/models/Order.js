const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    index: true,
    default: null
  },
  items: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: null
  },
  coinsUsed: {
    type: Number,
    default: 0
  },
  coinsDiscount: {
    type: Number,
    default: 0
  },
  coinsEarned: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  ecoPackaging: {
    type: Boolean,
    default: true
  },
  gstin: {
    type: String,
    default: ''
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  shippingAddress: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  deliverySlot: {
    type: String,
    default: '2-Hour Farm Express'
  },
  paymentMethod: {
    type: String,
    default: 'upi'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'authorized', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentProvider: {
    type: String,
    default: ''
  },
  providerOrderId: {
    type: String,
    default: '',
    index: true
  },
  providerPaymentId: {
    type: String,
    default: undefined,
    index: true,
    unique: true,
    sparse: true
  },
  orderStatus: {
    type: String,
    enum: ['confirmed', 'milling', 'quality_check', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'],
    default: 'confirmed',
    index: true
  },
  estimatedDelivery: {
    type: String,
    default: 'Within 2 Hours (Express Fresh Chakki Delivery)'
  },
  trackingStep: {
    type: Number,
    default: 1
  },
  driverName: {
    type: String,
    default: ''
  },
  driverPhone: {
    type: String,
    default: ''
  },
  vehicleNumber: {
    type: String,
    default: ''
  },
  millingDate: {
    type: String,
    default: 'Today Fresh Cold-Stone Milled'
  },
  cancelReason: {
    type: String,
    default: ''
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  returnReason: {
    type: String,
    default: ''
  },
  returnRequestedAt: {
    type: Date,
    default: null
  },
  refundStatus: {
    type: String,
    enum: ['none', 'refund_initiated', 'pickup_scheduled', 'refunded'],
    default: 'none'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      ret.status = ret.orderStatus || ret.status;
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

// Backward-compatible virtual status property
orderSchema.virtual('status')
  .get(function() {
    return this.orderStatus;
  })
  .set(function(val) {
    this.orderStatus = val;
  });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
