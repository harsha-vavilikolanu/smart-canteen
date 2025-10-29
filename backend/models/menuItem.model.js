const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const menuItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: false },
  category: { type: String, required: true }
}, {
  timestamps: true,
  collection: 'menuitems' //  <-- ADD THIS LINE
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;