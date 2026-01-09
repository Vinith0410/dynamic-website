const mongoose = require('mongoose');

const DeletedFieldSchema = new mongoose.Schema({
  path: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed,
  type: { type: String, enum: ['text','image'], required: true },
  deletedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeletedField', DeletedFieldSchema);
