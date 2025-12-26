const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: String,
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minimumPurchase: {
    type: Number,
    default: 0
  },
  maximumDiscount: {
    type: Number,
    default: null
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  usageLimitPerUser: {
    type: Number,
    default: 1
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive &&
         now >= this.startDate &&
         now <= this.endDate &&
         (this.usageLimit === null || this.usageCount < this.usageLimit);
};

// Calculate discount
couponSchema.methods.calculateDiscount = function(subtotal) {
  if (!this.isValid() || subtotal < this.minimumPurchase) {
    return 0;
  }

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = subtotal * (this.discountValue / 100);
  } else {
    discount = this.discountValue;
  }

  if (this.maximumDiscount !== null) {
    discount = Math.min(discount, this.maximumDiscount);
  }

  return Math.min(discount, subtotal);
};

module.exports = mongoose.model('Coupon', couponSchema);
