import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineAdjustments, HiOutlineX, HiOutlineChevronDown } from 'react-icons/hi';
import ProductCard from '../components/products/ProductCard';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { productAPI, categoryAPI } from '../services/api';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') || '',
    newArrivals: searchParams.get('newArrivals') || '',
    bestSellers: searchParams.get('bestSellers') || '',
  });

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: searchParams.get('page') || 1,
        limit: 12,
      };

      if (searchParams.get('category')) params.category = searchParams.get('category');
      if (searchParams.get('minPrice')) params.minPrice = searchParams.get('minPrice');
      if (searchParams.get('maxPrice')) params.maxPrice = searchParams.get('maxPrice');
      if (searchParams.get('size')) params.size = searchParams.get('size');
      if (searchParams.get('sort')) params.sort = searchParams.get('sort');
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (searchParams.get('featured')) params.featured = searchParams.get('featured');
      if (searchParams.get('newArrivals')) params.newArrivals = searchParams.get('newArrivals');
      if (searchParams.get('bestSellers')) params.bestSellers = searchParams.get('bestSellers');
      if (searchParams.get('inStock')) params.inStock = searchParams.get('inStock');

      const response = await productAPI.getProducts(params);
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      sort: 'newest',
      search: '',
      featured: '',
      newArrivals: '',
      bestSellers: '',
    });
    setSearchParams({});
    setShowFilters(false);
  };

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageTitle = () => {
    if (filters.search) return `Search: "${filters.search}"`;
    if (filters.category) {
      const cat = categories.find(c => c.slug === filters.category);
      return cat?.name || 'Shop';
    }
    if (filters.featured) return 'Featured Products';
    if (filters.newArrivals) return 'New Arrivals';
    if (filters.bestSellers) return 'Best Sellers';
    return 'All Products';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-800 text-white py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-display font-bold">{getPageTitle()}</h1>
          <p className="text-primary-200 mt-2">{pagination.total} products found</p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            <HiOutlineAdjustments className="w-5 h-5" />
            Filters
            {Object.values(filters).filter(v => v && v !== 'newest').length > 0 && (
              <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                {Object.values(filters).filter(v => v && v !== 'newest').length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="relative">
              <select
                value={searchParams.get('sort') || 'newest'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`
            fixed inset-0 z-50 bg-white lg:static lg:bg-transparent lg:z-auto
            ${showFilters ? 'block' : 'hidden lg:block'}
            lg:w-64 lg:flex-shrink-0
          `}>
            <div className="h-full overflow-y-auto p-6 lg:p-0">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setShowFilters(false)}>
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">All Categories</span>
                  </label>
                  {categories.map(category => (
                    <label key={category._id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.slug}
                        checked={filters.category === category.slug}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => handleFilterChange('size', filters.size === size ? '' : size)}
                      className={`
                        px-3 py-1 border rounded-md text-sm transition-colors
                        ${filters.size === size
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:border-primary-600'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button onClick={applyFilters} className="flex-1 btn-primary py-2">
                  Apply Filters
                </button>
                <button onClick={clearFilters} className="btn-outline py-2">
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <Loading text="Loading products..." />
            ) : error ? (
              <ErrorMessage message={error} onRetry={fetchProducts} />
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="text-2xl font-display font-semibold text-gray-800 mb-2">
                  No products found
                </h2>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {[...Array(pagination.pages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`
                            w-10 h-10 rounded-md
                            ${pagination.page === i + 1
                              ? 'bg-primary-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                            }
                          `}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
