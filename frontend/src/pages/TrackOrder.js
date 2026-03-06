import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineSearch, HiOutlineTruck, HiOutlineCheck,
  HiOutlineClock, HiOutlineX, HiOutlineChevronRight,
  HiOutlineShoppingBag
} from 'react-icons/hi';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const response = await orderAPI.track(orderNumber.trim());
      setOrder(response.data.data);
    } catch (error) {
      setOrder(null);
      toast.error(error.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <HiOutlineCheck className="w-5 h-5" />;
      case 'shipped':
      case 'out_for_delivery': return <HiOutlineTruck className="w-5 h-5" />;
      case 'cancelled': return <HiOutlineX className="w-5 h-5" />;
      default: return <HiOutlineClock className="w-5 h-5" />;
    }
  };

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

  const getStepIndex = (status) => {
    if (status === 'cancelled' || status === 'returned') return -1;
    return statusSteps.indexOf(status);
  };

  const currentStep = order ? getStepIndex(order.orderStatus) : -1;
  const isCancelled = order && (order.orderStatus === 'cancelled' || order.orderStatus === 'returned');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm mb-6">
        <Link to="/" className="text-gray-500 hover:text-primary-600">Home</Link>
        <HiOutlineChevronRight className="mx-2 text-gray-400 w-4 h-4" />
        <span className="text-gray-900 font-medium">Track Order</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
          <HiOutlineTruck className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-500">Enter your order number to check the current status</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleTrack} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter order number (e.g., ME-XXXXX-XXXX)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <HiOutlineSearch className="w-5 h-5" />
                Track
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && !loading && !order && (
        <div className="text-center py-12">
          <HiOutlineShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Order Not Found</h3>
          <p className="text-gray-500">Please check your order number and try again.</p>
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{order.orderNumber}</h2>
                <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                {getStatusIcon(order.orderStatus)}
                {order.orderStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>

            {/* Progress Steps */}
            {!isCancelled && (
              <div className="mt-6">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 mx-8">
                    <div
                      className="h-full bg-primary-600 transition-all duration-500"
                      style={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%` }}
                    />
                  </div>
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    return (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                          ${isCompleted ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}
                          ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}>
                          {isCompleted ? <HiOutlineCheck className="w-5 h-5" /> : index + 1}
                        </div>
                        <span className={`mt-2 text-xs font-medium text-center hidden sm:block
                          ${isCompleted ? 'text-primary-600' : 'text-gray-400'}`}>
                          {step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isCancelled && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-red-700">This order has been {order.orderStatus}.</p>
              </div>
            )}
          </div>

          {/* Tracking Details */}
          {order.trackingNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <HiOutlineTruck className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Tracking Number: {order.trackingNumber}
                  {order.shippingCarrier && <span className="text-blue-600 ml-2">via {order.shippingCarrier}</span>}
                </p>
                {order.estimatedDelivery && (
                  <p className="text-sm text-blue-700">
                    Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Status Updates</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {[...order.statusHistory].reverse().map((entry, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${index === 0 ? 'bg-primary-600' : 'bg-gray-300'}`} />
                        {index < order.statusHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-gray-900 text-sm">
                          {entry.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        {entry.note && <p className="text-sm text-gray-500 mt-0.5">{entry.note}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Order Items Summary */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, index) => (
                <div key={index} className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <HiOutlineShoppingBag className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
