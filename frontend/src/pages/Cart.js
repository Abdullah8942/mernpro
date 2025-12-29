import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineTrash, HiMinus, HiPlus, HiOutlineShoppingBag, HiOutlineArrowLeft } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import Loading from '../components/common/Loading';
import { getImageUrl } from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, updateCartItem, removeFromCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <Loading size="large" text="Loading cart..." />;
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HiOutlineShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added any items yet.
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <HiOutlineArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link to="/" className="text-gray-500 hover:text-primary-600">Home</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-800 font-medium">Shopping Cart</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-display font-bold text-gray-800 mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b text-sm font-medium text-gray-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items */}
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div key={item._id} className="p-4">
                    <div className="grid md:grid-cols-12 gap-4 items-center">
                      {/* Product */}
                      <div className="md:col-span-6 flex gap-4">
                        <div className="w-24 h-28 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={getImageUrl(item.product?.images?.[0]?.url)}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <Link 
                            to={`/product/${item.product?.slug}`}
                            className="font-medium text-gray-800 hover:text-primary-600 line-clamp-2"
                          >
                            {item.product?.name}
                          </Link>
                          <div className="mt-1 space-y-1 text-sm text-gray-500">
                            {item.selectedSize && (
                              <p>Size: {item.selectedSize}</p>
                            )}
                            {item.selectedColor && (
                              <div className="flex items-center gap-2">
                                <span>Color:</span>
                                <span
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: item.selectedColor.hexCode }}
                                />
                                <span>{item.selectedColor.name}</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="mt-2 text-red-500 hover:text-red-600 text-sm flex items-center gap-1 md:hidden"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2 text-center">
                        <span className="md:hidden text-gray-500 text-sm">Price: </span>
                        <span className="font-medium">{formatPrice(item.price)}</span>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2 flex items-center justify-center gap-2">
                        <span className="md:hidden text-gray-500 text-sm mr-2">Qty: </span>
                        <button
                          onClick={() => updateCartItem(item._id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          disabled={item.quantity <= 1}
                        >
                          <HiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItem(item._id, item.quantity + 1)}
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <HiPlus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                        <span className="md:hidden text-gray-500 text-sm">Total: </span>
                        <span className="font-bold text-primary-700">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="ml-4 text-gray-400 hover:text-red-500 hidden md:block"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:underline"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.items.length} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-500">
                    Free shipping on orders over {formatPrice(5000)}
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary-700">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="input flex-1"
                  />
                  <button className="btn-outline px-4">Apply</button>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary py-3 mt-6"
              >
                Proceed to Checkout
              </button>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-500 text-center mb-3">Secure Payment Methods</p>
                <div className="flex justify-center gap-3">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">VISA</span>
                  </div>
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-red-500">MC</span>
                  </div>
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">COD</span>
                  </div>
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-600">Jazz</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
