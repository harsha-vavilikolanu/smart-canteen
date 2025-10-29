    const router = require('express').Router();
    let Order = require('../models/order.model.js');

    // --- POST /api/orders ---
    // Creates a new order
    router.route('/').post((req, res) => {
      const { items, totalAmount } = req.body;

      if (!items || items.length === 0 || totalAmount === undefined) {
        return res.status(400).json({ message: 'Missing required order data (items, totalAmount).' });
      }

      const newOrder = new Order({
        items,
        totalAmount,
        status: 'Pending'
      });

      newOrder.save()
        .then(savedOrder => res.status(201).json({ message: 'Order created successfully!', orderId: savedOrder._id }))
        .catch(err => {
            console.error("Error saving order:", err);
            res.status(400).json({ message: 'Error saving order: ' + err.message });
        });
    });

    // --- GET /api/orders ---  <- Make sure this block exists
    // Retrieves all orders (sorted by newest first)
    router.route('/').get((req, res) => {
        Order.find()
          .sort({ createdAt: -1 }) // Sort by creation date, newest first
          .then(orders => res.json(orders))
          .catch(err => {
              console.error("Error fetching orders:", err);
              res.status(400).json({ message: 'Error fetching orders: ' + err.message });
          });
    });

    module.exports = router;
    

