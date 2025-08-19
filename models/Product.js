const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  dailyEarning: Number,
  category: String,
  image: String,
  description: String,
  status: { type: String, default: 'active' }, // active/inactive
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);