const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define what each item within an order looks like
const orderItemSchema = new Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false }); // Don't create separate _id for subdocuments


const orderSchema = new Schema({
  items: [orderItemSchema], // An array of items based on the schema above
  totalAmount: { type: Number, required: true },
  status: { type: String, required: true, default: 'Pending', enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'] } // Possible order statuses
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
  collection: 'orders' // Explicitly set the collection name
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
