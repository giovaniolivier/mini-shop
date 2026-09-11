const express = require('express');
const {
  createOrder,
  createManualOrder,
  getOrders,
  updateOrder,
  getStats,
  getClientOrders,
} = require('../controllers/orderController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/orders', authenticateJWT, createOrder);
router.post('/orders/manual', authenticateJWT, isAdmin, createManualOrder);
router.get('/orders', authenticateJWT, isAdmin, getOrders);
router.put('/orders/:id', authenticateJWT, isAdmin, updateOrder);
router.get('/stats', authenticateJWT, isAdmin, getStats);
router.get('/client/orders', authenticateJWT, getClientOrders);

module.exports = router;
