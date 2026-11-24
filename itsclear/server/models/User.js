const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  picture: {
    type: String,
    default: ''
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'both'],
    default: 'local'
  },
  phone: {
    type: String,
    required: false,
    default: '',
    trim: true
  },
  city: {
    type: String,
    default: 'Lucknow',
    trim: true
  },
  password: {
    type: String,
    required: false,
    default: null
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  clearCoins: {
    type: Number,
    default: 250
  },
  membershipTier: {
    type: String,
    default: 'Silver Grain'
  },
  isEmailVerified: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
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

const User = mongoose.model('User', userSchema);

module.exports = User;
