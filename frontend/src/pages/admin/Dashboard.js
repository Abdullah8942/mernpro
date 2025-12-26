import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineUsers, 
  HiOutlineShoppingBag, HiOutlineTrendingUp, HiOutlineTrendingDown,
  HiOutlineArrowRight, HiOutlinePlus, HiOutlineRefresh, HiOutlineEye,
  HiOutlineCalendar, HiOutlineSparkles
} from 'react-icons/hi';
import { orderAPI, productAPI, userAPI } from '../../services/api';
import Loading from '../../components/common/Loading';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        orderAPI.getAllAdmin({ limit: 5, sort: '-createdAt' }),
        productAPI.getAllAdmin({ limit: 5, sort: '-soldCount' }),
        userAPI.getAll({ limit: 1 }),
      ]);

      // Calculate stats from response
      const orders = ordersRes.data.data || [];
      const totalRevenue = orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

      setStats({
        totalRevenue: totalRevenue,
        totalOrders: ordersRes.data.pagination?.total || orders.length,
        totalCustomers: usersRes.data.pagination?.total || 0,
        totalProducts: productsRes.data.pagination?.total || 0,
      });

      setRecentOrders(orders);
      setTopProducts(productsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
      processing: 'bg-purple-100 text-purple-700 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return <Loading size="large" />;
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: HiOutlineCurrencyDollar,
      change: '+12.5%',
      isPositive: true,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: HiOutlineShoppingCart,
      change: '+8.2%',
      isPositive: true,
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: HiOutlineUsers,
      change: '+15.3%',
      isPositive: true,
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: HiOutlineShoppingBag,
      change: '+3.1%',
      isPositive: true,
      gradient: 'from-orange-500 to-amber-600',
      bgLight: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <HiOutlineSparkles className="w-64 h-64 -mr-16 -mt-16" />
        </div>
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">Welcome Back! 👋</h1>
              <p className="text-primary-200">Here's what's happening with your store today.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchDashboardData}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
              >
                <HiOutlineRefresh className="w-5 h-5" />
                Refresh
              </button>
              <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                <HiOutlineCalendar className="w-5 h-5" />
                <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 ${stat.bgLight} rounded-full`}>
                  {stat.isPositive ? (
                    <HiOutlineTrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <HiOutlineTrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-semibold ${stat.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
          <span className="text-sm text-gray-500">Manage your store</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/admin/products/new', icon: HiOutlinePlus, label: 'Add Product', color: 'primary' },
            { to: '/admin/orders?status=pending', icon: HiOutlineShoppingCart, label: 'Pending Orders', color: 'amber' },
            { to: '/admin/users', icon: HiOutlineUsers, label: 'Manage Users', color: 'violet' },
            { to: '/admin/analytics', icon: HiOutlineTrendingUp, label: 'View Analytics', color: 'emerald' },
          ].map((action, index) => (
            <Link
              key={index}
              to={action.to}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl bg-${action.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-7 h-7 text-${action.color}-600`} />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-primary-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts & Tables Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-800">Recent Orders</h2>
              <p className="text-sm text-gray-500 mt-1">Latest transactions</p>
            </div>
            <Link 
              to="/admin/orders" 
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View All 
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiOutlineShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1">Orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order._id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <HiOutlineShoppingBag className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <p className="font-bold text-gray-800 mt-1">{formatPrice(order.grandTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-800">Top Products</h2>
              <p className="text-sm text-gray-500 mt-1">Best selling items</p>
            </div>
            <Link 
              to="/admin/products" 
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View All 
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            {topProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiOutlineShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No products yet</p>
                <Link to="/admin/products/new" className="text-sm text-primary-600 mt-1 hover:underline">
                  Add your first product →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div 
                    key={product._id} 
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="relative">
                      <span className="absolute -top-2 -left-2 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {index + 1}
                      </span>
                      <div className="w-16 h-20 bg-white rounded-xl overflow-hidden shadow-sm">
                        <img
                          src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">{product.soldCount || 0} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{formatPrice(product.basePrice)}</p>
                      <Link 
                        to={`/admin/products/${product._id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
