import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI, productAPI } from '../services/api';
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

// Helper to calculate cart totals
const calculateCartTotals = (items) => {
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = items.reduce((count, item) => count + item.quantity, 0);
  return { subtotal, total: subtotal, totalItems };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  // Save guest cart to localStorage
  const saveGuestCart = useCallback((cartData) => {
    localStorage.setItem('guestCart', JSON.stringify(cartData));
  }, []);

  // Load guest cart from localStorage
  const loadGuestCart = useCallback(() => {
    try {
      const localCart = localStorage.getItem('guestCart');
      if (localCart) {
        return JSON.parse(localCart);
      }
    } catch (e) {
      console.error('Error loading guest cart:', e);
    }
    return { items: [], subtotal: 0, total: 0, totalItems: 0 };
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load from localStorage for guest users
      const guestCart = loadGuestCart();
      setCart(guestCart);
    }
  }, [isAuthenticated, fetchCart, loadGuestCart]);

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
        const productResponse = await productAPI.getById(productId);
        const product = productResponse.data.data;
        
        const guestCart = loadGuestCart();
        const existingItemIndex = guestCart.items.findIndex(
          item => item.product?._id === productId && 
                  item.selectedSize === selectedSize &&
                  item.selectedColor?.name === selectedColor?.name
        );

        if (existingItemIndex >= 0) {
          // Update quantity
          guestCart.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          const newItem = {
            _id: `guest_${Date.now()}`,
            product: {
              _id: product._id,
              name: product.name,
              slug: product.slug,
              images: product.images,
              basePrice: product.basePrice,
              salePrice: product.salePrice,
            },
            name: product.name,
            image: product.images?.[0]?.url || '',
            quantity,
            selectedSize: selectedSize || 'Standard',
            selectedColor: selectedColor || null,
            customMeasurements: customMeasurements || null,
            price: product.salePrice || product.basePrice,
          };
          guestCart.items.push(newItem);
        }

        // Recalculate totals
        const totals = calculateCartTotals(guestCart.items);
        const updatedCart = { ...guestCart, ...totals };
        
        setCart(updatedCart);
        saveGuestCart(updatedCart);
        toast.success('Added to cart');
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
      
      if (isAuthenticated) {
        const response = await cartAPI.updateItem(itemId, { quantity });
        setCart(response.data.data);
      } else {
        // Update guest cart
        const guestCart = loadGuestCart();
        const itemIndex = guestCart.items.findIndex(item => item._id === itemId);
        
        if (itemIndex >= 0) {
          if (quantity <= 0) {
            guestCart.items.splice(itemIndex, 1);
          } else {
            guestCart.items[itemIndex].quantity = quantity;
          }
          
          const totals = calculateCartTotals(guestCart.items);
          const updatedCart = { ...guestCart, ...totals };
          
          setCart(updatedCart);
          saveGuestCart(updatedCart);
        }
      }
      
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
      
      if (isAuthenticated) {
        const response = await cartAPI.removeItem(itemId);
        setCart(response.data.data);
      } else {
        // Remove from guest cart
        const guestCart = loadGuestCart();
        guestCart.items = guestCart.items.filter(item => item._id !== itemId);
        
        const totals = calculateCartTotals(guestCart.items);
        const updatedCart = { ...guestCart, ...totals };
        
        setCart(updatedCart);
        saveGuestCart(updatedCart);
      }
      
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
      
      if (isAuthenticated) {
        await cartAPI.clear();
      } else {
        // Clear guest cart
        localStorage.removeItem('guestCart');
      }
      
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
      
      if (!isAuthenticated) {
        toast.error('Please login to apply coupons');
        return { success: false, error: 'Login required' };
      }
      
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

  // Merge guest cart with user cart after login
  const mergeGuestCartAfterLogin = useCallback(async () => {
    const guestCart = loadGuestCart();
    if (guestCart.items.length > 0) {
      try {
        for (const item of guestCart.items) {
          await cartAPI.addItem({
            productId: item.product?._id || item.product,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            customMeasurements: item.customMeasurements
          });
        }
        localStorage.removeItem('guestCart');
        await fetchCart();
        toast.success('Cart items merged');
      } catch (err) {
        console.error('Failed to merge cart:', err);
      }
    }
  }, [loadGuestCart, fetchCart]);

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
    mergeGuestCartAfterLogin,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
