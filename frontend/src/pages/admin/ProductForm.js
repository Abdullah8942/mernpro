import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineUpload, HiOutlineX, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import { productAPI, categoryAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    basePrice: '',
    sku: '',
    fabric: '',
    careInstructions: '',
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    discount: {
      type: 'percentage',
      value: '',
    },
    sizeVariations: [
      { size: 'XS', stock: 0, priceAdjustment: 0 },
      { size: 'S', stock: 0, priceAdjustment: 0 },
      { size: 'M', stock: 0, priceAdjustment: 0 },
      { size: 'L', stock: 0, priceAdjustment: 0 },
      { size: 'XL', stock: 0, priceAdjustment: 0 },
    ],
    colors: [],
  });

  const [errors, setErrors] = useState({});

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.data);
    } catch (err) {
      toast.error('Failed to fetch categories');
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      const product = response.data.data;
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        category: product.category?._id || '',
        basePrice: product.basePrice || '',
        sku: product.sku || '',
        fabric: product.fabric || '',
        careInstructions: product.careInstructions || '',
        isActive: product.isActive,
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        isBestSeller: product.isBestSeller || false,
        discount: product.discount || { type: 'percentage', value: '' },
        sizeVariations: product.sizeVariations?.length > 0 ? product.sizeVariations : [
          { size: 'XS', stock: 0, priceAdjustment: 0 },
          { size: 'S', stock: 0, priceAdjustment: 0 },
          { size: 'M', stock: 0, priceAdjustment: 0 },
          { size: 'L', stock: 0, priceAdjustment: 0 },
          { size: 'XL', stock: 0, priceAdjustment: 0 },
        ],
        colors: product.colors || [],
      });

      if (product.images?.length > 0) {
        setImagePreviews(product.images.map(img => img.url));
      }
    } catch (err) {
      toast.error('Failed to fetch product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [isEdit, fetchCategories, fetchProduct]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.basePrice || formData.basePrice <= 0) newErrors.basePrice = 'Valid price is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      discount: { ...prev.discount, [name]: value },
    }));
  };

  const handleSizeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizeVariations: prev.sizeVariations.map((sv, i) =>
        i === index ? { ...sv, [field]: field === 'size' ? value : Number(value) } : sv
      ),
    }));
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizeVariations: [...prev.sizeVariations, { size: '', stock: 0, priceAdjustment: 0 }],
    }));
  };

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizeVariations: prev.sizeVariations.filter((_, i) => i !== index),
    }));
  };

  const handleColorChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', hexCode: '#000000', images: [] }],
    }));
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      const submitData = new FormData();

      // Append basic fields
      submitData.append('name', formData.name);
      submitData.append('description', formData.description || ' '); // Required field
      submitData.append('shortDescription', formData.shortDescription);
      submitData.append('category', formData.category);
      submitData.append('basePrice', formData.basePrice);
      submitData.append('sku', formData.sku);
      submitData.append('fabric', formData.fabric);
      submitData.append('careInstructions', formData.careInstructions);
      submitData.append('isActive', formData.isActive);
      submitData.append('isFeatured', formData.isFeatured);
      submitData.append('isNewArrival', formData.isNewArrival);
      submitData.append('isBestSeller', formData.isBestSeller);

      // Append discount
      if (formData.discount.value) {
        submitData.append('discount', JSON.stringify(formData.discount));
      }

      // Append size variations - filter out sizes with 0 stock if not edit mode
      const validSizeVariations = formData.sizeVariations.filter(sv => 
        sv.size && (isEdit || sv.stock > 0 || true) // Keep all sizes
      );
      submitData.append('sizeVariations', JSON.stringify(validSizeVariations));

      // Append colors
      submitData.append('colors', JSON.stringify(formData.colors));

      // For edit mode, send existing images that are URLs (not new file uploads)
      if (isEdit) {
        const existingImageUrls = imagePreviews.filter(img => 
          typeof img === 'string' && (img.startsWith('/uploads') || img.startsWith('http'))
        );
        if (existingImageUrls.length > 0) {
          submitData.append('existingImages', JSON.stringify(existingImageUrls));
        }
      }

      // Append new image files
      imageFiles.forEach(file => {
        submitData.append('images', file);
      });

      if (isEdit) {
        await productAPI.update(id, submitData);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(submitData);
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Save product error:', err);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading size="large" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-sm text-gray-500">
          {isEdit ? 'Update product information' : 'Add a new product to your store'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`input ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className={`input ${errors.sku ? 'border-red-500' : ''}`}
                />
                {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                maxLength={200}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fabric
                </label>
                <input
                  type="text"
                  name="fabric"
                  value={formData.fabric}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Care Instructions
                </label>
                <input
                  type="text"
                  name="careInstructions"
                  value={formData.careInstructions}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold mb-4">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (PKR) *
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
                min="0"
                className={`input ${errors.basePrice ? 'border-red-500' : ''}`}
              />
              {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type
              </label>
              <select
                name="type"
                value={formData.discount.type}
                onChange={handleDiscountChange}
                className="input"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (PKR)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value
              </label>
              <input
                type="number"
                name="value"
                value={formData.discount.value}
                onChange={handleDiscountChange}
                min="0"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold mb-4">Images</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <HiOutlineUpload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Click to upload images</p>
              <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Size Variations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Size Variations</h2>
            <button type="button" onClick={addSize} className="btn-outline text-sm">
              <HiOutlinePlus className="w-4 h-4 inline mr-1" />
              Add Size
            </button>
          </div>
          <div className="space-y-3">
            {formData.sizeVariations.map((sv, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Size</label>
                  <input
                    type="text"
                    value={sv.size}
                    onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Stock</label>
                  <input
                    type="number"
                    value={sv.stock}
                    onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                    min="0"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Price Adjustment</label>
                  <input
                    type="number"
                    value={sv.priceAdjustment}
                    onChange={(e) => handleSizeChange(index, 'priceAdjustment', e.target.value)}
                    className="input"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Colors</h2>
            <button type="button" onClick={addColor} className="btn-outline text-sm">
              <HiOutlinePlus className="w-4 h-4 inline mr-1" />
              Add Color
            </button>
          </div>
          <div className="space-y-3">
            {formData.colors.map((color, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Color Name</label>
                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Hex Code</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={color.hexCode}
                      onChange={(e) => handleColorChange(index, 'hexCode', e.target.value)}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color.hexCode}
                      onChange={(e) => handleColorChange(index, 'hexCode', e.target.value)}
                      className="input flex-1"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Status Flags */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold mb-4">Status & Visibility</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span>Active (visible on store)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span>Featured Product</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={formData.isNewArrival}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span>New Arrival</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={formData.isBestSeller}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span>Best Seller</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-3 px-8 disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn-outline py-3 px-8"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
