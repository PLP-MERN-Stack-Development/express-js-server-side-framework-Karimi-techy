// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;  // Changed to 3002 as fallback

// Middleware setup
app.use(bodyParser.json());
const logger = require('./middleware/logger');
const auth = require('./middleware/auth');
const { errorHandler } = require('./middleware/errors');
app.use(logger);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// Protect write operations with API key
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) return auth(req, res, next);
  next();
});

// Mount products router
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

// Global error handler (should be last)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;