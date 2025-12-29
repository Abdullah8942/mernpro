const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  createStandalonePaymentIntent,
  confirmPayment,
  stripeWebhook,
  getStripeConfig
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/config', getStripeConfig);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/create-payment-intent', createStandalonePaymentIntent);

// Protected routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);

module.exports = router;
