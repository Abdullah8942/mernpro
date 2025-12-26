import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineHeart, HiHeart, HiOutlineShoppingBag, HiOutlineStar, HiStar, HiOutlineTruck, HiOutlineRefresh, HiOutlineShieldCheck, HiMinus, HiPlus } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/products/ProductCard';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { productAPI, reviewAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showCustomMeasurements, setShowCustomMeasurements] = useState(false);
  const [customMeasurements, setCustomMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    length: '',
    shoulders: '',
    sleeves: '',
    notes: '',
  });

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product && isAuthenticated) {
      checkWishlist();
    }
  }, [product, isAuthenticated]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productAPI.getProductBySlug(slug);
      const productData = response.data.data;
      setProduct(productData);

      // Set default selections
      if (productData.sizeVariations?.length > 0) {
        setSelectedSize(productData.sizeVariations[0].size);
      }
      if (productData.colors?.length > 0) {
        setSelectedColor(productData.colors[0]);
      }

      // Fetch related products and reviews
      const [relatedRes, reviewsRes] = await Promise.all([
        productAPI.getRelated(productData._id, 4),
        reviewAPI.getProductReviews(productData._id, { limit: 5 }),
      ]);

      setRelatedProducts(relatedRes.data.data);
      setReviews(reviewsRes.data.data);
    } catch (err) {
      setError('Failed to load product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const response = await authAPI.getWishlist();
      const wishlist = response.data.data;
      setIsInWishlist(wishlist.some(item => item._id === product._id));
    } catch (err) {
      console.error('Failed to check wishlist:', err);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await authAPI.removeFromWishlist(product._id);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await authAPI.addToWishlist(product._id);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const measurements = selectedSize === 'Custom' ? customMeasurements : null;
    await addToCart(product._id, quantity, selectedSize, selectedColor, measurements);
  };

  const calculateCurrentPrice = () => {
    let price = product.basePrice;

    // Apply discount
    if (product.discount?.value > 0) {
      if (product.discount.type === 'percentage') {
        price = price * (1 - product.discount.value / 100);
      } else {
        price = Math.max(0, price - product.discount.value);
      }
    }

    // Apply size adjustment
    const sizeVariation = product.sizeVariations?.find(sv => sv.size === selectedSize);
    if (sizeVariation?.priceAdjustment) {
      price += sizeVariation.priceAdjustment;
    }

    return price;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <Loading size="large" text="Loading product..." />;
  }

  if (error || !product) {
    return <ErrorMessage message={error || 'Product not found'} />;
  }

  const images = selectedColor?.images?.length > 0 
    ? selectedColor.images 
    : product.images?.map(img => img.url) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container-custom">
          <nav className="text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary-600">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link to="/shop" className="text-gray-500 hover:text-primary-600">Shop</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link to={`/shop?category=${product.category?.slug}`} className="text-gray-500 hover:text-primary-600">
              {product.category?.name}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={images[selectedImage] || '/images/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`
                        flex-shrink-0 w-20 h-24 rounded-md overflow-hidden border-2 transition-colors
                        ${selectedImage === index ? 'border-primary-600' : 'border-transparent'}
                      `}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex gap-2">
                {product.isNewArrival && (
                  <span className="badge-success">New Arrival</span>
                )}
                {product.isBestSeller && (
                  <span className="badge-warning">Best Seller</span>
                )}
                {product.totalStock === 0 && (
                  <span className="badge-error">Out of Stock</span>
                )}
              </div>

              {/* Name & Category */}
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">
                  {product.category?.name}
                </p>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mt-1">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              {product.ratings?.count > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      i < Math.round(product.ratings.average) ? (
                        <HiStar key={i} className="w-5 h-5 text-gold-500" />
                      ) : (
                        <HiOutlineStar key={i} className="w-5 h-5 text-gray-300" />
                      )
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary-700">
                  {formatPrice(calculateCurrentPrice())}
                </span>
                {product.discount?.value > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.basePrice)}
                    </span>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                      {product.discount.type === 'percentage' 
                        ? `-${product.discount.value}%` 
                        : `-${formatPrice(product.discount.value)}`
                      }
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="text-gray-600">{product.shortDescription || product.description?.substring(0, 200)}</p>

              {/* Colors */}
              {product.colors?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">
                    Color: <span className="text-gray-600">{selectedColor?.name}</span>
                  </h3>
                  <div className="flex gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedColor(color);
                          setSelectedImage(0);
                        }}
                        className={`
                          w-10 h-10 rounded-full border-2 transition-all
                          ${selectedColor?.name === color.name 
                            ? 'border-primary-600 ring-2 ring-primary-200' 
                            : 'border-gray-300'
                          }
                        `}
                        style={{ backgroundColor: color.hexCode }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizeVariations?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">
                      Size: <span className="text-gray-600">{selectedSize}</span>
                    </h3>
                    <button className="text-sm text-primary-600 hover:underline">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizeVariations.map((variation) => (
                      <button
                        key={variation.size}
                        onClick={() => {
                          setSelectedSize(variation.size);
                          setShowCustomMeasurements(variation.size === 'Custom');
                        }}
                        disabled={variation.stock === 0}
                        className={`
                          px-4 py-2 border rounded-md transition-all min-w-[60px]
                          ${selectedSize === variation.size
                            ? 'bg-primary-600 text-white border-primary-600'
                            : variation.stock === 0
                              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                              : 'border-gray-300 hover:border-primary-600'
                          }
                        `}
                      >
                        {variation.size}
                        {variation.priceAdjustment > 0 && (
                          <span className="text-xs block">+{formatPrice(variation.priceAdjustment)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Measurements */}
              {showCustomMeasurements && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Custom Measurements (in inches)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Chest"
                      value={customMeasurements.chest}
                      onChange={(e) => setCustomMeasurements(prev => ({ ...prev, chest: e.target.value }))}
                      className="input py-2"
                    />
                    <input
                      type="number"
                      placeholder="Waist"
                      value={customMeasurements.waist}
                      onChange={(e) => setCustomMeasurements(prev => ({ ...prev, waist: e.target.value }))}
                      className="input py-2"
                    />
                    <input
                      type="number"
                      placeholder="Hips"
                      value={customMeasurements.hips}
                      onChange={(e) => setCustomMeasurements(prev => ({ ...prev, hips: e.target.value }))}
                      className="input py-2"
                    />
                    <input
                      type="number"
                      placeholder="Length"
                      value={customMeasurements.length}
                      onChange={(e) => setCustomMeasurements(prev => ({ ...prev, length: e.target.value }))}
                      className="input py-2"
                    />
                    <input
                      type="number"
                      placeholder="Shoulders"
                      value={customMeasurements.shoulders}
                      onChange={(e) => setCustomMeasurements(prev => ({ ...prev, shoulders: e.target.value }))}
                      className="input py-2"
                    />
                    <input
                      type="number"
                      placeholder="Sleeves"
                      value={customMeasurements.sleeves}
                      onChange={(e) => setCustomMeasurements(prev => ({ ...prev, sleeves: e.target.value }))}
                      className="input py-2"
                    />
                  </div>
                  <textarea
                    placeholder="Additional notes..."
                    value={customMeasurements.notes}
                    onChange={(e) => setCustomMeasurements(prev => ({ ...prev, notes: e.target.value }))}
                    className="input py-2 mt-4"
                    rows={2}
                  />
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <HiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <HiPlus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.totalStock === 0 || cartLoading}
                  className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <HiOutlineShoppingBag className="w-5 h-5" />
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleWishlistToggle}
                  className="p-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {isInWishlist ? (
                    <HiHeart className="w-6 h-6 text-red-500" />
                  ) : (
                    <HiOutlineHeart className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <HiOutlineTruck className="w-8 h-8 mx-auto text-primary-600 mb-2" />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-gray-500">Over PKR 5,000</p>
                </div>
                <div className="text-center">
                  <HiOutlineRefresh className="w-8 h-8 mx-auto text-primary-600 mb-2" />
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-gray-500">7 Day Policy</p>
                </div>
                <div className="text-center">
                  <HiOutlineShieldCheck className="w-8 h-8 mx-auto text-primary-600 mb-2" />
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-gray-500">100% Protected</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-3">Product Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex">
                    <dt className="w-32 text-gray-500">SKU:</dt>
                    <dd className="text-gray-800">{product.sku}</dd>
                  </div>
                  {product.fabric && (
                    <div className="flex">
                      <dt className="w-32 text-gray-500">Fabric:</dt>
                      <dd className="text-gray-800">{product.fabric}</dd>
                    </div>
                  )}
                  {product.careInstructions && (
                    <div className="flex">
                      <dt className="w-32 text-gray-500">Care:</dt>
                      <dd className="text-gray-800">{product.careInstructions}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-16 prose max-w-none">
            <h2 className="text-2xl font-display font-bold mb-4">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-display font-bold mb-6">Customer Reviews</h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {review.user.firstName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {review.user.firstName} {review.user.lastName}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              i < review.rating ? (
                                <HiStar key={i} className="w-4 h-4 text-gold-500" />
                              ) : (
                                <HiOutlineStar key={i} className="w-4 h-4 text-gray-300" />
                              )
                            ))}
                          </div>
                          {review.isVerifiedPurchase && (
                            <span className="text-xs text-green-600">Verified Purchase</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-medium mb-1">{review.title}</h4>
                    )}
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-display font-bold mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
