import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get the full URL for an image
 * Handles both relative paths (from backend) and absolute URLs
 * @param {string} imageUrl - The image URL or path
 * @returns {string} The full image URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '/images/placeholder.jpg';
  
  // If it's already an absolute URL (http/https), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path starting with /uploads, prepend backend URL
  if (imageUrl.startsWith('/uploads')) {
    return `${BACKEND_URL}${imageUrl}`;
  }
  
  // For other paths (like /images/...), return as-is (served by frontend)
  return imageUrl;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  addAddress: (data) => api.post('/auth/address', data),
  updateAddress: (addressId, data) => api.put(`/auth/address/${addressId}`, data),
  deleteAddress: (addressId) => api.delete(`/auth/address/${addressId}`),
  getWishlist: () => api.get('/auth/wishlist'),
  addToWishlist: (productId) => api.post(`/auth/wishlist/${productId}`, {}),
  removeFromWishlist: (productId) => api.delete(`/auth/wishlist/${productId}`),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getProducts: (params) => api.get('/products', { params }),
  getProductBySlug: (slug) => api.get(`/products/${slug}`),
  getProductById: (id) => api.get(`/products/id/${id}`),
  getById: (id) => api.get(`/products/id/${id}`), // Alias for getProductById
  getFeatured: (limit = 8) => api.get(`/products/featured?limit=${limit}`),
  getNewArrivals: (limit = 8) => api.get(`/products/new-arrivals?limit=${limit}`),
  getBestSellers: (limit = 8) => api.get(`/products/best-sellers?limit=${limit}`),
  getRelated: (id, limit = 4) => api.get(`/products/${id}/related?limit=${limit}`),
  // Admin
  getAllAdmin: (params) => api.get('/products/admin/all', { params }),
  create: (data) => {
    // For FormData, use axios directly to avoid default Content-Type header
    if (data instanceof FormData) {
      const token = localStorage.getItem('token');
      return axios.post(`${API_URL}/products`, data, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          // Let browser set Content-Type with boundary for multipart/form-data
        },
      });
    }
    return api.post('/products', data);
  },
  update: (id, data) => {
    // For FormData, use axios directly to avoid default Content-Type header
    if (data instanceof FormData) {
      const token = localStorage.getItem('token');
      return axios.put(`${API_URL}/products/${id}`, data, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          // Let browser set Content-Type with boundary for multipart/form-data
        },
      });
    }
    return api.put(`/products/${id}`, data);
  },
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (formData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/products/upload`, formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  },
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  getById: (id) => api.get(`/categories/id/${id}`),
  getWithCounts: () => api.get('/categories/with-counts'),
  // Admin
  getAllAdmin: () => api.get('/categories/admin/all'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart', data),
  updateItem: (itemId, data) => api.put(`/cart/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
  applyCoupon: (couponCode) => api.post('/cart/coupon', { couponCode }),
  removeCoupon: () => api.delete('/cart/coupon'),
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  createGuestOrder: (data) => api.post('/orders/guest', data),
  getAll: (params) => api.get('/orders/admin/all', { params }),
  getMyOrders: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  // Admin
  getAllAdmin: (params) => api.get('/orders/admin/all', { params }),
  getStats: () => api.get('/orders/admin/stats'),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  markAsPaid: (id, data) => api.put(`/orders/${id}/pay`, data),
};

// Review APIs
export const reviewAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  like: (id) => api.put(`/reviews/${id}/like`),
  // Admin
  getAllAdmin: (params) => api.get('/reviews/admin/all', { params }),
  approve: (id, isApproved) => api.put(`/reviews/${id}/approve`, { isApproved }),
  reply: (id, comment) => api.put(`/reviews/${id}/reply`, { comment }),
};

// Payment APIs
export const paymentAPI = {
  getConfig: () => api.get('/payment/config'),
  createIntent: (orderId) => api.post('/payment/create-intent', { orderId }),
  createPaymentIntent: (amount, currency = 'pkr') => api.post('/payment/create-payment-intent', { amount, currency }),
  confirmPayment: (orderId, paymentIntentId) => api.post('/payment/confirm', { orderId, paymentIntentId }),
};

// User APIs (Admin)
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  createAdmin: (data) => api.post('/users/admin', data),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
};

export default api;
