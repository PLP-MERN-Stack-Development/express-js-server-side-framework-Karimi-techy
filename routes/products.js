// routes/products.js - Product routes

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { NotFoundError, ValidationError } = require('../middleware/errors');
const validateProduct = require('../middleware/validateProduct');

// In-memory database (mock data)
let products = [
  {
    id: uuidv4(),
    name: 'Laptop',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    category: 'Electronics',
    inStock: true
  },
  {
    id: uuidv4(),
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    price: 299.99,
    category: 'Furniture',
    inStock: true
  },
  {
    id: uuidv4(),
    name: 'Wireless Mouse',
    description: 'Bluetooth wireless mouse',
    price: 29.99,
    category: 'Electronics',
    inStock: false
  },
  {
    id: uuidv4(),
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness',
    price: 49.99,
    category: 'Furniture',
    inStock: true
  }
];

// Async handler wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET /api/products/search - Search products by name
// Must come BEFORE /:id route to avoid conflicts
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    throw new ValidationError('Search query parameter "q" is required');
  }
  
  const searchResults = products.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({
    success: true,
    count: searchResults.length,
    data: searchResults
  });
}));

// GET /api/products/stats - Get product statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    byCategory: {}
  };
  
  // Count by category
  products.forEach(p => {
    if (!stats.byCategory[p.category]) {
      stats.byCategory[p.category] = 0;
    }
    stats.byCategory[p.category]++;
  });
  
  res.json({
    success: true,
    data: stats
  });
}));

// GET /api/products - List all products with filtering and pagination
router.get('/', asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  
  let filteredProducts = [...products];
  
  // Filter by category if provided
  if (category) {
    filteredProducts = filteredProducts.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    count: paginatedProducts.length,
    total: filteredProducts.length,
    page: parseInt(page),
    limit: parseInt(limit),
    data: paginatedProducts
  });
}));

// GET /api/products/:id - Get a specific product by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    throw new NotFoundError(`Product with id ${req.params.id} not found`);
  }
  
  res.json({
    success: true,
    data: product
  });
}));

// POST /api/products - Create a new product
// Auth middleware is applied in server.js
router.post('/', validateProduct, asyncHandler(async (req, res) => {
  const newProduct = {
    id: uuidv4(),
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    inStock: req.body.inStock
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: newProduct
  });
}));

// PUT /api/products/:id - Update an existing product
// Auth middleware is applied in server.js
router.put('/:id', validateProduct, asyncHandler(async (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    throw new NotFoundError(`Product with id ${req.params.id} not found`);
  }
  
  products[index] = {
    ...products[index],
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    inStock: req.body.inStock
  };
  
  res.json({
    success: true,
    message: 'Product updated successfully',
    data: products[index]
  });
}));

// DELETE /api/products/:id - Delete a product
// Auth middleware is applied in server.js
router.delete('/:id', asyncHandler(async (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    throw new NotFoundError(`Product with id ${req.params.id} not found`);
  }
  
  const deletedProduct = products.splice(index, 1)[0];
  
  res.json({
    success: true,
    message: 'Product deleted successfully',
    data: deletedProduct
  });
}));

module.exports = router;