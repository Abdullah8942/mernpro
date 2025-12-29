const express = require('express');
const router = express.Router();
const { sendNewsletterSubscription } = require('../utils/emailService');

// Newsletter subscribers storage (in production, use database)
const subscribers = new Set();

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if already subscribed
    if (subscribers.has(email.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed'
      });
    }

    // Add to subscribers
    subscribers.add(email.toLowerCase());

    // Send notification emails
    await sendNewsletterSubscription(email);

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter!'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again.'
    });
  }
});

module.exports = router;
