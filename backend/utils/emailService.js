const nodemailer = require('nodemailer');

// Create transporter - using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'workwithabdullah8942@gmail.com',
      pass: process.env.EMAIL_PASS // App password from Gmail
    }
  });
};

// Store owner email
const STORE_OWNER_EMAIL = 'workwithabdullah8942@gmail.com';

// Send order notification to store owner
const sendOrderNotification = async (order) => {
  try {
    const transporter = createTransporter();
    
    const itemsList = order.items.map(item => 
      `• ${item.name} (Size: ${item.selectedSize || 'N/A'}, Color: ${item.selectedColor?.name || 'N/A'}) x ${item.quantity} - Rs ${item.price.toLocaleString()}`
    ).join('\n');

    const mailOptions = {
      from: `"Meraab & Emaan" <${process.env.EMAIL_USER || 'noreply@meraabemaan.com'}>`,
      to: STORE_OWNER_EMAIL,
      subject: `🛒 New Order Received - #${order.orderNumber}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); padding: 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">MERAAB & EMAAN</h1>
            <p style="color: #f5deb3; margin: 5px 0 0;">New Order Notification</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <div style="background: #f0f9f0; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
              <h2 style="color: #28a745; margin: 0 0 5px;">🎉 New Order Received!</h2>
              <p style="margin: 0; color: #666;">Order #${order.orderNumber}</p>
            </div>
            
            <!-- Customer Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #8B4513; margin: 0 0 15px; border-bottom: 2px solid #8B4513; padding-bottom: 10px;">Customer Details</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${order.shippingAddress?.email || order.guestEmail || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Order Type:</strong> ${order.isGuestOrder ? '👤 Guest Order' : '✅ Registered Customer'}</p>
            </div>
            
            <!-- Shipping Address -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #8B4513; margin: 0 0 15px; border-bottom: 2px solid #8B4513; padding-bottom: 10px;">Shipping Address</h3>
              <p style="margin: 0;">
                ${order.shippingAddress?.street || ''}<br>
                ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}<br>
                ${order.shippingAddress?.country || 'Pakistan'}
              </p>
            </div>
            
            <!-- Order Items -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #8B4513; margin: 0 0 15px; border-bottom: 2px solid #8B4513; padding-bottom: 10px;">Order Items</h3>
              ${order.items.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                  <div>
                    <strong>${item.name}</strong><br>
                    <span style="color: #666; font-size: 13px;">Size: ${item.selectedSize || 'N/A'} | Color: ${item.selectedColor?.name || 'N/A'} | Qty: ${item.quantity}</span>
                  </div>
                  <div style="text-align: right; font-weight: bold;">Rs ${(item.price * item.quantity).toLocaleString()}</div>
                </div>
              `).join('')}
            </div>
            
            <!-- Order Summary -->
            <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: #fff; padding: 20px; border-radius: 8px;">
              <h3 style="margin: 0 0 15px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 10px;">Order Summary</h3>
              <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>Subtotal:</span><span>Rs ${order.subtotal?.toLocaleString()}</span></div>
              <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>Shipping:</span><span>Rs ${order.shippingCost?.toLocaleString()}</span></div>
              ${order.discount > 0 ? `<div style="display: flex; justify-content: space-between; margin: 8px 0; color: #90EE90;"><span>Discount:</span><span>-Rs ${order.discount?.toLocaleString()}</span></div>` : ''}
              <div style="display: flex; justify-content: space-between; margin: 15px 0 0; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 20px; font-weight: bold;">
                <span>TOTAL:</span><span>Rs ${order.totalAmount?.toLocaleString()}</span>
              </div>
              <div style="margin-top: 10px; text-align: center; background: rgba(255,255,255,0.1); padding: 8px; border-radius: 4px;">
                <strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0; font-size: 12px;">This is an automated notification from Meraab & Emaan</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Order notification email sent to store owner');
    return true;
  } catch (error) {
    console.error('Failed to send order notification email:', error);
    return false;
  }
};

// Send order confirmation to customer
const sendOrderConfirmation = async (order, customerEmail) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Meraab & Emaan" <${process.env.EMAIL_USER || 'noreply@meraabemaan.com'}>`,
      to: customerEmail,
      subject: `Order Confirmed - #${order.orderNumber} | Meraab & Emaan`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); padding: 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">MERAAB & EMAAN</h1>
            <p style="color: #f5deb3; margin: 5px 0 0;">Order Confirmation</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #28a745; text-align: center;">✅ Thank You For Your Order!</h2>
            <p style="text-align: center; color: #666;">Your order has been successfully placed and is being processed.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #666;">Order Number</p>
              <h2 style="color: #8B4513; margin: 5px 0;">#${order.orderNumber}</h2>
            </div>
            
            <!-- Order Items -->
            <div style="margin: 20px 0;">
              <h3 style="color: #8B4513;">Your Items:</h3>
              ${order.items.map(item => `
                <div style="display: flex; padding: 15px 0; border-bottom: 1px solid #eee;">
                  <div style="flex: 1;">
                    <strong>${item.name}</strong><br>
                    <span style="color: #666; font-size: 13px;">Size: ${item.selectedSize || 'N/A'} | Color: ${item.selectedColor?.name || 'N/A'} | Qty: ${item.quantity}</span>
                  </div>
                  <div style="font-weight: bold;">Rs ${(item.price * item.quantity).toLocaleString()}</div>
                </div>
              `).join('')}
            </div>
            
            <!-- Total -->
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: right;">
              <div style="font-size: 20px; font-weight: bold; color: #8B4513;">
                Total: Rs ${order.totalAmount?.toLocaleString()}
              </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <p style="color: #666;">We'll send you shipping updates via email.</p>
              <p style="color: #666;">Questions? Contact us at <a href="mailto:abdullahramzan8942@gmail.com" style="color: #8B4513;">abdullahramzan8942@gmail.com</a></p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #8B4513; padding: 20px; text-align: center;">
            <p style="color: #fff; margin: 0;">Thank you for shopping with Meraab & Emaan!</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Order confirmation email sent to customer');
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
};

// Send newsletter subscription notification
const sendNewsletterSubscription = async (subscriberEmail) => {
  try {
    const transporter = createTransporter();
    
    // Notify store owner
    const ownerMailOptions = {
      from: `"Meraab & Emaan" <${process.env.EMAIL_USER || 'noreply@meraabemaan.com'}>`,
      to: STORE_OWNER_EMAIL,
      subject: '📬 New Newsletter Subscriber!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f8f9fa; border-radius: 12px;">
          <h2 style="color: #8B4513; text-align: center;">🎉 New Subscriber!</h2>
          <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="font-size: 18px; margin: 0;"><strong>${subscriberEmail}</strong></p>
            <p style="color: #666; margin: 10px 0 0;">has subscribed to your newsletter</p>
          </div>
          <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">Meraab & Emaan Newsletter System</p>
        </div>
      `
    };

    // Send welcome email to subscriber
    const subscriberMailOptions = {
      from: `"Meraab & Emaan" <${process.env.EMAIL_USER || 'noreply@meraabemaan.com'}>`,
      to: subscriberEmail,
      subject: 'Welcome to Meraab & Emaan Family! 💕',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); padding: 40px; text-align: center;">
            <h1 style="color: #fff; margin: 0;">MERAAB & EMAAN</h1>
            <p style="color: #f5deb3; margin: 10px 0 0;">Premium Pakistani Fashion</p>
          </div>
          <div style="padding: 40px; text-align: center;">
            <h2 style="color: #8B4513;">Welcome to Our Family! 🎉</h2>
            <p style="color: #666; line-height: 1.8;">
              Thank you for subscribing to our newsletter! You'll now be the first to know about:
            </p>
            <ul style="text-align: left; color: #666; line-height: 2;">
              <li>✨ New Collections & Arrivals</li>
              <li>🏷️ Exclusive Discounts & Offers</li>
              <li>💃 Fashion Tips & Styling Ideas</li>
              <li>🎁 Special Promotions</li>
            </ul>
            <a href="http://localhost:3000/shop" style="display: inline-block; background: #8B4513; color: #fff; padding: 15px 40px; border-radius: 30px; text-decoration: none; margin-top: 20px; font-weight: bold;">Shop Now</a>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">© 2025 Meraab & Emaan. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await Promise.all([
      transporter.sendMail(ownerMailOptions),
      transporter.sendMail(subscriberMailOptions)
    ]);
    
    console.log('📧 Newsletter subscription emails sent');
    return true;
  } catch (error) {
    console.error('Failed to send newsletter emails:', error);
    return false;
  }
};

module.exports = {
  sendOrderNotification,
  sendOrderConfirmation,
  sendNewsletterSubscription,
  STORE_OWNER_EMAIL
};
