const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  query: { type: String, required: true },
  expandedQuery: { type: String, required: true },
  sources: [{ type: mongoose.Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Search', searchSchema);