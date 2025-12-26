const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  getAllReviews,
  approveReview,
  replyToReview
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');
const { reviewValidation } = require('../middleware/validationMiddleware');

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, reviewValidation, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/like', protect, likeReview);

// Admin routes
router.get('/admin/all', protect, admin, getAllReviews);
router.put('/:id/approve', protect, admin, approveReview);
router.put('/:id/reply', protect, admin, replyToReview);

module.exports = router;
