const express = require('express');
const { createOrder, getOrders, getCart, addToCart, removeFromCart, updateCartItem, clearCart, getStats, getClientOrders } = require('../controllers/orderController');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middleware/auth');

router.post('/orders', authenticateJWT, createOrder);
router.get('/orders', getOrders);
router.get('/cart', authenticateJWT, getCart);
router.post('/cart/add', authenticateJWT, addToCart);
router.post('/cart/remove', authenticateJWT, removeFromCart);
router.post('/cart/update', authenticateJWT, updateCartItem);
router.post('/cart/clear', authenticateJWT, clearCart);
router.get('/stats', getStats);
router.get('/client/orders', authenticateJWT, getClientOrders);

module.exports = router; 