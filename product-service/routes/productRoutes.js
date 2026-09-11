const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  decrementStock,
} = require('../controllers/productController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

router.get('/products', getAllProducts);
router.post('/products', authenticateJWT, isAdmin, createProduct);
router.put('/products/:id', authenticateJWT, isAdmin, updateProduct);
router.delete('/products/:id', authenticateJWT, isAdmin, deleteProduct);
router.patch('/products/:id/decrement', authenticateJWT, isAdmin, decrementStock);

module.exports = router;
