const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  productId: {
    type: String,
    required: true,
    index: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    default: 'Delhi NCR',
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    default: 5,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  verified: {
    type: Boolean,
    default: true
  },
  date: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
