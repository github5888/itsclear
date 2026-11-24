const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  lastUpdatedBy: {
    userId: { type: String, default: null },
    name: { type: String, default: 'Admin' },
    email: { type: String, default: 'admin@itsclear.in' }
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

const SiteContent = mongoose.model('SiteContent', siteContentSchema);

module.exports = SiteContent;
