import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, 
  HiOutlinePencil, HiOutlineShoppingBag, HiOutlineHeart, HiOutlineCog,
  HiOutlineLogout, HiPlus, HiOutlineTrash
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { authAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [addressForm, setAddressForm] = useState({
    label: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    isDefault: false,
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'wishlist') {
      fetchWishlist();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      setOrders(response.data.data);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getWishlist();
      setWishlist(response.data.data);
    } catch (err) {
      toast.error('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) {
      setEditMode(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await authAPI.updateAddress(editingAddress._id, addressForm);
        toast.success('Address updated successfully');
      } else {
        await authAPI.addAddress(addressForm);
        toast.success('Address added successfully');
      }
      setShowAddressModal(false);
      setEditingAddress(null);
      setAddressForm({
        label: '',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Pakistan',
        isDefault: false,
      });
      // Refresh user data
      window.location.reload();
    } catch (err) {
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await authAPI.deleteAddress(addressId);
      toast.success('Address deleted successfully');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressModal(true);
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: HiOutlineUser },
    { id: 'orders', label: 'My Orders', icon: HiOutlineShoppingBag },
    { id: 'addresses', label: 'Addresses', icon: HiOutlineLocationMarker },
    { id: 'wishlist', label: 'Wishlist', icon: HiOutlineHeart },
    { id: 'settings', label: 'Settings', icon: HiOutlineCog },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-display font-bold text-gray-800 mb-8">My Account</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* User Info */}
              <div className="text-center pb-6 border-b">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary-700">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="mt-6 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                      ${activeTab === tab.id 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <HiOutlineLogout className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 text-primary-600 hover:underline"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                  </div>

                  {editMode ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="input"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={authLoading} className="btn-primary">
                          {authLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="btn-outline"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 py-3 border-b">
                        <HiOutlineUser className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 py-3 border-b">
                        <HiOutlineMail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 py-3 border-b">
                        <HiOutlinePhone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{user?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">My Orders</h2>

                  {loading ? (
                    <Loading />
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <HiOutlineShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No orders yet</p>
                      <Link to="/shop" className="btn-primary">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-medium">Order #{order.orderNumber}</p>
                              <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                              </span>
                              <p className="font-bold mt-1">{formatPrice(order.grandTotal)}</p>
                            </div>
                          </div>
                          <div className="flex gap-4 overflow-x-auto">
                            {order.items.slice(0, 4).map((item, index) => (
                              <div key={index} className="flex-shrink-0 w-16 h-20 bg-gray-100 rounded overflow-hidden">
                                <img
                                  src={item.product?.images?.[0]?.url || '/images/placeholder.jpg'}
                                  alt={item.product?.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {order.items.length > 4 && (
                              <div className="flex-shrink-0 w-16 h-20 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-gray-500">+{order.items.length - 4}</span>
                              </div>
                            )}
                          </div>
                          <Link
                            to={`/orders/${order._id}`}
                            className="inline-block mt-4 text-primary-600 hover:underline"
                          >
                            View Details
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Saved Addresses</h2>
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setAddressForm({
                          label: '',
                          fullName: '',
                          phone: '',
                          addressLine1: '',
                          addressLine2: '',
                          city: '',
                          state: '',
                          postalCode: '',
                          country: 'Pakistan',
                          isDefault: false,
                        });
                        setShowAddressModal(true);
                      }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <HiPlus className="w-5 h-5" />
                      Add Address
                    </button>
                  </div>

                  {user?.addresses?.length === 0 ? (
                    <div className="text-center py-12">
                      <HiOutlineLocationMarker className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No addresses saved yet</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {user?.addresses?.map((address) => (
                        <div key={address._id} className="border rounded-lg p-4 relative">
                          {address.isDefault && (
                            <span className="absolute top-2 right-2 bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                          <h4 className="font-medium mb-2">{address.label}</h4>
                          <p className="text-sm text-gray-600">{address.fullName}</p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                          <div className="flex gap-4 mt-4">
                            <button
                              onClick={() => openEditAddress(address)}
                              className="text-primary-600 hover:underline text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">My Wishlist</h2>

                  {loading ? (
                    <Loading />
                  ) : wishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <HiOutlineHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                      <Link to="/shop" className="btn-primary">
                        Explore Products
                      </Link>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-4">
                      {wishlist.map((product) => (
                        <div key={product._id} className="border rounded-lg overflow-hidden">
                          <div className="aspect-square bg-gray-100">
                            <img
                              src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium truncate">{product.name}</h4>
                            <p className="text-primary-700 font-bold">{formatPrice(product.basePrice)}</p>
                            <Link
                              to={`/product/${product.slug}`}
                              className="block mt-2 text-center btn-outline py-2"
                            >
                              View Product
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Change Password</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Update your password to keep your account secure
                      </p>
                      <button className="btn-outline">Change Password</button>
                    </div>

                    {/* Email Preferences */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Email Preferences</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Manage your email notification preferences
                      </p>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
                          <span className="ml-2 text-sm">Order updates</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
                          <span className="ml-2 text-sm">Promotions and offers</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
                          <span className="ml-2 text-sm">Newsletter</span>
                        </label>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="border border-red-200 rounded-lg p-4">
                      <h3 className="font-medium text-red-600 mb-2">Delete Account</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Label (e.g., Home, Office)
            </label>
            <input
              type="text"
              value={addressForm.label}
              onChange={(e) => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={addressForm.fullName}
                onChange={(e) => setAddressForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={addressForm.phone}
                onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                className="input"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
            <input
              type="text"
              value={addressForm.addressLine1}
              onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2 <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={addressForm.addressLine2}
              onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine2: e.target.value }))}
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={addressForm.city}
                onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
              <input
                type="text"
                value={addressForm.state}
                onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                className="input"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input
                type="text"
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm(prev => ({ ...prev, postalCode: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={addressForm.country}
                onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                className="input"
                required
              />
            </div>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="ml-2 text-sm">Set as default address</span>
          </label>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingAddress ? 'Update Address' : 'Add Address'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddressModal(false);
                setEditingAddress(null);
              }}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
