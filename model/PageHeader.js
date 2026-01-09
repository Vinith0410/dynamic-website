const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    navigation_title: String,
    pages: Object
});

module.exports = mongoose.model('PageHeader', pageSchema);
