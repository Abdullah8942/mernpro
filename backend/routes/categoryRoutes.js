const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesWithCounts,
  getAllCategoriesAdmin
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');
const { categoryValidation } = require('../middleware/validationMiddleware');

// Public routes
router.get('/', getCategories);
router.get('/with-counts', getCategoriesWithCounts);
router.get('/id/:id', getCategoryById);
router.get('/:slug', getCategoryBySlug);

// Admin routes
router.get('/admin/all', protect, admin, getAllCategoriesAdmin);
router.post('/', protect, admin, categoryValidation, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
