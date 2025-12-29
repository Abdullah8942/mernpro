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
        <div className="card overflow-hidden">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {hasDiscount && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {product.discount.type === 'percentage' 
                    ? `-${product.discount.value}%` 
                    : `-${formatPrice(product.discount.value)}`
                  }
                </span>
              )}
              {product.isNewArrival && (
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  NEW
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-gold-500 text-white text-xs font-bold px-2 py-1 rounded">
                  BESTSELLER
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isAuthenticated && (
                <button
                  onClick={handleWishlistClick}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-50 transition-colors"
                >
                  {isInWishlist ? (
                    <HiHeart className="w-5 h-5 text-red-500" />
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
                className="w-full bg-primary-600 text-white py-3 rounded-md font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <HiOutlineShoppingBag className="w-5 h-5" />
                Quick Add
              </button>
            </div>

            {/* Out of Stock Overlay */}
            {product.totalStock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="bg-white text-gray-800 px-4 py-2 rounded font-medium">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            {/* Category */}
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {product.category?.name}
            </p>

            {/* Name */}
            <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
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
              <span className="text-lg font-semibold text-primary-700">
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
              <div className="flex items-center gap-1 mt-3">
                {product.colors.slice(0, 5).map((color, index) => (
                  <span
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hexCode }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 5 && (
                  <span className="text-xs text-gray-500">+{product.colors.length - 5}</span>
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
