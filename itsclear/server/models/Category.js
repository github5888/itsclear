const mongoose = require('mongoose');

const attributeDefinitionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'number', 'select', 'boolean'],
    default: 'text'
  },
  options: {
    type: [String],
    default: []
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const categorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  slug: {
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
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'Package'
  },
  sortOrder: {
    type: Number,
    default: 0,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  eligibleForSubscription: {
    type: Boolean,
    default: true
  },
  attributeSchema: {
    type: [attributeDefinitionSchema],
    default: []
  },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' }
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

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
