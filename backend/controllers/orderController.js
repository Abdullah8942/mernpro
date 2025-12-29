const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, notes, isGift, giftMessage } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checkout.'
      });
    }

    // Validate stock and build order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product?.name || 'Unknown'} is no longer available`
        });
      }

      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        quantity: item.quantity,
        selectedSize: item.selectedSize || 'Standard',
        selectedColor: item.selectedColor || null,
        price: item.price,
        customMeasurements: item.customMeasurements || null
      });
    }

    // Calculate totals
    const subtotal = orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Calculate shipping (free over 5000 PKR)
    const shippingCost = subtotal >= 5000 ? 0 : 200;

    // Apply coupon discount if any
    let discount = cart.couponDiscount || 0;
    const couponCode = cart.couponCode;

    // Tax (if applicable)
    const taxAmount = 0;

    const totalAmount = subtotal + shippingCost + taxAmount - discount;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      taxAmount,
      discount,
      couponCode,
      totalAmount,
      notes,
      isGift,
      giftMessage,
      orderStatus: 'pending',
      isPaid: paymentMethod === 'cod' ? false : false
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { totalStock: -item.quantity, sold: item.quantity }
      });
    }

    // Update coupon usage if used
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        {
          $inc: { usageCount: 1 },
          $push: { usedBy: { user: req.user._id } }
        }
      );
    }

    // Clear cart
    cart.items = [];
    cart.couponCode = null;
    cart.couponDiscount = 0;
    await cart.save();

    // Populate order
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { user: req.user._id };

    // Status filter
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: orders,
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
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name slug images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// @desc    Get order by order number
// @route   GET /api/orders/track/:orderNumber
// @access  Public
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .select('orderNumber orderStatus statusHistory items totalAmount shippingAddress trackingNumber shippingCarrier estimatedDelivery createdAt deliveredAt');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track order',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { totalStock: item.quantity, sold: -item.quantity }
      });
    }

    order.orderStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      note: req.body.reason || 'Cancelled by customer'
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    // Status filter
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    // Payment status filter
    if (req.query.isPaid === 'true') {
      query.isPaid = true;
    } else if (req.query.isPaid === 'false') {
      query.isPaid = false;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Search by order number
    if (req.query.search) {
      query.orderNumber = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate stats
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, '$totalAmount', 0] } },
          totalOrders: { $sum: 1 },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: orders,
      stats: stats[0] || {},
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
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber, shippingCarrier, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.orderStatus = status;
    order.statusHistory.push({
      status,
      note,
      updatedBy: req.user._id
    });

    // Update tracking info if provided
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (shippingCarrier) order.shippingCarrier = shippingCarrier;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    // Set delivered date
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// @desc    Mark order as paid (Admin)
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const markAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = req.body.paymentResult || {
      status: 'completed',
      updateTime: new Date().toISOString()
    };

    await order.save();

    res.json({
      success: true,
      message: 'Order marked as paid',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark order as paid',
      error: error.message
    });
  }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    // Overall stats
    const overallStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, '$totalAmount', 0] } },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overall: overallStats[0] || {},
        byStatus: ordersByStatus,
        recent: recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};

// @desc    Create guest order (without authentication)
// @route   POST /api/orders/guest
// @access  Public
const createGuestOrder = async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, notes, isGift, giftMessage, paymentResult } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided'
      });
    }

    // Validate stock and build order items
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.name || 'Unknown'} is no longer available`
        });
      }

      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: item.image || product.images[0]?.url || '',
        quantity: item.quantity,
        selectedSize: item.selectedSize || 'Standard',
        selectedColor: item.selectedColor || null,
        price: item.price || product.salePrice || product.basePrice,
        customMeasurements: item.customMeasurements || null
      });
    }

    // Calculate totals
    const subtotal = orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Calculate shipping (free over 5000 PKR)
    const shippingCost = subtotal >= 5000 ? 0 : 200;

    // Tax (if applicable)
    const taxAmount = 0;

    const totalAmount = subtotal + shippingCost + taxAmount;

    // Create order
    const order = await Order.create({
      user: null,
      isGuestOrder: true,
      guestEmail: shippingAddress.email,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentResult: paymentResult || null,
      subtotal,
      shippingCost,
      taxAmount,
      discount: 0,
      totalAmount,
      notes,
      isGift,
      giftMessage,
      orderStatus: 'pending',
      isPaid: paymentMethod === 'stripe' && paymentResult?.status === 'succeeded'
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { totalStock: -item.quantity, sold: item.quantity }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Guest order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  createGuestOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  markAsPaid,
  getOrderStats
};
