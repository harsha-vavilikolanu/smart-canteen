const router = require('express').Router();
let MenuItem = require('../models/menuItem.model.js');

// This handles GET requests to /api/menu/
router.route('/').get((req, res) => {
  MenuItem.find()
    .then(items => {
      console.log("Data found in database:", items); // <-- ADD THIS LINE
      res.json(items); // Send the items back as JSON
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// This handles POST requests to /api/menu/add (for adding new items)
router.route('/add').post((req, res) => {
  const name = req.body.name;
  const price = Number(req.body.price);
  const description = req.body.description;
  const category = req.body.category;

  const newItem = new MenuItem({
    name,
    price,
    description,
    category,
  });

  newItem.save()
    .then(() => res.json('Menu item added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;