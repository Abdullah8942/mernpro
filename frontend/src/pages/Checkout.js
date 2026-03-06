import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { HiOutlineCheck, HiOutlineTruck, HiOutlineCreditCard, HiOutlineShieldCheck } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import { orderAPI, paymentAPI, getImageUrl } from '../services/api';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Card Element styling
const cardStyle = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: 'Poppins, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

const CheckoutForm = ({ shippingAddress, paymentMethod, total, onSuccess, cart, isAuthenticated }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Transform shipping address to match backend schema
  const transformShippingAddress = (address) => {
    const nameParts = (address.fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    
    return {
      firstName,
      lastName,
      email: address.email || '',
      phone: address.phone || '',
      street: (address.addressLine1 || '') + (address.addressLine2 ? `, ${address.addressLine2}` : ''),
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'Pakistan',
    };
  };

  // Transform cart items for guest order
  const transformCartItems = (items) => {
    if (!items || !Array.isArray(items)) {
      console.error('Invalid items:', items);
      return [];
    }
    return items.map(item => {
      const productId = item.product?._id || item.product;
      console.log('Transforming item:', item, 'Product ID:', productId);
      return {
        product: productId,
        name: item.product?.name || item.name || 'Product',
        image: item.product?.images?.[0]?.url || item.image || '',
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize || 'Standard',
        selectedColor: item.selectedColor || null,
        price: item.price || 0,
        customMeasurements: item.customMeasurements || null
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const transformedAddress = transformShippingAddress(shippingAddress);

      if (paymentMethod === 'card') {
        // Create payment intent
        const { data } = await paymentAPI.createPaymentIntent(total * 100, 'pkr');
        const clientSecret = data.clientSecret;

        // Confirm card payment
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: shippingAddress.fullName || '',
              email: shippingAddress.email || '',
            },
          },
        });

        if (stripeError) {
          setError(stripeError.message);
          setProcessing(false);
          return;
        }

        if (paymentIntent.status === 'succeeded') {
          // Create order
          const orderData = {
            shippingAddress: transformedAddress,
            paymentMethod: 'stripe',
            paymentResult: {
              id: paymentIntent.id,
              status: paymentIntent.status,
              updateTime: new Date().toISOString(),
              email: shippingAddress.email || '',
            },
          };

          let response;
          // Check if cart has guest items (items with _id starting with 'guest_')
          const hasGuestItems = cart?.items?.some(item => item._id?.toString().startsWith('guest_'));
          
          if (isAuthenticated && !hasGuestItems) {
            response = await orderAPI.create(orderData);
          } else {
            orderData.items = transformCartItems(cart?.items || []);
            response = await orderAPI.createGuestOrder(orderData);
          }
          
          await clearCart();
          onSuccess(response.data.data);
        }
      } else {
        // COD - Create order directly
        const orderData = {
          shippingAddress: transformedAddress,
          paymentMethod: 'cod',
        };

        let response;
        // Check if cart has guest items (items with _id starting with 'guest_')
        const hasGuestItems = cart?.items?.some(item => item._id?.toString().startsWith('guest_'));
        
        if (isAuthenticated && !hasGuestItems) {
          // User is logged in and has items in backend cart
          response = await orderAPI.create(orderData);
        } else {
          // Guest checkout OR authenticated user with guest cart items
          const cartItems = cart?.items || [];
          console.log('Guest/Local checkout - Cart items:', cartItems);
          orderData.items = transformCartItems(cartItems);
          console.log('Guest/Local checkout - Order data:', orderData);
          response = await orderAPI.createGuestOrder(orderData);
        }
        
        await clearCart();
        onSuccess(response.data.data);
      }
    } catch (err) {
      console.error('Order error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {paymentMethod === 'card' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border rounded-md p-4">
            <CardElement options={cardStyle} />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full btn-primary py-3 disabled:opacity-50"
      >
        {processing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
      </button>
    </form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!cartLoading && (!cart?.items || cart.items.length === 0) && !orderPlaced) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate, orderPlaced]);

  const validateShipping = () => {
    const newErrors = {};

    if (!(shippingAddress.fullName || '').trim()) newErrors.fullName = 'Full name is required';
    if (!(shippingAddress.email || '').trim()) newErrors.email = 'Email is required';
    if (!(shippingAddress.phone || '').trim()) newErrors.phone = 'Phone is required';
    if (!(shippingAddress.addressLine1 || '').trim()) newErrors.addressLine1 = 'Address is required';
    if (!(shippingAddress.city || '').trim()) newErrors.city = 'City is required';
    if (!(shippingAddress.state || '').trim()) newErrors.state = 'State is required';
    if (!(shippingAddress.postalCode || '').trim()) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleContinueToPayment = () => {
    if (validateShipping()) {
      setStep(2);
    }
  };

  const handleOrderSuccess = (order) => {
    setPlacedOrder(order);
    setOrderPlaced(true);
    setStep(3);
    toast.success('Order placed successfully!');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (cartLoading) {
    return <Loading size="large" text="Loading checkout..." />;
  }

  // Order Success
  if (orderPlaced && placedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineCheck className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-800 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. We've sent a confirmation email to {shippingAddress.email}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-xl font-bold text-primary-700">{placedOrder.orderNumber}</p>
            </div>

            <div className="text-left space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <HiOutlineTruck className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Shipping Address</p>
                  <p className="text-sm text-gray-600">
                    {shippingAddress.addressLine1}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <HiOutlineCreditCard className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/orders/${placedOrder._id}`)}
                className="flex-1 btn-primary"
              >
                View Order
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="flex-1 btn-outline"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Confirm' },
            ].map((s, index) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-medium
                      ${step >= s.num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}
                    `}
                  >
                    {step > s.num ? <HiOutlineCheck className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`ml-2 hidden sm:block ${step >= s.num ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 sm:w-24 h-1 mx-2 ${step > s.num ? 'bg-primary-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Step 1: Shipping */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

                  {/* Saved Addresses */}
                  {user?.addresses?.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select a saved address
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {user.addresses.map((address) => (
                          <button
                            key={address._id}
                            type="button"
                            onClick={() => setShippingAddress({
                              fullName: address.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
                              email: user.email || '',
                              phone: address.phone || user.phone || '',
                              addressLine1: address.addressLine1 || address.street || '',
                              addressLine2: address.addressLine2 || '',
                              city: address.city || '',
                              state: address.state || '',
                              postalCode: address.postalCode || '',
                              country: address.country || 'Pakistan',
                            })}
                            className={`
                              p-3 border rounded-lg text-left transition-colors
                              ${shippingAddress.addressLine1 === address.addressLine1 
                                ? 'border-primary-600 bg-primary-50' 
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            <p className="font-medium text-sm">{address.label}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {address.addressLine1}, {address.city}
                            </p>
                          </button>
                        ))}
                      </div>
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">or enter a new address</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={shippingAddress.fullName || ''}
                          onChange={handleShippingChange}
                          className={`input ${errors.fullName ? 'border-red-500' : ''}`}
                        />
                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={shippingAddress.email || ''}
                          onChange={handleShippingChange}
                          className={`input ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone || ''}
                        onChange={handleShippingChange}
                        className={`input ${errors.phone ? 'border-red-500' : ''}`}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={shippingAddress.addressLine1 || ''}
                        onChange={handleShippingChange}
                        placeholder="Street address"
                        className={`input ${errors.addressLine1 ? 'border-red-500' : ''}`}
                      />
                      {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2 <span className="text-gray-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="addressLine2"
                        value={shippingAddress.addressLine2 || ''}
                        onChange={handleShippingChange}
                        placeholder="Apartment, suite, etc."
                        className="input"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={shippingAddress.city || ''}
                          onChange={handleShippingChange}
                          className={`input ${errors.city ? 'border-red-500' : ''}`}
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State/Province
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={shippingAddress.state || ''}
                          onChange={handleShippingChange}
                          className={`input ${errors.state ? 'border-red-500' : ''}`}
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={shippingAddress.postalCode || ''}
                          onChange={handleShippingChange}
                          className={`input ${errors.postalCode ? 'border-red-500' : ''}`}
                        />
                        {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={shippingAddress.country || 'Pakistan'}
                          onChange={handleShippingChange}
                          className="input"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToPayment}
                    className="w-full btn-primary py-3 mt-6"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Payment Method</h2>
                    <button
                      onClick={() => setStep(1)}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      Edit Shipping
                    </button>
                  </div>

                  {/* Shipping Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-500">Shipping to:</p>
                    <p className="font-medium">{shippingAddress.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {shippingAddress.addressLine1}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                    </p>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-4 mb-6">
                    <label
                      className={`
                        flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors
                        ${paymentMethod === 'cod' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}
                      `}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="w-4 h-4 text-primary-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                      </div>
                      <span className="text-2xl">💵</span>
                    </label>

                    <label
                      className={`
                        flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors
                        ${paymentMethod === 'card' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}
                      `}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="w-4 h-4 text-primary-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium">Credit / Debit Card</p>
                        <p className="text-sm text-gray-500">Pay securely with your card</p>
                      </div>
                      <span className="text-2xl">💳</span>
                    </label>
                  </div>

                  {/* Checkout Form */}
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      shippingAddress={shippingAddress}
                      paymentMethod={paymentMethod}
                      total={total}
                      onSuccess={handleOrderSuccess}
                      cart={cart}
                      isAuthenticated={isAuthenticated}
                    />
                  </Elements>

                  {/* Security Note */}
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                    <HiOutlineShieldCheck className="w-5 h-5 text-green-500" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart?.items?.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={getImageUrl(item.product?.images?.[0]?.url)}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.selectedSize} {item.selectedColor && `/ ${item.selectedColor.name}`}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-medium text-sm mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold text-base">
                  <span>Total</span>
                  <span className="text-primary-700">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
