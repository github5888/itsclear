const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    default: 'Lucknow',
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  otp_hash: {
    type: String,
    required: true
  },
  expires_at: {
    type: Number,
    required: true,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  resend_available_at: {
    type: Number,
    required: true
  },
  send_count: {
    type: Number,
    default: 1
  },
  window_start_time: {
    type: Number,
    required: true
  },
  ip_address: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // MongoDB TTL index: automatically deletes expired entries after 1 hour
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

const PendingRegistration = mongoose.model('PendingRegistration', pendingRegistrationSchema);

module.exports = PendingRegistration;
