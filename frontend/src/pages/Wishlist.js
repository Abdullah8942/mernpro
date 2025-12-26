import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineHeart, HiOutlineShoppingCart, HiOutlineTrash, 
  HiOutlineChevronRight, HiOutlineEye, HiOutlineX
} from 'react-icons/hi';
import { authAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getWishlist();
      setWishlist(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setRemovingId(productId);
      await authAPI.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product) => {
    if (product.variants && product.variants.length > 0) {
      // Has variants, redirect to product page
      toast.info('Please select size and color on product page');
      return;
    }
    
    const result = await addToCart(product._id, 1, 'Standard', null, null);
    if (result.success) {
      handleRemoveFromWishlist(product._id);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <Loading size="large" text="Loading your wishlist..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary-600">Home</Link>
            <HiOutlineChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-800 font-medium">Wishlist</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <HiOutlineHeart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            My Wishlist
          </h1>
          <p className="text-primary-200">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineHeart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start adding items you love to your wishlist
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              <HiOutlineShoppingCart className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div 
                key={product._id} 
                className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.discountPercentage > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        -{product.discountPercentage}%
                      </span>
                    )}
                    {!product.totalStock || product.totalStock === 0 ? (
                      <span className="px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded-full">
                        Out of Stock
                      </span>
                    ) : null}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    disabled={removingId === product._id}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                  >
                    {removingId === product._id ? (
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <HiOutlineX className="w-5 h-5 text-red-500" />
                    )}
                  </button>

                  {/* Quick Actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <Link
                        to={`/product/${product.slug}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.totalStock || product.totalStock === 0}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <HiOutlineShoppingCart className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{product.category?.name || 'Category'}</p>
                  <Link 
                    to={`/product/${product.slug}`}
                    className="block font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 mb-2"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary-700">
                      {formatPrice(product.salePrice || product.basePrice)}
                    </span>
                    {product.salePrice && product.salePrice < product.basePrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.basePrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlist.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              <HiOutlineShoppingCart className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
