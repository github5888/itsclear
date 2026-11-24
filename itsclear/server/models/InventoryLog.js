const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  variantId: {
    type: String,
    required: true,
    index: true
  },
  sku: {
    type: String,
    default: ''
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  changeAmount: {
    type: Number,
    required: true
  },
  actionType: {
    type: String,
    enum: [
      'manual_adjustment',
      'add_stock',
      'reduce_stock',
      'set_stock',
      'damaged_stock',
      'returned_stock',
      'order_sale',
      'order_cancellation_restock',
      'return_restock',
      'bulk_import'
    ],
    required: true,
    index: true
  },
  reason: {
    type: String,
    default: 'Stock adjustment'
  },
  performedBy: {
    userId: { type: String, default: null },
    name: { type: String, default: 'System' },
    email: { type: String, default: 'admin@itsclear.in' }
  },
  orderId: {
    type: String,
    default: null
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

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

module.exports = InventoryLog;
