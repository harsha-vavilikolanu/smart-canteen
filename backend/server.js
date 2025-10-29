const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Needed to parse JSON bodies

// --- MongoDB Connection ---
const uri = process.env.ATLAS_URI;
// mongoose.set('debug', true); // Keep this commented out unless debugging DB queries
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("✅ MongoDB database connection established successfully");
});
connection.on('error', (err) => {
  console.error("MongoDB connection error: ", err);
  process.exit(1);
});
// --- End MongoDB Connection ---


// --- API ROUTES ---
const menuRouter = require('./routes/menu');
const ordersRouter = require('./routes/orders'); // <-- Import the new router

app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter); // <-- Tell Express to use the orders router
// --- End API ROUTES ---


app.get('/', (req, res) => {
  res.send('Hello from Smart Canteen backend!');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server is running on port: ${port}`);
});
