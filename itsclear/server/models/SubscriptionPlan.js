const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    default: 'monthly'
  },
  discountPercentage: {
    type: Number,
    required: true,
    default: 15
  },
  eligibleCategories: {
    type: [String],
    default: ['atta', 'oil', 'ghee', 'combos']
  },
  description: {
    type: String,
    default: 'Regular delivery schedule with subscriber savings.'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
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

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

module.exports = SubscriptionPlan;
