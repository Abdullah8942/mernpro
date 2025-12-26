import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineClipboardList, HiOutlineChevronRight, HiOutlineEye,
  HiOutlineRefresh, HiOutlineFilter, HiOutlineSearch, HiOutlineTruck,
  HiOutlineCheck, HiOutlineClock, HiOutlineX, HiOutlineShoppingBag
} from 'react-icons/hi';
import { orderAPI } from '../services/api';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [filter, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await orderAPI.getMyOrders(params);
      setOrders(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        color: 'bg-amber-100 text-amber-700 border-amber-200', 
        icon: HiOutlineClock,
        label: 'Pending'
      },
      confirmed: { 
        color: 'bg-blue-100 text-blue-700 border-blue-200', 
        icon: HiOutlineCheck,
        label: 'Confirmed'
      },
      processing: { 
        color: 'bg-purple-100 text-purple-700 border-purple-200', 
        icon: HiOutlineRefresh,
        label: 'Processing'
      },
      shipped: { 
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200', 
        icon: HiOutlineTruck,
        label: 'Shipped'
      },
      out_for_delivery: { 
        color: 'bg-cyan-100 text-cyan-700 border-cyan-200', 
        icon: HiOutlineTruck,
        label: 'Out for Delivery'
      },
      delivered: { 
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
        icon: HiOutlineCheck,
        label: 'Delivered'
      },
      cancelled: { 
        color: 'bg-red-100 text-red-700 border-red-200', 
        icon: HiOutlineX,
        label: 'Cancelled'
      },
      returned: { 
        color: 'bg-gray-100 text-gray-700 border-gray-200', 
        icon: HiOutlineRefresh,
        label: 'Returned'
      },
    };
    return configs[status] || configs.pending;
  };

  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = orders.filter(order => 
    searchQuery === '' || 
    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && orders.length === 0) {
    return <Loading size="large" text="Loading your orders..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary-600">Home</Link>
            <HiOutlineChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/profile" className="text-gray-500 hover:text-primary-600">Profile</Link>
            <HiOutlineChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-800 font-medium">Order History</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <HiOutlineClipboardList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Order History
          </h1>
          <p className="text-primary-200">
            Track and manage all your orders
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <HiOutlineFilter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <HiOutlineRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">
              No orders found
            </h2>
            <p className="text-gray-600 mb-6">
              {filter !== 'all' 
                ? `You don't have any ${filter} orders`
                : "You haven't placed any orders yet"
              }
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.orderStatus);
              const StatusIcon = statusConfig.icon;

              return (
                <div 
                  key={order._id} 
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-4 md:p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <HiOutlineShoppingBag className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig.label}
                        </span>
                        <span className="text-lg font-bold text-gray-800">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4 md:p-6 bg-gray-50">
                    <div className="flex flex-wrap gap-4">
                      {order.items?.slice(0, 4).map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-16 h-20 bg-white rounded-lg overflow-hidden shadow-sm">
                            <img
                              src={item.image || '/images/placeholder.jpg'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} | Size: {item.selectedSize}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <div className="flex items-center justify-center w-16 h-20 bg-gray-200 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">
                            +{order.items.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="p-4 md:p-6 flex flex-wrap gap-3 justify-end">
                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <HiOutlineEye className="w-4 h-4" />
                      View Details
                    </Link>
                    {order.trackingNumber && (
                      <a
                        href={`/track/${order.orderNumber}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <HiOutlineTruck className="w-4 h-4" />
                        Track Order
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 rounded-lg font-medium ${
                    currentPage === index + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
