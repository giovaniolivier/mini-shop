const express = require('express');
const { getClients, updateClient } = require('../controllers/clientController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/clients', authenticateJWT, isAdmin, getClients);
router.put('/clients/:id', authenticateJWT, isAdmin, updateClient);

module.exports = router;
