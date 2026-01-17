const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  oldPrice: {
    type: Number
  },
  discount: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  deliveryCharge: {
    type: String,
    default: '0'
  },
  color: {
    type: String
  }
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalQuantity: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Method to calculate totals
cartSchema.methods.calculateTotals = function() {
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

module.exports = mongoose.model('Cart', cartSchema);

