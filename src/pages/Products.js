import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';
import Cookies from 'js-cookie';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // New state for details modal
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null); // State for product details
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: [],
    sizes: '',
    colors: '',
    brand: '',
    inStock: true,
    stockQuantity: '',
    tags: '',
    discount: '',
    discountType: 'fixed',
    rating: '',
    numReviews: '',
    images: []
  });

  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: [],
    sizes: '',
    colors: '',
    brand: '',
    inStock: true,
    stockQuantity: '',
    tags: '',
    discount: '',
    discountType: 'fixed',
    rating: '',
    numReviews: '',
    images: [],
    removeImages: []
  });

  const token = Cookies.get('token');
  const baseURL = process.env.REACT_APP_API_URL;

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${baseURL}/products?page=${currentPage}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProducts();
    }
  }, [token, baseURL, currentPage, limit]);

  // Fetch categories and brands for dropdowns
  useEffect(() => {
    const fetchCategoriesAndBrands = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          fetch(`${baseURL}/products/categories`),
          fetch(`${baseURL}/products/brands`)
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData);
        }
      } catch (err) {
        console.error('Error fetching categories/brands:', err);
      }
    };

    fetchCategoriesAndBrands();
  }, [baseURL]);

  // Delete product
  const handleDeleteProduct = async (productId, productTitle) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete product "${productTitle}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${baseURL}/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        setProducts(products.filter(product => product._id !== productId));

        Swal.fire({
          title: 'Deleted!',
          text: 'Product has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
      } catch (err) {
        console.error('Error deleting product:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete product. Please try again.',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setCreateFormData({
      title: '',
      description: '',
      price: '',
      category: [],
      sizes: '',
      colors: '',
      brand: '',
      inStock: true,
      stockQuantity: '',
      tags: '',
      discount: '',
      discountType: 'fixed',
      rating: '',
      numReviews: '',
      images: []
    });
    setShowCreateModal(true);
  };

  // Open update modal
  const handleOpenUpdateModal = (product) => {
    setCurrentProduct(product);
    setUpdateFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || [],
      sizes: product.sizes ? product.sizes.join(',') : '',
      colors: product.colors ? product.colors.join(',') : '',
      brand: product.brand || '',
      inStock: product.inStock !== undefined ? product.inStock : true,
      stockQuantity: product.stockQuantity || '',
      tags: product.tags ? product.tags.join(',') : '',
      discount: product.discount || '',
      discountType: product.discountType || 'fixed',
      rating: product.rating || '',
      numReviews: product.numReviews || '',
      images: product.images || [],
      removeImages: []
    });
    setShowUpdateModal(true);
  };

  // Open details modal
  const handleOpenDetailsModal = async (product) => {
    try {
      // If we already have all the product details, use them
      if (product.title && product.description) {
        setSelectedProductDetails(product);
        setShowDetailsModal(true);
        return;
      }

      // Otherwise, fetch the full product details
      const response = await fetch(`${baseURL}/products/${product._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }

      const productDetails = await response.json();
      setSelectedProductDetails(productDetails);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching product details:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load product details. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // Close modals
  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowUpdateModal(false);
    setShowDetailsModal(false); // Close details modal
    setCurrentProduct(null);
    setSelectedProductDetails(null); // Clear product details
  };

  // Handle create form input changes
  const handleCreateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setCreateFormData({ ...createFormData, [name]: checked });
    } else if (name === 'category') {
      const selectedCategories = Array.from(e.target.selectedOptions, option => option.value);
      setCreateFormData({ ...createFormData, [name]: selectedCategories });
    } else if (name === 'newBrand') {
      setCreateFormData({
        ...createFormData,
        newBrand: value,
        brand: 'new'
      });
    } else {
      setCreateFormData({ ...createFormData, [name]: value });
    }
  };

  // Handle update form input changes
  const handleUpdateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setUpdateFormData({ ...updateFormData, [name]: checked });
    } else if (name === 'category') {
      const selectedCategories = Array.from(e.target.selectedOptions, option => option.value);
      setUpdateFormData({ ...updateFormData, [name]: selectedCategories });
    } else if (name === 'newBrand') {
      setUpdateFormData({
        ...updateFormData,
        newBrand: value,
        brand: 'new'
      });
    } else {
      setUpdateFormData({ ...updateFormData, [name]: value });
    }
  };

  // Handle image file selection for create
  const handleCreateImageChange = (e) => {
    const files = Array.from(e.target.files);
    setCreateFormData({ ...createFormData, images: files });
  };

  // Handle image file selection for update
  const handleUpdateImageChange = (e) => {
    const files = Array.from(e.target.files);
    setUpdateFormData({ ...updateFormData, images: [...updateFormData.images, ...files] });
  };

  // Handle image removal for update
  const handleRemoveImage = (imagePath) => {
    setUpdateFormData({
      ...updateFormData,
      removeImages: [...updateFormData.removeImages, imagePath],
      images: updateFormData.images.filter(img => img !== imagePath)
    });
  };

  // Submit create form
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Use new brand if 'new' is selected
      const brandValue = createFormData.brand === 'new'
        ? (createFormData.newBrand || 'Generic')
        : (createFormData.brand || 'Generic');

      // Append text fields
      Object.keys(createFormData).forEach(key => {
        if (key === 'images' || key === 'newBrand') return;
        if (key === 'category') {
          createFormData[key].forEach(cat => formData.append('category', cat));
        } else if (key === 'brand') {
          formData.append(key, brandValue);
        } else {
          formData.append(key, createFormData[key]);
        }
      });

      // Append image files
      createFormData.images.forEach(image => {
        formData.append('images', image);
      });

      const response = await fetch(`${baseURL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      const newProduct = await response.json();
      setProducts([newProduct, ...products]);

      Swal.fire({
        title: 'Success!',
        text: 'Product created successfully.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });

      handleCloseModals();
    } catch (err) {
      console.error('Error creating product:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to create product. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // Submit update form
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Use new brand if 'new' is selected
      const brandValue = updateFormData.brand === 'new'
        ? (updateFormData.newBrand || updateFormData.brand)
        : (updateFormData.brand || updateFormData.brand);

      // Append text fields
      Object.keys(updateFormData).forEach(key => {
        if (key === 'images' || key === 'removeImages' || key === 'newBrand') return;
        if (key === 'category') {
          updateFormData[key].forEach(cat => formData.append('category', cat));
        } else if (key === 'brand') {
          formData.append(key, brandValue);
        } else {
          formData.append(key, updateFormData[key]);
        }
      });

      // Append images to remove
      updateFormData.removeImages.forEach(imagePath => {
        formData.append('removeImages', imagePath);
      });

      // Append new image files
      updateFormData.images.forEach(image => {
        if (typeof image === 'object') {
          formData.append('images', image);
        }
      });

      const response = await fetch(`${baseURL}/products/${currentProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      setProducts(products.map(product =>
        product._id === currentProduct._id ? updatedProduct.data : product
      ));

      Swal.fire({
        title: 'Success!',
        text: 'Product updated successfully.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });

      handleCloseModals();
    } catch (err) {
      console.error('Error updating product:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to update product. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate discounted price
  const getDiscountedPrice = (product) => {
    if (product.discount > 0) {
      if (product.discountType === 'percentage') {
        return product.price - (product.price * product.discount / 100);
      } else {
        return product.price - product.discount;
      }
    }
    return product.price;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="mt-1 text-sm text-gray-600">Manage all products in your store</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="focus:ring-primary focus:border-primary block w-full pl-10 pr-12 py-2 sm:text-sm border border-gray-700 p-2 rounded-md"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={handleOpenCreateModal}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const discountedPrice = getDiscountedPrice(product);
                    const hasDiscount = product.discount > 0;

                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={`${baseURL}/public/images/products/${product.images[0]}`}
                                  alt={product.title}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.title}</div>
                              <div className="text-sm text-gray-500">
                                {product.sizes && product.sizes.length > 0 && (
                                  <span>{product.sizes.join(', ')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.category && product.category.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {product.category.slice(0, 2).map((cat, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {cat}
                                  </span>
                                ))}
                                {product.category.length > 2 && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    +{product.category.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">No category</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {hasDiscount ? (
                              <>
                                <span className="line-through text-gray-500">{formatCurrency(product.price)}</span>
                                <span className="ml-2 font-medium">{formatCurrency(discountedPrice)}</span>
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {product.discountType === 'percentage' ? `${product.discount}%` : formatCurrency(product.discount)} OFF
                                </span>
                              </>
                            ) : (
                              <span>{formatCurrency(product.price)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.inStock
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {product.inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.brand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-700 p-2'}`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-sm text-gray-500">
                              {product.rating} ({product.numReviews})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleOpenDetailsModal(product)}
                              className="text-gray-600 hover:text-gray-900 transition-colors"
                              title="View Details"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleOpenUpdateModal(product)}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors"
                              title="Edit Product"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id, product.title)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete Product"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'No products found matching your search.' : 'No products found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border border-gray-700 p-2 text-sm font-medium rounded-md ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border border-gray-700 p-2 text-sm font-medium rounded-md ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * limit, products.length)}
                  </span>{' '}
                  of <span className="font-medium">{products.length}</span> products
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border border-gray-700 p-2 text-sm font-medium ${currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                          ? 'z-10 bg-primary border-primary text-white'
                          : 'bg-white border border-gray-700 p-2 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border border-gray-700 p-2 text-sm font-medium ${currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={handleCloseModals}
              ></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Create New Product
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleCreateSubmit} encType="multipart/form-data">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="mb-4">
                              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Product Title *
                              </label>
                              <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                value={createFormData.title}
                                onChange={handleCreateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description *
                              </label>
                              <textarea
                                name="description"
                                id="description"
                                rows="3"
                                required
                                value={createFormData.description}
                                onChange={handleCreateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              ></textarea>
                            </div>

                            <div className="mb-4">
                              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                Price ($) *
                              </label>
                              <input
                                type="number"
                                name="price"
                                id="price"
                                required
                                min="0"
                                step="0.01"
                                value={createFormData.price}
                                onChange={handleCreateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                                Brand
                              </label>
                              <select
                                name="brand"
                                id="brand"
                                value={createFormData.brand}
                                onChange={handleCreateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              >
                                <option value="">Select a brand</option>
                                {brands.map((brand, index) => (
                                  <option key={index} value={brand}>{brand}</option>
                                ))}
                                <option value="new">Add New Brand</option>
                              </select>
                              {createFormData.brand === 'new' && (
                                <input
                                  type="text"
                                  name="newBrand"
                                  placeholder="Enter new brand"
                                  value={createFormData.newBrand || ''}
                                  className="mt-2 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                                  onChange={handleCreateInputChange}
                                />
                              )}
                            </div>

                            <div className="mb-4">
                              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Categories
                              </label>
                              <select
                                multiple
                                name="category"
                                id="category"
                                value={createFormData.category}
                                onChange={handleCreateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md h-32"
                              >
                                {categories.map((category, index) => (
                                  <option key={index} value={category}>{category}</option>
                                ))}
                              </select>
                              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple</p>
                            </div>
                          </div>

                          <div>
                            <div className="mb-4">
                              <label htmlFor="sizes" className="block text-sm font-medium text-gray-700">
                                Sizes (comma separated)
                              </label>
                              <input
                                type="text"
                                name="sizes"
                                id="sizes"
                                placeholder="S,M,L,XL"
                                value={createFormData.sizes}
                                onChange={handleCreateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="colors" className="block text-sm font-medium text-gray-700">
                                Colors (comma separated)
                              </label>
                              <input
                                type="text"
                                name="colors"
                                id="colors"
                                placeholder="red,blue,black"
                                value={createFormData.colors}
                                onChange={handleCreateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                Tags (comma separated)
                              </label>
                              <input
                                type="text"
                                name="tags"
                                id="tags"
                                placeholder="summer,casual,cotton"
                                value={createFormData.tags}
                                onChange={handleCreateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">
                                Stock Quantity
                              </label>
                              <input
                                type="number"
                                name="stockQuantity"
                                id="stockQuantity"
                                min="0"
                                value={createFormData.stockQuantity}
                                onChange={handleCreateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4 flex items-center">
                              <input
                                type="checkbox"
                                name="inStock"
                                id="inStock"
                                checked={createFormData.inStock}
                                onChange={handleCreateInputChange}
                                className="focus:ring-primary h-4 w-4 text-primary border border-gray-700 p-2 rounded"
                              />
                              <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
                                In Stock
                              </label>
                            </div>

                            <div className="mb-4">
                              <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                                Discount
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  name="discount"
                                  id="discount"
                                  min="0"
                                  step="0.01"
                                  value={createFormData.discount}
                                  onChange={handleCreateInputChange}
                                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-l-md"
                                />
                                <select
                                  name="discountType"
                                  value={createFormData.discountType}
                                  onChange={handleCreateInputChange}
                                  className="mt-1 focus:ring-primary focus:border-primary block shadow-sm sm:text-sm border border-gray-700 p-2 rounded-r-md"
                                >
                                  <option value="fixed">Fixed ($)</option>
                                  <option value="percentage">Percentage (%)</option>
                                </select>
                              </div>
                            </div>

                            <div className="mb-4">
                              <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                                Rating (0-5)
                              </label>
                              <input
                                type="number"
                                name="rating"
                                id="rating"
                                min="0"
                                max="5"
                                step="0.1"
                                value={createFormData.rating}
                                onChange={handleCreateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="numReviews" className="block text-sm font-medium text-gray-700">
                                Number of Reviews
                              </label>
                              <input
                                type="number"
                                name="numReviews"
                                id="numReviews"
                                min="0"
                                value={createFormData.numReviews}
                                onChange={handleCreateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Product Images
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border border-gray-700 p-2 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="create-images" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                  <span>Upload files</span>
                                  <input
                                    id="create-images"
                                    name="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleCreateImageChange}
                                    className="sr-only"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                          </div>
                          {createFormData.images.length > 0 && (
                            <div className="mt-2 text-sm text-gray-500">
                              {createFormData.images.length} file(s) selected
                            </div>
                          )}
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-primary text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Create Product
                          </button>
                          <button
                            type="button"
                            onClick={handleCloseModals}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border border-gray-700 p-2 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Product Modal */}
      {showUpdateModal && currentProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={handleCloseModals}
              ></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Update Product: {currentProduct.title}
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleUpdateSubmit} encType="multipart/form-data">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="mb-4">
                              <label htmlFor="update-title" className="block text-sm font-medium text-gray-700">
                                Product Title *
                              </label>
                              <input
                                type="text"
                                name="title"
                                id="update-title"
                                required
                                value={updateFormData.title}
                                onChange={handleUpdateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="update-description" className="block text-sm font-medium text-gray-700">
                                Description *
                              </label>
                              <textarea
                                name="description"
                                id="update-description"
                                rows="3"
                                required
                                value={updateFormData.description}
                                onChange={handleUpdateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              ></textarea>
                            </div>

                            <div className="mb-4">
                              <label htmlFor="update-price" className="block text-sm font-medium text-gray-700">
                                Price ($) *
                              </label>
                              <input
                                type="number"
                                name="price"
                                id="update-price"
                                required
                                min="0"
                                step="0.01"
                                value={updateFormData.price}
                                onChange={handleUpdateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="update-brand" className="block text-sm font-medium text-gray-700">
                                Brand
                              </label>
                              <select
                                name="brand"
                                id="update-brand"
                                value={updateFormData.brand}
                                onChange={handleUpdateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              >
                                <option value="">Select a brand</option>
                                {brands.map((brand, index) => (
                                  <option key={index} value={brand}>{brand}</option>
                                ))}
                                <option value="new">Add New Brand</option>
                              </select>
                              {updateFormData.brand === 'new' && (
                                <input
                                  type="text"
                                  name="newBrand"
                                  placeholder="Enter new brand"
                                  value={updateFormData.newBrand || ''}
                                  className="mt-2 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                                  onChange={handleUpdateInputChange}
                                />
                              )}
                            </div>

                            <div className="mb-4">
                              <label htmlFor="update-category" className="block text-sm font-medium text-gray-700">
                                Categories
                              </label>
                              <select
                                multiple
                                name="category"
                                id="update-category"
                                value={updateFormData.category}
                                onChange={handleUpdateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md h-32"
                              >
                                {categories.map((category, index) => (
                                  <option key={index} value={category}>{category}</option>
                                ))}
                              </select>
                              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple</p>
                            </div>
                          </div>

                          <div>
                            <div className="mb-4">
                              <label htmlFor="update-sizes" className="block text-sm font-medium text-gray-700">
                                Sizes (comma separated)
                              </label>
                              <input
                                type="text"
                                name="sizes"
                                id="update-sizes"
                                placeholder="S,M,L,XL"
                                value={updateFormData.sizes}
                                onChange={handleUpdateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="update-colors" className="block text-sm font-medium text-gray-700">
                                Colors (comma separated)
                              </label>
                              <input
                                type="text"
                                name="colors"
                                id="update-colors"
                                placeholder="red,blue,black"
                                value={updateFormData.colors}
                                onChange={handleUpdateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="update-tags" className="block text-sm font-medium text-gray-700">
                                Tags (comma separated)
                              </label>
                              <input
                                type="text"
                                name="tags"
                                id="update-tags"
                                placeholder="summer,casual,cotton"
                                value={updateFormData.tags}
                                onChange={handleUpdateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="update-stockQuantity" className="block text-sm font-medium text-gray-700">
                                Stock Quantity
                              </label>
                              <input
                                type="number"
                                name="stockQuantity"
                                id="update-stockQuantity"
                                min="0"
                                value={updateFormData.stockQuantity}
                                onChange={handleUpdateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4 flex items-center">
                              <input
                                type="checkbox"
                                name="inStock"
                                id="update-inStock"
                                checked={updateFormData.inStock}
                                onChange={handleUpdateInputChange}
                                className="focus:ring-primary h-4 w-4 text-primary border border-gray-700 p-2 rounded"
                              />
                              <label htmlFor="update-inStock" className="ml-2 block text-sm text-gray-700">
                                In Stock
                              </label>
                            </div>

                            <div className="mb-4">
                              <label htmlFor="update-discount" className="block text-sm font-medium text-gray-700">
                                Discount
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  name="discount"
                                  id="update-discount"
                                  min="0"
                                  step="0.01"
                                  value={updateFormData.discount}
                                  onChange={handleUpdateInputChange}
                                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-l-md"
                                />
                                <select
                                  name="discountType"
                                  value={updateFormData.discountType}
                                  onChange={handleUpdateInputChange}
                                  className="mt-1 focus:ring-primary focus:border-primary block shadow-sm sm:text-sm border border-gray-700 p-2 rounded-r-md"
                                >
                                  <option value="fixed">Fixed ($)</option>
                                  <option value="percentage">Percentage (%)</option>
                                </select>
                              </div>
                            </div>

                            <div className="mb-4">
                              <label htmlFor="update-rating" className="block text-sm font-medium text-gray-700">
                                Rating (0-5)
                              </label>
                              <input
                                type="number"
                                name="rating"
                                id="update-rating"
                                min="0"
                                max="5"
                                step="0.1"
                                value={updateFormData.rating}
                                onChange={handleUpdateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>

                            <div className="mb-4">
                              <label htmlFor="update-numReviews" className="block text-sm font-medium text-gray-700">
                                Number of Reviews
                              </label>
                              <input
                                type="number"
                                name="numReviews"
                                id="update-numReviews"
                                min="0"
                                value={updateFormData.numReviews}
                                onChange={handleUpdateInputChange}
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Current Images
                          </label>
                          <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {updateFormData.images.map((image, index) => (
                              <div key={index} className="relative">
                                {typeof image === 'string' ? (
                                  <img
                                    src={`${baseURL}/public/images/products/${image}`}
                                    alt={`Product ${index}`}
                                    className="h-20 w-20 object-cover rounded"
                                  />
                                ) : (
                                  <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center">
                                    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(image)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Add New Images
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border border-gray-700 p-2 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="update-images" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                  <span>Upload files</span>
                                  <input
                                    id="update-images"
                                    name="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleUpdateImageChange}
                                    className="sr-only"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-primary text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Update Product
                          </button>
                          <button
                            type="button"
                            onClick={handleCloseModals}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border border-gray-700 p-2 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {showDetailsModal && selectedProductDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={handleCloseModals}
              ></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Product Details
                      </h3>
                      <button
                        type="button"
                        onClick={handleCloseModals}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Product Images */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">Product Images</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedProductDetails.images && selectedProductDetails.images.length > 0 ? (
                            selectedProductDetails.images.map((image, index) => (
                              <img
                                key={index}
                                src={`${baseURL}/public/images/products/${image}`}
                                alt={`Product ${index + 1}`}
                                className="rounded-md object-cover w-full h-40"
                              />
                            ))
                          ) : (
                            <div className="col-span-2 h-40 bg-gray-200 rounded-md flex items-center justify-center">
                              <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Information */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">Product Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Title</h5>
                            <p className="text-sm text-gray-600">{selectedProductDetails.title}</p>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Description</h5>
                            <p className="text-sm text-gray-600">{selectedProductDetails.description}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Price</h5>
                              <p className="text-sm text-gray-600">{formatCurrency(selectedProductDetails.price)}</p>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Brand</h5>
                              <p className="text-sm text-gray-600">{selectedProductDetails.brand}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">In Stock</h5>
                              <p className="text-sm text-gray-600">
                                {selectedProductDetails.inStock ? (
                                  <span className="text-green-600">Yes ({selectedProductDetails.stockQuantity} items)</span>
                                ) : (
                                  <span className="text-red-600">No</span>
                                )}
                              </p>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Rating</h5>
                              <div className="flex items-center">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-4 h-4 ${i < Math.floor(selectedProductDetails.rating) ? 'text-yellow-400' : 'text-gray-700 p-2'}`}
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="ml-1 text-sm text-gray-600">
                                  {selectedProductDetails.rating} ({selectedProductDetails.numReviews} reviews)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Categories</h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedProductDetails.category && selectedProductDetails.category.length > 0 ? (
                                selectedProductDetails.category.map((cat, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {cat}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-600">No categories</span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Sizes</h5>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedProductDetails.sizes && selectedProductDetails.sizes.length > 0 ? (
                                  selectedProductDetails.sizes.map((size, index) => (
                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {size}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-600">No sizes</span>
                                )}
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Colors</h5>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedProductDetails.colors && selectedProductDetails.colors.length > 0 ? (
                                  selectedProductDetails.colors.map((color, index) => (
                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {color}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-600">No colors</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {selectedProductDetails.discount > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Discount</h5>
                              <p className="text-sm text-gray-600">
                                {selectedProductDetails.discountType === 'percentage'
                                  ? `${selectedProductDetails.discount}%`
                                  : formatCurrency(selectedProductDetails.discount)} OFF
                              </p>
                            </div>
                          )}

                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Tags</h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedProductDetails.tags && selectedProductDetails.tags.length > 0 ? (
                                selectedProductDetails.tags.map((tag, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-600">No tags</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6">
                      <button
                        type="button"
                        onClick={handleCloseModals}
                        className="inline-flex justify-center w-full rounded-md border border border-gray-700 p-2 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Products;