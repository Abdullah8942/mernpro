import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch,
  HiOutlineEye, HiOutlinePhotograph, HiOutlineEyeOff
} from 'react-icons/hi';
import { productAPI, categoryAPI, getImageUrl } from '../../services/api';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null, permanent: false });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1,
    limit: 10,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status === 'active' && { isActive: true }),
        ...(filters.status === 'inactive' && { isActive: false }),
      };
      const response = await productAPI.getAllAdmin(params);
      setProducts(response.data.data || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleToggleStatus = async (product) => {
    try {
      await productAPI.update(product._id, { isActive: !product.isActive });
      toast.success(product.isActive ? 'Product deactivated' : 'Product activated');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update product status');
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteModal.permanent) {
        await productAPI.delete(deleteModal.product._id);
        toast.success('Product permanently deleted');
      } else {
        await productAPI.update(deleteModal.product._id, { isActive: false });
        toast.success('Product deactivated');
      }
      setDeleteModal({ open: false, product: null, permanent: false });
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">Manage your product inventory</p>
        </div>
        <Link
          to="/admin/products/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="input pl-10"
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
            className="input"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="input"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filters.limit}
            onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            className="input"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlinePhotograph className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No products found</p>
            <Link to="/admin/products/new" className="btn-primary">
              Add Your First Product
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={getImageUrl(product.images?.[0]?.url)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{product.category?.name || '-'}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{formatPrice(product.basePrice)}</p>
                          {product.discount?.value > 0 && (
                            <p className="text-xs text-green-600">
                              -{product.discount.value}{product.discount.type === 'percentage' ? '%' : ' PKR'}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm ${product.totalStock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                          {product.totalStock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`
                          px-2 py-1 rounded-full text-xs
                          ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                        `}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${product.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-primary-600"
                            title="View"
                          >
                            <HiOutlineEye className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="p-2 text-gray-400 hover:text-primary-600"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(product)}
                            className={`p-2 ${product.isActive ? 'text-gray-400 hover:text-yellow-600' : 'text-gray-400 hover:text-green-600'}`}
                            title={product.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {product.isActive ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, product, permanent: false })}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-gray-500">
                  Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
                  {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={filters.page === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page === pagination.pages}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null, permanent: false })}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            What would you like to do with <strong>{deleteModal.product?.name}</strong>?
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setDeleteModal(prev => ({ ...prev, permanent: false }));
                handleDelete();
              }}
              className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
            >
              <HiOutlineEyeOff className="w-5 h-5" />
              Deactivate (Soft Delete)
            </button>
            <p className="text-xs text-gray-500 text-center">Product will be hidden from shop but data is preserved</p>
            
            <button
              onClick={() => {
                setDeleteModal(prev => ({ ...prev, permanent: true }));
                handleDelete();
              }}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <HiOutlineTrash className="w-5 h-5" />
              Permanently Delete
            </button>
            <p className="text-xs text-red-500 text-center">This action cannot be undone!</p>
          </div>
          
          <button
            onClick={() => setDeleteModal({ open: false, product: null, permanent: false })}
            className="w-full btn-outline"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
