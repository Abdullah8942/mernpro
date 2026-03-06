const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();
// Also load from parent directory .env for Vercel
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

// Import error middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Validate critical environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ FATAL: MONGO_URI environment variable is not set!');
  if (!process.env.VERCEL) process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('❌ WARNING: JWT_SECRET environment variable is not set!');
}

// MongoDB connection caching for serverless environments
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not configured');
  }
  try {
    cachedConnection = await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    cachedConnection = null;
    throw err;
  }
};

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://ecom.jkdryfruits.shop',
      'https://www.ecom.jkdryfruits.shop',
      'http://ecom.jkdryfruits.shop',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    // Also allow any .vercel.app domain
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in production for now
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware - ensures DB is connected before handling requests
app.use((req, res, next) => {
  connectDB()
    .then(() => next())
    .catch((err) => {
      console.error('DB connection middleware error:', err.message);
      res.status(500).json({ 
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message
      });
    });
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Meraab & Emaan API is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Meraab & Emaan E-Commerce API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      auth: '/api/auth',
      cart: '/api/cart',
      orders: '/api/orders'
    }
  });
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Only start server when not on Vercel (local development)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Meraab & Emaan E-Commerce API`);
    });
  }).catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });
}

// Export for Vercel serverless
module.exports = app;
