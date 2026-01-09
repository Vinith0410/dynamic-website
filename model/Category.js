const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryImage: { type: String, required: true },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subCategories: {
        type: [String],
        required: true
    }
});

module.exports = mongoose.model('Category', categorySchema);
