const express = require('express');
const router = express.Router();
const { sendNewsletterSubscription } = require('../utils/emailService');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

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

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existingSubscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });
    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed'
      });
    }

    // Persist subscriber
    await NewsletterSubscriber.create({ email: normalizedEmail });

    // Send notification emails
    await sendNewsletterSubscription(normalizedEmail);

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
