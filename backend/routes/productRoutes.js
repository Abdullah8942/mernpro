const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getRelatedProducts,
  getAllProductsAdmin
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { productValidation, mongoIdValidation } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);

// Admin routes - MUST come before /:id and /:slug routes
router.get('/admin/all', protect, admin, getAllProductsAdmin);
router.post('/', protect, admin, upload.array('images', 10), createProduct);

// ID-based routes
router.get('/id/:id', getProductById);
router.put('/:id', protect, admin, upload.array('images', 10), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.get('/:id/related', getRelatedProducts);

// Slug route - MUST be last (catches everything else)
router.get('/:slug', getProductBySlug);

// Image upload route
router.post('/upload', protect, admin, upload.array('images', 10), (req, res) => {
  try {
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: imageUrls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
});

module.exports = router;
