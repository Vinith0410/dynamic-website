const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    image: { type: String, required: true },
    name: { type: String, required: true },
    ribbon: { type: String },
    category: { type: [String], required: true },
    subCategory: { type: [String], required: true },
    description: { type: String, required: true },
    oldPrice: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    delivery: { type: String, default: 'Free delivery • 2-3 days' },
    deliveryCharge: { type: String, default: '0' },
    stock: { type: String, default: 'in' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
