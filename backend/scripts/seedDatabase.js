const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Dummy Admin Credentials
const ADMIN_CREDENTIALS = {
  firstName: 'Admin',
  lastName: 'Meraab',
  email: 'admin@meraab-emaan.com',
  password: 'Admin@123',
  role: 'admin',
  phone: '+92-300-1234567',
  isActive: true
};

// Dummy User Credentials
const USER_CREDENTIALS = {
  firstName: 'Test',
  lastName: 'User',
  email: 'user@meraab-emaan.com',
  password: 'User@123',
  role: 'user',
  phone: '+92-321-9876543',
  isActive: true,
  addresses: [{
    street: '123 Main Street, Block A',
    city: 'Lahore',
    state: 'Punjab',
    postalCode: '54000',
    country: 'Pakistan',
    phone: '+92-321-9876543',
    isDefault: true
  }]
};

// Sample Categories
const CATEGORIES = [
  {
    name: 'Women',
    slug: 'women',
    description: 'Elegant clothing collection for women',
    image: '/images/categories/women.jpg',
    isActive: true
  },
  {
    name: 'Men',
    slug: 'men',
    description: 'Premium clothing collection for men',
    image: '/images/categories/men.jpg',
    isActive: true
  },
  {
    name: 'Kids',
    slug: 'kids',
    description: 'Adorable clothing collection for kids',
    image: '/images/categories/kids.jpg',
    isActive: true
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Beautiful accessories to complement your outfit',
    image: '/images/categories/accessories.jpg',
    isActive: true
  }
];

// Sample Products
const getProducts = (categoryIds) => [
  {
    name: 'Embroidered Lawn Suit',
    slug: 'embroidered-lawn-suit',
    description: 'Beautiful embroidered lawn suit with intricate patterns. Perfect for summer wear. Includes shirt, dupatta, and trousers.',
    shortDescription: 'Elegant lawn suit for summer',
    basePrice: 8500,
    category: categoryIds['women'],
    images: [
      { url: '/images/products/lawn-suit-1.jpg', alt: 'Embroidered Lawn Suit Front', isPrimary: true },
      { url: '/images/products/lawn-suit-2.jpg', alt: 'Embroidered Lawn Suit Back', isPrimary: false }
    ],
    sizeVariations: [
      { size: 'S', stock: 10, priceAdjustment: 0 },
      { size: 'M', stock: 15, priceAdjustment: 0 },
      { size: 'L', stock: 12, priceAdjustment: 200 },
      { size: 'XL', stock: 8, priceAdjustment: 400 }
    ],
    colors: [
      { name: 'Maroon', hexCode: '#800000', stock: 15 },
      { name: 'Navy Blue', hexCode: '#000080', stock: 15 },
      { name: 'Emerald Green', hexCode: '#50C878', stock: 15 }
    ],
    sku: 'ME-WOM-001',
    tags: ['lawn', 'embroidered', 'summer', 'formal'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Premium Shalwar Kameez',
    slug: 'premium-shalwar-kameez',
    description: 'Classic premium shalwar kameez for men. Made with high-quality cotton fabric for ultimate comfort.',
    shortDescription: 'Premium cotton shalwar kameez',
    basePrice: 6500,
    category: categoryIds['men'],
    images: [
      { url: '/images/products/shalwar-kameez-1.jpg', alt: 'Premium Shalwar Kameez', isPrimary: true }
    ],
    sizeVariations: [
      { size: 'M', stock: 20, priceAdjustment: 0 },
      { size: 'L', stock: 25, priceAdjustment: 0 },
      { size: 'XL', stock: 15, priceAdjustment: 300 },
      { size: 'XXL', stock: 10, priceAdjustment: 500 }
    ],
    colors: [
      { name: 'White', hexCode: '#FFFFFF', stock: 25 },
      { name: 'Off White', hexCode: '#FAF9F6', stock: 20 },
      { name: 'Light Blue', hexCode: '#ADD8E6', stock: 25 }
    ],
    sku: 'ME-MEN-001',
    tags: ['shalwar kameez', 'cotton', 'casual', 'formal'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Kids Party Dress',
    slug: 'kids-party-dress',
    description: 'Adorable party dress for little ones. Features beautiful embellishments and comfortable fabric.',
    shortDescription: 'Beautiful party dress for kids',
    basePrice: 3500,
    category: categoryIds['kids'],
    images: [
      { url: '/images/products/kids-dress-1.jpg', alt: 'Kids Party Dress', isPrimary: true }
    ],
    sizeVariations: [
      { size: 'XS', stock: 8, priceAdjustment: 0 },
      { size: 'S', stock: 12, priceAdjustment: 0 },
      { size: 'M', stock: 10, priceAdjustment: 200 },
      { size: 'L', stock: 6, priceAdjustment: 400 }
    ],
    colors: [
      { name: 'Pink', hexCode: '#FFC0CB', stock: 12 },
      { name: 'Purple', hexCode: '#800080', stock: 12 },
      { name: 'Red', hexCode: '#FF0000', stock: 12 }
    ],
    sku: 'ME-KID-001',
    tags: ['kids', 'party', 'dress', 'girls'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Silk Dupatta',
    slug: 'silk-dupatta',
    description: 'Elegant silk dupatta with beautiful border work. A perfect accessory to complete your outfit.',
    shortDescription: 'Elegant silk dupatta',
    basePrice: 2500,
    category: categoryIds['accessories'],
    images: [
      { url: '/images/products/dupatta-1.jpg', alt: 'Silk Dupatta', isPrimary: true }
    ],
    sizeVariations: [
      { size: 'M', stock: 30, priceAdjustment: 0 }
    ],
    colors: [
      { name: 'Gold', hexCode: '#FFD700', stock: 10 },
      { name: 'Silver', hexCode: '#C0C0C0', stock: 10 },
      { name: 'Rose Gold', hexCode: '#B76E79', stock: 10 }
    ],
    sku: 'ME-ACC-001',
    tags: ['dupatta', 'silk', 'accessory', 'formal'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Bridal Collection Lehnga',
    slug: 'bridal-collection-lehnga',
    description: 'Stunning bridal lehnga with heavy embroidery and handwork. Made for your special day.',
    shortDescription: 'Stunning bridal lehnga',
    basePrice: 85000,
    category: categoryIds['women'],
    images: [
      { url: '/images/products/bridal-lehnga-1.jpg', alt: 'Bridal Lehnga Front', isPrimary: true },
      { url: '/images/products/bridal-lehnga-2.jpg', alt: 'Bridal Lehnga Back', isPrimary: false }
    ],
    sizeVariations: [
      { size: 'S', stock: 2, priceAdjustment: 0 },
      { size: 'M', stock: 3, priceAdjustment: 0 },
      { size: 'L', stock: 2, priceAdjustment: 5000 },
      { size: 'Custom', stock: 5, priceAdjustment: 10000 }
    ],
    colors: [
      { name: 'Red', hexCode: '#DC143C', stock: 4 },
      { name: 'Maroon', hexCode: '#800000', stock: 3 }
    ],
    sku: 'ME-WOM-002',
    tags: ['bridal', 'lehnga', 'wedding', 'formal', 'heavy'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Kurta Pajama Set',
    slug: 'kurta-pajama-set',
    description: 'Traditional kurta pajama set for festive occasions. Features elegant embroidery on neckline.',
    shortDescription: 'Traditional kurta pajama',
    basePrice: 5500,
    category: categoryIds['men'],
    images: [
      { url: '/images/products/kurta-pajama-1.jpg', alt: 'Kurta Pajama Set', isPrimary: true }
    ],
    sizeVariations: [
      { size: 'M', stock: 15, priceAdjustment: 0 },
      { size: 'L', stock: 20, priceAdjustment: 0 },
      { size: 'XL', stock: 12, priceAdjustment: 300 }
    ],
    colors: [
      { name: 'Cream', hexCode: '#FFFDD0', stock: 16 },
      { name: 'Black', hexCode: '#000000', stock: 15 },
      { name: 'Brown', hexCode: '#964B00', stock: 16 }
    ],
    sku: 'ME-MEN-002',
    tags: ['kurta', 'pajama', 'festive', 'traditional'],
    isFeatured: false,
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Existing data cleared!\n');

    // Create Categories
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(CATEGORIES);
    const categoryIds = {};
    createdCategories.forEach(cat => {
      categoryIds[cat.slug] = cat._id;
    });
    console.log(`✅ Created ${createdCategories.length} categories!\n`);

    // Create Admin User
    console.log('👤 Creating admin user...');
    const adminUser = await User.create(ADMIN_CREDENTIALS);
    console.log('✅ Admin user created!\n');

    // Create Test User
    console.log('👤 Creating test user...');
    const testUser = await User.create(USER_CREDENTIALS);
    console.log('✅ Test user created!\n');

    // Create Products
    console.log('🛍️  Creating products...');
    const products = getProducts(categoryIds);
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products!\n`);

    // Print Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    SEED COMPLETED SUCCESSFULLY!            ');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📋 DUMMY CREDENTIALS:\n');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│  ADMIN LOGIN                                            │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log(`│  Email:    ${ADMIN_CREDENTIALS.email.padEnd(35)}│`);
    console.log(`│  Password: ${ADMIN_CREDENTIALS.password.padEnd(35)}│`);
    console.log('└─────────────────────────────────────────────────────────┘\n');
    
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│  USER LOGIN                                             │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log(`│  Email:    ${USER_CREDENTIALS.email.padEnd(35)}│`);
    console.log(`│  Password: ${USER_CREDENTIALS.password.padEnd(35)}│`);
    console.log('└─────────────────────────────────────────────────────────┘\n');

    console.log('📊 DATABASE SUMMARY:');
    console.log(`   • Users: 2 (1 admin, 1 regular user)`);
    console.log(`   • Categories: ${createdCategories.length}`);
    console.log(`   • Products: ${createdProducts.length}\n`);

    console.log('🚀 You can now start the server with: npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    if (error.code === 8000) {
      console.error('\n⚠️  Authentication failed. Please check your MongoDB credentials.');
    }
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
