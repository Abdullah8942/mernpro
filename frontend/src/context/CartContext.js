import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load from localStorage for guest users
      const localCart = localStorage.getItem('guestCart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      } else {
        setCart({ items: [], subtotal: 0, total: 0, totalItems: 0 });
      }
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity, selectedSize, selectedColor, customMeasurements) => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        const response = await cartAPI.addItem({
          productId,
          quantity,
          selectedSize,
          selectedColor,
          customMeasurements
        });
        setCart(response.data.data);
        toast.success('Added to cart');
      } else {
        // Handle guest cart locally
        toast.info('Please login to add items to cart');
      }
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const response = await cartAPI.updateItem(itemId, { quantity });
      setCart(response.data.data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const response = await cartAPI.removeItem(itemId);
      setCart(response.data.data);
      toast.success('Item removed from cart');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartAPI.clear();
      setCart({ items: [], subtotal: 0, total: 0, totalItems: 0 });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (couponCode) => {
    try {
      setLoading(true);
      const response = await cartAPI.applyCoupon(couponCode);
      setCart(response.data.data.cart);
      toast.success('Coupon applied successfully');
      return { success: true, discount: response.data.data.discount };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid coupon code';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.removeCoupon();
      setCart(response.data.data);
      toast.success('Coupon removed');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove coupon';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const cartItemsCount = cart.items?.reduce((count, item) => count + item.quantity, 0) || 0;

  const cartSubtotal = cart.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;

  const value = {
    cart,
    loading,
    cartItemsCount,
    cartSubtotal,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    fetchCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
