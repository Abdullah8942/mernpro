const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Category filter
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        query.category = category._id;
      }
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.basePrice = {};
      if (req.query.minPrice) query.basePrice.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.basePrice.$lte = parseFloat(req.query.maxPrice);
    }

    // Size filter
    if (req.query.size) {
      query['sizeVariations.size'] = req.query.size;
    }

    // Color filter
    if (req.query.color) {
      query['colors.name'] = { $regex: req.query.color, $options: 'i' };
    }

    // Featured filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // New arrivals filter
    if (req.query.newArrivals === 'true') {
      query.isNewArrival = true;
    }

    // Best sellers filter
    if (req.query.bestSellers === 'true') {
      query.isBestSeller = true;
    }

    // In stock filter
    if (req.query.inStock === 'true') {
      query.totalStock = { $gt: 0 };
    }

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sort options
    let sortOptions = {};
    switch (req.query.sort) {
      case 'price_asc':
        sortOptions.basePrice = 1;
        break;
      case 'price_desc':
        sortOptions.basePrice = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'rating':
        sortOptions['ratings.average'] = -1;
        break;
      case 'popular':
        sortOptions.sold = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/id/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    console.log('=== GET PRODUCT BY ID ===');
    console.log('Product ID:', req.params.id);
    
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');

    if (!product) {
      console.log('Product not found');
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('Product found:', product.name);
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT ===');
    console.log('Body keys:', Object.keys(req.body));
    console.log('Files:', req.files ? req.files.length : 0);
    
    // Parse JSON fields from FormData (multer parses form fields as strings)
    let sizeVariations = [];
    let colors = [];
    let discount = { type: 'percentage', value: 0 };

    // Safely parse JSON fields
    const safeJsonParse = (value, defaultValue) => {
      if (!value) return defaultValue;
      if (typeof value !== 'string') return value;
      try {
        return JSON.parse(value);
      } catch (e) {
        console.log('JSON parse error:', e.message);
        return defaultValue;
      }
    };

    sizeVariations = safeJsonParse(req.body.sizeVariations, []);
    colors = safeJsonParse(req.body.colors, []);
    discount = safeJsonParse(req.body.discount, { type: 'percentage', value: 0 });

    // Handle uploaded images from multer
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        alt: req.body.name || 'Product image',
        isPrimary: index === 0
      }));
      console.log('Uploaded images:', images.length);
    }

    // Handle existing image URLs (for edit mode or external URLs)
    if (images.length === 0 && req.body.existingImages) {
      const existingImages = safeJsonParse(req.body.existingImages, []);
      if (Array.isArray(existingImages) && existingImages.length > 0) {
        images = existingImages.map((url, index) => ({
          url: typeof url === 'string' ? url : url.url,
          alt: req.body.name || 'Product image',
          isPrimary: index === 0
        }));
      }
    }

    // Default placeholder image if none provided
    if (images.length === 0) {
      images = [{
        url: 'https://via.placeholder.com/400x500?text=No+Image',
        alt: req.body.name || 'Product image',
        isPrimary: true
      }];
    }

    // Calculate total stock from size variations
    let totalStock = 0;
    if (Array.isArray(sizeVariations) && sizeVariations.length > 0) {
      totalStock = sizeVariations.reduce((sum, sv) => sum + (parseInt(sv.stock) || 0), 0);
    }

    // Validation
    const name = req.body.name?.trim();
    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    if (!req.body.category) {
      return res.status(400).json({ success: false, message: 'Product category is required' });
    }

    const basePrice = parseFloat(req.body.basePrice);
    if (isNaN(basePrice) || basePrice < 0) {
      return res.status(400).json({ success: false, message: 'Valid base price is required' });
    }

    // Generate SKU if not provided or handle existing
    let sku = req.body.sku?.trim();
    if (!sku) {
      // Auto-generate SKU
      sku = 'ME-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    // Check for duplicate SKU
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      // Append random suffix to make SKU unique
      sku = sku + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    }

    const productData = {
      name,
      description: req.body.description?.trim() || '',
      shortDescription: req.body.shortDescription?.trim() || '',
      category: req.body.category,
      basePrice,
      sku,
      fabric: req.body.fabric?.trim() || '',
      careInstructions: req.body.careInstructions?.trim() || '',
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
      isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
      isNewArrival: req.body.isNewArrival === 'true' || req.body.isNewArrival === true,
      isBestSeller: req.body.isBestSeller === 'true' || req.body.isBestSeller === true,
      sizeVariations,
      colors,
      discount,
      images,
      totalStock
    };

    console.log('Creating product:', name);

    const product = await Product.create(productData);

    console.log('Product created successfully:', product._id);

    // Populate category before returning
    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error.message);
    
    // Handle duplicate key error (e.g., duplicate SKU or slug)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `A product with this ${field} already exists`,
        error: error.message
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    console.log('=== UPDATE PRODUCT ===');
    console.log('Product ID:', req.params.id);
    
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Safe JSON parse helper
    const safeJsonParse = (value, defaultValue) => {
      if (!value) return defaultValue;
      if (typeof value !== 'string') return value;
      try {
        return JSON.parse(value);
      } catch (e) {
        return defaultValue;
      }
    };

    // Parse JSON fields from FormData
    let sizeVariations = safeJsonParse(req.body.sizeVariations, product.sizeVariations);
    let colors = safeJsonParse(req.body.colors, product.colors);
    let discount = safeJsonParse(req.body.discount, product.discount);

    // Handle images - start with existing product images
    let images = [...product.images];
    
    // If existingImages is provided, use those (user may have removed some)
    if (req.body.existingImages) {
      const existingImages = safeJsonParse(req.body.existingImages, []);
      if (Array.isArray(existingImages)) {
        images = existingImages.map((img, index) => {
          const url = typeof img === 'string' ? img : img.url;
          return {
            url,
            alt: req.body.name || product.name || 'Product image',
            isPrimary: index === 0
          };
        });
      }
    }

    // Add newly uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        alt: req.body.name || product.name || 'Product image',
        isPrimary: images.length === 0 // First image is primary if no existing
      }));
      images = [...images, ...newImages];
      console.log('Added', req.files.length, 'new images');
    }

    // Ensure at least one image has isPrimary
    if (images.length > 0 && !images.some(img => img.isPrimary)) {
      images[0].isPrimary = true;
    }

    // Calculate total stock from size variations
    let totalStock = 0;
    if (Array.isArray(sizeVariations) && sizeVariations.length > 0) {
      totalStock = sizeVariations.reduce((sum, sv) => sum + (parseInt(sv.stock) || 0), 0);
    }

    const updateData = {
      name: req.body.name?.trim() || product.name,
      description: req.body.description !== undefined ? req.body.description : product.description,
      shortDescription: req.body.shortDescription !== undefined ? req.body.shortDescription : product.shortDescription,
      category: req.body.category || product.category,
      basePrice: req.body.basePrice ? parseFloat(req.body.basePrice) : product.basePrice,
      sku: req.body.sku?.trim() || product.sku,
      fabric: req.body.fabric !== undefined ? req.body.fabric : product.fabric,
      careInstructions: req.body.careInstructions !== undefined ? req.body.careInstructions : product.careInstructions,
      isActive: req.body.isActive !== undefined ? (req.body.isActive === 'true' || req.body.isActive === true) : product.isActive,
      isFeatured: req.body.isFeatured !== undefined ? (req.body.isFeatured === 'true' || req.body.isFeatured === true) : product.isFeatured,
      isNewArrival: req.body.isNewArrival !== undefined ? (req.body.isNewArrival === 'true' || req.body.isNewArrival === true) : product.isNewArrival,
      isBestSeller: req.body.isBestSeller !== undefined ? (req.body.isBestSeller === 'true' || req.body.isBestSeller === true) : product.isBestSeller,
      sizeVariations,
      colors,
      discount,
      images,
      totalStock
    };

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    console.log('Product updated successfully');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error.message);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `A product with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('category', 'name slug')
      .limit(limit);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
const getNewArrivals = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const products = await Product.find({ 
      isActive: true,
      isNewArrival: true
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new arrivals',
      error: error.message
    });
  }
};

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
const getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const products = await Product.find({ 
      isActive: true,
      isBestSeller: true
    })
      .populate('category', 'name slug')
      .sort({ sold: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch best sellers',
      error: error.message
    });
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const limit = parseInt(req.query.limit) || 4;

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
      .populate('category', 'name slug')
      .limit(limit);

    res.json({
      success: true,
      data: relatedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related products',
      error: error.message
    });
  }
};

// @desc    Get all products (Admin)
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAllProductsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    // Search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Status filter
    if (req.query.status === 'active') {
      query.isActive = true;
    } else if (req.query.status === 'inactive') {
      query.isActive = false;
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

module.exports = {
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
};
