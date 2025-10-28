const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // We'll run our backend on this port

// --- Middleware ---
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Allow server to read JSON from request bodies

// --- In-Memory "Database" ---

// The menu items our canteen offers
const menu = [
  { id: 1, name: 'Vegetable Samosa', price: 1.50, category: 'Appetizer' },
  { id: 2, name: 'Chicken Biryani', price: 8.99, category: 'Main Course' },
  { id: 3, name: 'Paneer Tikka Masala', price: 7.50, category: 'Main Course' },
  { id: 4, name: 'Mango Lassi', price: 3.00, category: 'Drink' },
  { id: 5, name: 'Coke', price: 1.25, category: 'Drink' },
];

// A list to store incoming orders
let orders = [];
let orderIdCounter = 1;

// --- API Endpoints (Our Routes) ---

/**
 * @route   GET /api/menu
 * @desc    Get all menu items
 */
app.get('/api/menu', (req, res) => {
  console.log('GET /api/menu hit');
  res.json(menu);
});

/**
 * @route   POST /api/order
 * @desc    Place a new order
 */
app.post('/api/order', (req, res) => {
  const { items, total } = req.body;

  if (!items || !total || items.length === 0) {
    return res.status(400).json({ message: 'Order is incomplete.' });
  }

  const newOrder = {
    id: orderIdCounter++,
    items: items,
    total: total,
    status: 'Received',
    timestamp: new Date().toISOString()
  };

  orders.push(newOrder);
  console.log('POST /api/order hit. New order:', newOrder);
  res.status(201).json({ message: 'Order received!', order: newOrder });
});

/**
 * @route   GET /api/orders
 * @desc    Get all current orders (for a kitchen display)
 */
app.get('/api/orders', (req, res) => {
  console.log('GET /api/orders hit');
  // Return orders in reverse chronological order
  res.json(orders.slice().reverse());
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
