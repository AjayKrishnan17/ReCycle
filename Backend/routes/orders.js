const express = require('express');
const { createOrder, getMyOrders, getAllOrders } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);

module.exports = router;