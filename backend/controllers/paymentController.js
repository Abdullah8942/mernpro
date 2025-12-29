const Stripe = require('stripe');
const Order = require('../models/Order');

// Initialize Stripe lazily
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// @desc    Create Stripe payment intent
// @route   POST /api/payment/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const stripe = getStripe();
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

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
        message: 'Not authorized'
      });
    }

    // Check if already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Amount in cents/paisa
      currency: 'pkr',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// @desc    Confirm payment and update order
// @route   POST /api/payment/confirm
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const stripe = getStripe();
    const { orderId, paymentIntentId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        updateTime: new Date().toISOString(),
        email: paymentIntent.receipt_email
      };
      order.orderStatus = 'confirmed';

      await order.save();

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payment/webhook
// @access  Public
const stripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      
      // Update order
      const orderId = paymentIntent.metadata.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            updateTime: new Date().toISOString()
          };
          order.orderStatus = 'confirmed';
          await order.save();
        }
      }
      break;

    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// @desc    Get Stripe configuration
// @route   GET /api/payment/config
// @access  Public
const getStripeConfig = (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key'
  });
};

// @desc    Create standalone payment intent for guest/direct payment
// @route   POST /api/payment/create-payment-intent
// @access  Public
const createStandalonePaymentIntent = async (req, res) => {
  try {
    const stripe = getStripe();
    const { amount, currency = 'pkr' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in smallest currency unit (paisa for PKR)
      currency: currency.toLowerCase(),
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

module.exports = {
  createPaymentIntent,
  createStandalonePaymentIntent,
  confirmPayment,
  stripeWebhook,
  getStripeConfig
};
