const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  subTitle: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  categoryId: {
    type: String,
    index: true,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  },
  tagline: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  origin: {
    type: String,
    default: 'Sehore, Madhya Pradesh'
  },
  harvestSeason: {
    type: String,
    default: 'Harvest 2026'
  },
  labTestBatch: {
    type: String,
    default: ''
  },
  purityScore: {
    type: Number,
    default: 100
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  rating: {
    type: Number,
    default: 5.0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  images: {
    type: [String],
    default: []
  },
  gallery: {
    type: [{
      id: { type: String, default: () => 'img-' + Date.now().toString(36) },
      url: { type: String, required: true },
      alt: { type: String, default: '' },
      isPrimary: { type: Boolean, default: false },
      sortOrder: { type: Number, default: 0 }
    }],
    default: []
  },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    keywords: { type: [String], default: [] }
  },
  modelType: {
    type: String,
    default: 'atta-kraft'
  },
  themeColor: {
    type: String,
    default: '#0b192c'
  },
  secondaryColor: {
    type: String,
    default: '#d97706'
  },
  flourType: {
    type: String,
    default: ''
  },
  millingSpeed: {
    type: String,
    default: 'Cold Stone Ground (<27°C)'
  },
  rotiSoftnessScore: {
    type: Number,
    default: 10
  },
  extractionMethod: {
    type: String,
    default: ''
  },
  seedVariety: {
    type: String,
    default: ''
  },
  churningMethod: {
    type: String,
    default: ''
  },
  gheeTexture: {
    type: String,
    default: ''
  },
  storageInstructions: {
    type: String,
    default: ''
  },
  smokePoint: {
    type: String,
    default: ''
  },
  comboItems: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  relatedProductIds: {
    type: [String],
    default: []
  },
  customAttributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  composition: {
    type: String,
    default: ''
  },
  packageBadges: {
    type: [String],
    default: []
  },
  variants: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  nutrition: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  benefits: {
    type: [String],
    default: []
  },
  certifications: {
    type: [String],
    default: []
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

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
