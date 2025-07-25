import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';
import Cookies from 'js-cookie';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  const token = Cookies.get('token');
  const baseURL = process.env.REACT_APP_API_URL;

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${baseURL}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        setMessages(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMessages();
    }
  }, [token, baseURL]);

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this message. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${baseURL}/messages/${messageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete message');
        }

        // Remove message from state
        setMessages(messages.filter(message => message._id !== messageId));

        // Show success message
        Swal.fire({
          title: 'Deleted!',
          text: 'Message has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
      } catch (err) {
        console.error('Error deleting message:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete message. Please try again.',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  };

  // Open user details modal
  const handleOpenUserModal = async (userId) => {
    if (!userId) return;

    setSelectedUser(userId);
    setShowUserModal(true);
    setUserDetails(null);
    setUserLoading(true);

    try {
      const response = await fetch(`${baseURL}/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setUserDetails(data.user);
    } catch (err) {
      console.error('Error fetching user details:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load user details. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setUserLoading(false);
    }
  };

  // Close user modal
  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setUserDetails(null);
  };

  // Filter messages based on search term
  const filteredMessages = messages.filter(message =>
    message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (message.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (message.userId?.phone?.includes(searchTerm))
  );

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <h1 className="text-2xl font-bold text-gray-900">Messages from Users</h1>
            <p className="mt-1 text-sm text-gray-600">Manage all messages sent by users</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="focus:ring-primary focus:border-primary block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <tr key={message._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                              <span className="text-white font-medium">
                                {message.userId?.username?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => handleOpenUserModal(message.userId?._id)}
                              className="text-sm font-medium text-gray-900 hover:text-primary transition-colors text-left"
                            >
                              {message.username || 'Unknown User'}
                            </button>
                            <div className="text-sm text-gray-500">
                              {message.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {message.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(message.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'No messages found matching your search.' : 'No messages found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredMessages.length}</span> of{' '}
                  <span className="font-medium">{messages.length}</span> messages
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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

      {/* User Details Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={handleCloseUserModal}
              ></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        User Details
                      </h3>
                      <button
                        type="button"
                        onClick={handleCloseUserModal}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {userLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : userDetails ? (
                      <div className="mt-2">
                        <div className="flex items-center mb-6">
                          <div className="flex-shrink-0 h-16 w-16">
                            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                              <span className="text-white font-medium text-xl">
                                {userDetails.username?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900">
                              {userDetails.username}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {userDetails.role?.charAt(0).toUpperCase() + userDetails.role?.slice(1) || 'User'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Contact Information</h5>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Phone:</span>
                                <span className="text-sm text-gray-900">{userDetails.phone || 'Not provided'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Email:</span>
                                <span className="text-sm text-gray-900">{userDetails.email || 'Not provided'}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Address</h5>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Country:</span>
                                <span className="text-sm text-gray-900">{userDetails.address?.country || 'Not provided'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">City:</span>
                                <span className="text-sm text-gray-900">{userDetails.address?.city || 'Not provided'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Street:</span>
                                <span className="text-sm text-gray-900">{userDetails.address?.street || 'Not provided'}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Account Information</h5>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Member Since:</span>
                                <span className="text-sm text-gray-900">
                                  {userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : 'Unknown'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Last Updated:</span>
                                <span className="text-sm text-gray-900">
                                  {userDetails.updatedAt ? new Date(userDetails.updatedAt).toLocaleDateString() : 'Unknown'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Activity</h5>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Orders:</span>
                                <span className="text-sm text-gray-900">
                                  {userDetails.orders?.length || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Failed to load user details
                      </div>
                    )}

                    <div className="mt-5 sm:mt-6">
                      <button
                        type="button"
                        onClick={handleCloseUserModal}
                        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
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

export default Messages;