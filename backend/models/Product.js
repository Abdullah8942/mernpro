const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: '',
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  basePrice: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  // Price variations based on size
  sizeVariations: [{
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'],
      required: true
    },
    priceAdjustment: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  // Available colors
  colors: [{
    name: {
      type: String,
      required: true
    },
    hexCode: {
      type: String,
      required: true
    },
    images: [String],
    stock: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  // Default images
  images: [{
    url: {
      type: String
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      default: 0,
      min: 0
    },
    startDate: Date,
    endDate: Date
  },
  totalStock: {
    type: Number,
    default: 0,
    min: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  fabric: {
    type: String,
    default: ''
  },
  careInstructions: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sku: {
    type: String,
    unique: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug and SKU before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  if (!this.sku) {
    this.sku = 'ME-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  }
  next();
});

// Virtual for current price (with discount)
productSchema.virtual('currentPrice').get(function() {
  if (this.discount && this.discount.value > 0) {
    const now = new Date();
    const isValidDiscount = (!this.discount.startDate || now >= this.discount.startDate) &&
                           (!this.discount.endDate || now <= this.discount.endDate);
    if (isValidDiscount) {
      if (this.discount.type === 'percentage') {
        return this.basePrice * (1 - this.discount.value / 100);
      } else {
        return Math.max(0, this.basePrice - this.discount.value);
      }
    }
  }
  return this.basePrice;
});

// Virtual for checking if in stock
productSchema.virtual('inStock').get(function() {
  return this.totalStock > 0;
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
