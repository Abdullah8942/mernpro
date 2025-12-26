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
    // DEBUG: Log incoming request
    console.log('=== CREATE PRODUCT DEBUG ===');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.files:', req.files ? req.files.length + ' files' : 'No files');
    
    // Parse JSON fields from FormData
    let sizeVariations = [];
    let colors = [];
    let discount = { type: 'percentage', value: 0 };

    if (req.body.sizeVariations) {
      try {
        sizeVariations = typeof req.body.sizeVariations === 'string' 
          ? JSON.parse(req.body.sizeVariations) 
          : req.body.sizeVariations;
      } catch (e) {
        console.log('Failed to parse sizeVariations:', e.message);
        sizeVariations = [];
      }
    }

    if (req.body.colors) {
      try {
        colors = typeof req.body.colors === 'string' 
          ? JSON.parse(req.body.colors) 
          : req.body.colors;
      } catch (e) {
        console.log('Failed to parse colors:', e.message);
        colors = [];
      }
    }

    if (req.body.discount) {
      try {
        discount = typeof req.body.discount === 'string' 
          ? JSON.parse(req.body.discount) 
          : req.body.discount;
      } catch (e) {
        console.log('Failed to parse discount:', e.message);
        discount = { type: 'percentage', value: 0 };
      }
    }

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        alt: req.body.name || 'Product image',
        isPrimary: index === 0
      }));
    }

    // If no new images but existing image URLs provided
    if (images.length === 0 && req.body.existingImages) {
      try {
        const existingImages = typeof req.body.existingImages === 'string'
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
        images = existingImages.map((url, index) => ({
          url,
          alt: req.body.name || 'Product image',
          isPrimary: index === 0
        }));
      } catch (e) {
        images = [];
      }
    }

    // Provide a default placeholder if no images
    if (images.length === 0) {
      images = [{
        url: 'https://via.placeholder.com/400x500?text=No+Image',
        alt: req.body.name || 'Product image',
        isPrimary: true
      }];
    }

    // Calculate total stock from size variations
    let totalStock = 0;
    if (sizeVariations && sizeVariations.length > 0) {
      totalStock = sizeVariations.reduce((sum, sv) => sum + (parseInt(sv.stock) || 0), 0);
    }

    // Validate required fields
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    if (!req.body.category) {
      return res.status(400).json({
        success: false,
        message: 'Product category is required'
      });
    }

    if (!req.body.basePrice || isNaN(parseFloat(req.body.basePrice))) {
      return res.status(400).json({
        success: false,
        message: 'Valid base price is required'
      });
    }

    if (!req.body.sku || !req.body.sku.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product SKU is required'
      });
    }

    const productData = {
      name: req.body.name.trim(),
      description: req.body.description || 'No description provided',
      shortDescription: req.body.shortDescription || '',
      category: req.body.category,
      basePrice: parseFloat(req.body.basePrice),
      sku: req.body.sku.trim(),
      fabric: req.body.fabric || '',
      careInstructions: req.body.careInstructions || '',
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

    console.log('productData to save:', JSON.stringify(productData, null, 2));

    const product = await Product.create(productData);

    console.log('Product created successfully:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('=== CREATE PRODUCT ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
      details: error.errors || null
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Parse JSON fields from FormData
    let sizeVariations = product.sizeVariations;
    let colors = product.colors;
    let discount = product.discount;

    if (req.body.sizeVariations) {
      try {
        sizeVariations = typeof req.body.sizeVariations === 'string' 
          ? JSON.parse(req.body.sizeVariations) 
          : req.body.sizeVariations;
      } catch (e) {
        sizeVariations = product.sizeVariations;
      }
    }

    if (req.body.colors) {
      try {
        colors = typeof req.body.colors === 'string' 
          ? JSON.parse(req.body.colors) 
          : req.body.colors;
      } catch (e) {
        colors = product.colors;
      }
    }

    if (req.body.discount) {
      try {
        discount = typeof req.body.discount === 'string' 
          ? JSON.parse(req.body.discount) 
          : req.body.discount;
      } catch (e) {
        discount = product.discount;
      }
    }

    // Handle uploaded images
    let images = product.images;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        alt: req.body.name || product.name || 'Product image',
        isPrimary: images.length === 0 && index === 0
      }));
      images = [...images, ...newImages];
    }

    // Handle existing images from form
    if (req.body.existingImages) {
      try {
        const existingImages = typeof req.body.existingImages === 'string'
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
        images = existingImages.map((url, index) => ({
          url,
          alt: req.body.name || product.name || 'Product image',
          isPrimary: index === 0
        }));
        // Add new uploaded images
        if (req.files && req.files.length > 0) {
          const newImages = req.files.map((file) => ({
            url: `/uploads/${file.filename}`,
            alt: req.body.name || product.name || 'Product image',
            isPrimary: false
          }));
          images = [...images, ...newImages];
        }
      } catch (e) {
        // Keep existing images
      }
    }

    // Calculate total stock from size variations
    let totalStock = 0;
    if (sizeVariations && sizeVariations.length > 0) {
      totalStock = sizeVariations.reduce((sum, sv) => sum + (parseInt(sv.stock) || 0), 0);
    }

    const updateData = {
      name: req.body.name || product.name,
      description: req.body.description !== undefined ? req.body.description : product.description,
      shortDescription: req.body.shortDescription !== undefined ? req.body.shortDescription : product.shortDescription,
      category: req.body.category || product.category,
      basePrice: req.body.basePrice ? parseFloat(req.body.basePrice) : product.basePrice,
      sku: req.body.sku || product.sku,
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
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
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
