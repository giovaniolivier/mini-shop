const express = require('express');
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
} = require('../controllers/cartController');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

router.get('/cart', authenticateJWT, getCart);
router.post('/cart/add', authenticateJWT, addToCart);
router.post('/cart/remove', authenticateJWT, removeFromCart);
router.post('/cart/update', authenticateJWT, updateCartItem);
router.post('/cart/clear', authenticateJWT, clearCart);

module.exports = router;
