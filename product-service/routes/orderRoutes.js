const express = require('express');
const {
  createOrder,
  getOrders,
  getStats,
  getClientOrders,
} = require('../controllers/orderController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/orders', authenticateJWT, createOrder);
router.get('/orders', authenticateJWT, isAdmin, getOrders);
router.get('/stats', authenticateJWT, isAdmin, getStats);
router.get('/client/orders', authenticateJWT, getClientOrders);

module.exports = router;
