const express = require('express');
const router = express.Router();
const {
  createOrder,
  createGuestOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  markAsPaid,
  getOrderStats
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const { orderValidation, guestOrderValidation } = require('../middleware/validationMiddleware');

// Public routes
router.get('/track/:orderNumber', trackOrder);
router.post('/guest', guestOrderValidation, createGuestOrder);

// Protected routes
router.post('/', protect, orderValidation, createOrder);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/admin/all', protect, admin, getAllOrders);
router.get('/admin/stats', protect, admin, getOrderStats);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/pay', protect, admin, markAsPaid);

module.exports = router;
