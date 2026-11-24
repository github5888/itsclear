const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'flat']
  },
  discountValue: {
    type: Number,
    required: true
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  validFrom: {
    type: Date,
    default: null
  },
  validUntil: {
    type: Date,
    default: null
  },
  usageLimit: {
    type: Number,
    default: 0
  },
  usedCount: {
    type: Number,
    default: 0
  },
  applicableCategories: {
    type: [String],
    default: []
  },
  canStackWithCoins: {
    type: Boolean,
    default: false
  },
  canStackWithCombos: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
