import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  HiOutlineHome, HiOutlineShoppingBag, HiOutlineCollection, HiOutlineClipboardList,
  HiOutlineUsers, HiOutlineChartBar, HiOutlineCog, HiOutlineMenu, HiOutlineX,
  HiOutlineBell, HiOutlineLogout, HiOutlineSearch,
  HiOutlineChevronDown
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPendingOrders = useCallback(async () => {
    try {
      const response = await orderAPI.getAllAdmin({ status: 'pending', limit: 1 });
      setPendingCount(response.data.pagination?.total || 0);
    } catch (err) {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchPendingOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    if (q.includes('order')) navigate('/admin/orders');
    else if (q.includes('product')) navigate('/admin/products');
    else if (q.includes('user') || q.includes('customer')) navigate('/admin/users');
    else if (q.includes('categor')) navigate('/admin/categories');
    else if (q.includes('analytic') || q.includes('stat')) navigate('/admin/analytics');
    else if (q.includes('setting')) navigate('/admin/settings');
    else navigate('/admin/orders');
    setSearchQuery('');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: HiOutlineHome, exact: true },
    { path: '/admin/products', label: 'Products', icon: HiOutlineShoppingBag },
    { path: '/admin/categories', label: 'Categories', icon: HiOutlineCollection },
    { path: '/admin/orders', label: 'Orders', icon: HiOutlineClipboardList },
    { path: '/admin/users', label: 'Users', icon: HiOutlineUsers },
    { path: '/admin/analytics', label: 'Analytics', icon: HiOutlineChartBar },
    { path: '/admin/settings', label: 'Settings', icon: HiOutlineCog },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 shadow-2xl transform transition-all duration-300 ease-out
          lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/30">
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">M&E Admin</h1>
              <p className="text-xs text-primary-300">Management Portal</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white transition-colors"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 mt-4">
          <p className="px-4 text-xs font-semibold text-primary-400 uppercase tracking-wider mb-4">
            Main Menu
          </p>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200
                ${isActive(item.path, item.exact)
                  ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                  : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center transition-all
                ${isActive(item.path, item.exact)
                  ? 'bg-gold-500 shadow-lg shadow-gold-500/30'
                  : 'bg-white/5 group-hover:bg-white/10'
                }
              `}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-medium">{item.label}</span>
              {isActive(item.path, item.exact) && (
                <div className="ml-auto w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-primary-300 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs font-medium rounded-full">
                  Admin
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all font-medium"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50">
          <div className="flex items-center justify-between h-20 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors"
              >
                <HiOutlineMenu className="w-6 h-6" />
              </button>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 w-80">
                <HiOutlineSearch className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders, products, users..."
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                />
              </form>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button 
                onClick={() => navigate('/admin/orders')}
                className="relative w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors"
                title="Pending orders"
              >
                <HiOutlineBell className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </button>

              {/* View Store Link */}
              <Link 
                to="/" 
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-primary-600/30"
              >
                View Store
                <HiOutlineChevronDown className="w-4 h-4 -rotate-90" />
              </Link>

              {/* Mobile User Avatar */}
              <button className="lg:hidden w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.firstName?.[0]}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8 min-h-[calc(100vh-5rem)]">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-200 bg-white/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Meraab &amp; Emaan. All rights reserved.</p>
            <p>Made with ❤️ for fashion</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
