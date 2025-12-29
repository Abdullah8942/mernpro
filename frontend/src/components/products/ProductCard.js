import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiHeart, HiOutlineShoppingBag, HiOutlineStar, HiStar } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../services/api';

const ProductCard = ({ product, onWishlistToggle, isInWishlist = false }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const primaryImageUrl = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url;
  const primaryImage = getImageUrl(primaryImageUrl);
  
  // Calculate current price
  let currentPrice = product.basePrice;
  let hasDiscount = false;
  
  if (product.discount?.value > 0) {
    hasDiscount = true;
    if (product.discount.type === 'percentage') {
      currentPrice = product.basePrice * (1 - product.discount.value / 100);
    } else {
      currentPrice = Math.max(0, product.basePrice - product.discount.value);
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add with default size and color
    const defaultSize = product.sizeVariations?.[0]?.size || 'M';
    const defaultColor = product.colors?.[0] || null;
    
    await addToCart(product._id, 1, defaultSize, defaultColor);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onWishlistToggle) {
      onWishlistToggle(product._id);
    }
  };

  return (
    <div className="group">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="card overflow-hidden hover-lift hover:shadow-xl">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {hasDiscount && (
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                  {product.discount.type === 'percentage' 
                    ? `-${product.discount.value}%` 
                    : `-${formatPrice(product.discount.value)}`
                  }
                </span>
              )}
              {product.isNewArrival && (
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  NEW
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  BESTSELLER
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              {isAuthenticated && (
                <button
                  onClick={handleWishlistClick}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-50 hover:scale-110 transition-all duration-300"
                >
                  {isInWishlist ? (
                    <HiHeart className="w-5 h-5 text-red-500 animate-heartbeat" />
                  ) : (
                    <HiOutlineHeart className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              )}
            </div>

            {/* Quick Add Button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleQuickAdd}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-2 shadow-lg btn-ripple"
              >
                <HiOutlineShoppingBag className="w-5 h-5" />
                Quick Add
              </button>
            </div>

            {/* Out of Stock Overlay */}
            {product.totalStock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
                <span className="bg-white text-gray-800 px-4 py-2 rounded-full font-medium shadow-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            {/* Category */}
            <p className="text-xs text-primary-500 uppercase tracking-wider mb-1 font-medium">
              {product.category?.name}
            </p>

            {/* Name */}
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
              {product.name}
            </h3>

            {/* Rating */}
            {product.ratings?.count > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    i < Math.round(product.ratings.average) ? (
                      <HiStar key={i} className="w-4 h-4 text-gold-500" />
                    ) : (
                      <HiOutlineStar key={i} className="w-4 h-4 text-gray-300" />
                    )
                  ))}
                </div>
                <span className="text-xs text-gray-500">({product.ratings.count})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary-700">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>

            {/* Colors Preview */}
            {product.colors?.length > 0 && (
              <div className="flex items-center gap-1.5 mt-3">
                {product.colors.slice(0, 5).map((color, index) => (
                  <span
                    key={index}
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-125 transition-transform cursor-pointer"
                    style={{ backgroundColor: color.hexCode }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 5 && (
                  <span className="text-xs text-gray-500 font-medium">+{product.colors.length - 5}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
