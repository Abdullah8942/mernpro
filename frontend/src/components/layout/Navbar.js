import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser, HiOutlineSearch, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartItemsCount } = useCart();
  const navigate = useNavigate();

  const categories = [
    { name: 'Shalwar Kameez', slug: 'shalwar-kameez' },
    { name: 'Bridal', slug: 'bridal' },
    { name: 'Formal', slug: 'formal-wear' },
    { name: 'Casual', slug: 'casual-wear' },
    { name: 'Party Wear', slug: 'party-wear' },
    { name: 'New Arrivals', slug: 'new-arrivals' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-primary-800 text-white text-center py-2 text-sm">
        <p>Free Shipping on Orders Over PKR 5,000 | Use Code: MERAAB10 for 10% Off</p>
      </div>

      <nav className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-700">
              Meraab <span className="text-gold-500">&</span> Emaan
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/shop?category=${category.slug}`}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <HiOutlineSearch className="w-6 h-6" />
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/wishlist" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <HiOutlineHeart className="w-6 h-6" />
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <HiOutlineShoppingBag className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative group">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <HiOutlineUser className="w-6 h-6" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                {isAuthenticated ? (
                  <>
                    <p className="px-4 py-2 text-sm text-gray-500 border-b">
                      Hi, {user?.firstName}
                    </p>
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      My Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-primary-600 hover:bg-gray-100">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Login
                    </Link>
                    <Link to="/register" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t animate-slide-down">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 input"
                autoFocus
              />
              <button type="submit" className="btn-primary ml-2">
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t animate-slide-down">
            <div className="flex flex-col space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/shop?category=${category.slug}`}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/shop"
                className="px-4 py-2 text-primary-600 font-medium hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                View All Products
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
