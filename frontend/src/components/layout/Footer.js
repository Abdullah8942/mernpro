import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaFacebookF, FaInstagram, FaPinterestP, FaTwitter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { newsletterAPI } from '../../services/api';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    try {
      setSubscribing(true);
      await newsletterAPI.subscribe(email);
      toast.success('Successfully subscribed! Check your email.');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-secondary-900 via-secondary-950 to-black text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 relative overflow-hidden border-b border-gold-500/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gold-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom py-14 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-display font-semibold text-white">Join Our Fashion Family</h3>
              <p className="text-gold-300/80 mt-2 font-light">Be the first to know about new arrivals & exclusive offers</p>
            </div>
            <form className="flex w-full md:w-auto" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-6 py-4 w-full md:w-80 rounded-l-full text-gray-800 bg-white/95 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all placeholder-gray-500"
              />
              <button 
                type="submit" 
                disabled={subscribing}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 px-8 py-4 rounded-r-full font-semibold transition-all hover:shadow-lg hover:shadow-gold-500/30 text-secondary-900 disabled:opacity-50"
              >
                {subscribing ? '...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img 
                src="/logo.png" 
                alt="Meraab & Emaan" 
                className="h-14 w-auto object-contain filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Elevating Pakistani fashion with exquisite craftsmanship and timeless elegance. 
              From bridal wear to casual chic, we bring your fashion dreams to life.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <FaPinterestP className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-secondary-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <FaTwitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gold-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-gray-400 hover:text-gold-400 transition-colors hover:translate-x-1 inline-block">Shop All</Link>
              </li>
              <li>
                <Link to="/shop?category=casual" className="text-gray-400 hover:text-gold-400 transition-colors hover:translate-x-1 inline-block">Casual Wear</Link>
              </li>
              <li>
                <Link to="/shop?category=party-wear" className="text-gray-400 hover:text-gold-400 transition-colors hover:translate-x-1 inline-block">Party Wear</Link>
              </li>
              <li>
                <Link to="/shop?category=bridal" className="text-gray-400 hover:text-gold-400 transition-colors hover:translate-x-1 inline-block">Bridal Collection</Link>
              </li>
              <li>
                <Link to="/shop?category=formal" className="text-gray-400 hover:text-gold-400 transition-colors hover:translate-x-1 inline-block">Formal Wear</Link>
              </li>
              <li>
                <Link to="/shop?category=new-arrivals" className="text-gray-400 hover:text-gold-400 transition-colors hover:translate-x-1 inline-block">New Arrivals</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-white transition-colors">My Orders</Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-400 hover:text-white transition-colors">Track Order</Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-white transition-colors">Returns & Exchanges</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQs</Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-gray-400 hover:text-white transition-colors">Size Guide</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <HiOutlineLocationMarker className="w-6 h-6 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400">
                  123 Fashion Street, Gulberg III, Lahore, Pakistan
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <HiOutlinePhone className="w-6 h-6 text-primary-400" />
                <a href="tel:+923001234567" className="text-gray-400 hover:text-white transition-colors">
                  +92 300 123 4567
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <HiOutlineMail className="w-6 h-6 text-primary-400" />
                <a href="mailto:info@meraabemaan.com" className="text-gray-400 hover:text-white transition-colors">
                  info@meraabemaan.com
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Store Hours</h4>
              <p className="text-gray-400 text-sm">Mon - Sat: 10:00 AM - 9:00 PM</p>
              <p className="text-gray-400 text-sm">Sunday: 12:00 PM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-700">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Meraab & Emaan. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link to="/privacy" className="text-gray-400 text-sm hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 text-sm hover:text-white transition-colors">
                Terms & Conditions
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <img src="/images/payment/visa.svg" alt="Visa" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="/images/payment/jazzcash.svg" alt="JazzCash" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="/images/payment/easypaisa.svg" alt="EasyPaisa" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
