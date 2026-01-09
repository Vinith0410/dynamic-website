const mongoose = require('mongoose');

const ripponSchema = new mongoose.Schema({
    ribbons: {
        type: [String],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Rippon', ripponSchema);
