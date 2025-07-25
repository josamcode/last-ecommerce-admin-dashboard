import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';
import Cookies from 'js-cookie';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    coupon: '',
    type: 'percent',
    value: '',
    expiresAt: '',
    minCartValue: ''
  });

  const [updateFormData, setUpdateFormData] = useState({
    coupon: '',
    type: 'percent',
    value: '',
    expiresAt: '',
    minCartValue: ''
  });

  const token = Cookies.get('token');
  const baseURL = process.env.REACT_APP_API_URL;

  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${baseURL}/coupons`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch coupons');
        }

        const data = await response.json();
        setCoupons(data.coupons || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching coupons:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCoupons();
    }
  }, [token, baseURL]);

  // Delete coupon
  const handleDeleteCoupon = async (couponId, couponCode) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete coupon "${couponCode}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${baseURL}/coupons/${couponId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete coupon');
        }

        // Remove coupon from state
        setCoupons(coupons.filter(coupon => coupon._id !== couponId));

        // Show success message
        Swal.fire({
          title: 'Deleted!',
          text: 'Coupon has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
      } catch (err) {
        console.error('Error deleting coupon:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete coupon. Please try again.',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setCreateFormData({
      coupon: '',
      type: 'percent',
      value: '',
      expiresAt: '',
      minCartValue: ''
    });
    setShowCreateModal(true);
  };

  // Open update modal
  const handleOpenUpdateModal = (coupon) => {
    setCurrentCoupon(coupon);
    setUpdateFormData({
      coupon: coupon.coupon || '',
      type: coupon.type || 'percent',
      value: coupon.value || '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
      minCartValue: coupon.minCartValue || ''
    });
    setShowUpdateModal(true);
  };

  // Close modals
  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowUpdateModal(false);
    setCurrentCoupon(null);
  };

  // Handle create form input changes
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData({ ...createFormData, [name]: value });
  };

  // Handle update form input changes
  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData({ ...updateFormData, [name]: value });
  };

  // Submit create form
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseURL}/coupons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create coupon');
      }

      const newCoupon = await response.json();
      setCoupons([newCoupon, ...coupons]);

      Swal.fire({
        title: 'Success!',
        text: 'Coupon created successfully.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });

      handleCloseModals();
    } catch (err) {
      console.error('Error creating coupon:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to create coupon. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // Submit update form
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseURL}/coupons/${currentCoupon._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update coupon');
      }

      const updatedCoupon = await response.json();
      setCoupons(coupons.map(coupon =>
        coupon._id === currentCoupon._id ? updatedCoupon : coupon
      ));

      Swal.fire({
        title: 'Success!',
        text: 'Coupon updated successfully.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });

      handleCloseModals();
    } catch (err) {
      console.error('Error updating coupon:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to update coupon. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // Filter coupons based on search term
  const filteredCoupons = coupons.filter(coupon =>
    coupon.coupon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
            <h1 className="text-2xl font-bold text-gray-900">Coupons Management</h1>
            <p className="mt-1 text-sm text-gray-600">Manage all coupons in your store</p>
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
                placeholder="Search coupons..."
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
              Add Coupon
            </button>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coupon Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min. Cart Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{coupon.coupon}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.type === 'percent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                          }`}>
                          {coupon.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.type === 'percent'
                          ? `${coupon.value}%`
                          : formatCurrency(coupon.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(coupon.expiresAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(coupon.minCartValue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usedBy ? coupon.usedBy.length : 0} used
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenUpdateModal(coupon)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id, coupon.coupon)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'No coupons found matching your search.' : 'No coupons found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Coupon Modal */}
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

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Create New Coupon
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleCreateSubmit}>
                        <div className="mb-4">
                          <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">
                            Coupon Code *
                          </label>
                          <input
                            type="text"
                            name="coupon"
                            id="coupon"
                            required
                            value={createFormData.coupon}
                            onChange={handleCreateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                            placeholder="SUMMER20"
                          />
                        </div>

                        <div className="mb-4">
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Discount Type *
                          </label>
                          <select
                            name="type"
                            id="type"
                            required
                            value={createFormData.type}
                            onChange={handleCreateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                          >
                            <option value="percent">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                            Discount Value *
                          </label>
                          <input
                            type="number"
                            name="value"
                            id="value"
                            required
                            min="0"
                            step="0.01"
                            value={createFormData.value}
                            onChange={handleCreateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                            placeholder={createFormData.type === 'percent' ? '20' : '20.00'}
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            {createFormData.type === 'percent' ? 'Enter percentage (e.g., 20 for 20%)' : 'Enter fixed amount (e.g., 20.00)'}
                          </p>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="minCartValue" className="block text-sm font-medium text-gray-700">
                            Minimum Cart Value
                          </label>
                          <input
                            type="number"
                            name="minCartValue"
                            id="minCartValue"
                            min="0"
                            step="0.01"
                            value={createFormData.minCartValue}
                            onChange={handleCreateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                            placeholder="0.00"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Minimum cart value required to use this coupon
                          </p>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                            Expiration Date
                          </label>
                          <input
                            type="date"
                            name="expiresAt"
                            id="expiresAt"
                            value={createFormData.expiresAt}
                            onChange={handleCreateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                          />
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-primary text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Create Coupon
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

      {/* Update Coupon Modal */}
      {showUpdateModal && currentCoupon && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={handleCloseModals}
              ></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Update Coupon: {currentCoupon.coupon}
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleUpdateSubmit}>
                        <div className="mb-4">
                          <label htmlFor="update-coupon" className="block text-sm font-medium text-gray-700">
                            Coupon Code *
                          </label>
                          <input
                            type="text"
                            name="coupon"
                            id="update-coupon"
                            required
                            value={updateFormData.coupon}
                            onChange={handleUpdateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                            placeholder="SUMMER20"
                          />
                        </div>

                        <div className="mb-4">
                          <label htmlFor="update-type" className="block text-sm font-medium text-gray-700">
                            Discount Type *
                          </label>
                          <select
                            name="type"
                            id="update-type"
                            required
                            value={updateFormData.type}
                            onChange={handleUpdateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                          >
                            <option value="percent">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="update-value" className="block text-sm font-medium text-gray-700">
                            Discount Value *
                          </label>
                          <input
                            type="number"
                            name="value"
                            id="update-value"
                            required
                            min="0"
                            step="0.01"
                            value={updateFormData.value}
                            onChange={handleUpdateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                            placeholder={updateFormData.type === 'percent' ? '20' : '20.00'}
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            {updateFormData.type === 'percent' ? 'Enter percentage (e.g., 20 for 20%)' : 'Enter fixed amount (e.g., 20.00)'}
                          </p>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="update-minCartValue" className="block text-sm font-medium text-gray-700">
                            Minimum Cart Value
                          </label>
                          <input
                            type="number"
                            name="minCartValue"
                            id="update-minCartValue"
                            min="0"
                            step="0.01"
                            value={updateFormData.minCartValue}
                            onChange={handleUpdateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                            placeholder="0.00"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Minimum cart value required to use this coupon
                          </p>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="update-expiresAt" className="block text-sm font-medium text-gray-700">
                            Expiration Date
                          </label>
                          <input
                            type="date"
                            name="expiresAt"
                            id="update-expiresAt"
                            value={updateFormData.expiresAt}
                            onChange={handleUpdateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                          />
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-primary text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Update Coupon
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
    </Layout>
  );
};

export default Coupons;