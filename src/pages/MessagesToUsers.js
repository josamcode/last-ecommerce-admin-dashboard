import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';
import Cookies from 'js-cookie';

const MessagesToUsers = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateAllModal, setShowCreateAllModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    receiverId: '',
    content: '',
    type: 'general'
  });

  const [createAllFormData, setCreateAllFormData] = useState({
    content: '',
    type: 'general'
  });

  const [updateFormData, setUpdateFormData] = useState({
    content: '',
    type: 'general'
  });

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [debouncedUserSearchTerm, setDebouncedUserSearchTerm] = useState('');

  const token = Cookies.get('token');
  const baseURL = process.env.REACT_APP_API_URL;

  // Debounce user search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearchTerm(userSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  // Fetch current user (admin) data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${baseURL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    if (token) {
      fetchCurrentUser();
    }
  }, [token, baseURL]);

  // Fetch messages and users
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch messages and users in parallel
        const [messagesRes, usersRes] = await Promise.all([
          fetch(`${baseURL}/message-to-user`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${baseURL}/users`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (!messagesRes.ok || !usersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const messagesData = await messagesRes.json();
        const usersData = await usersRes.json();

        setMessages(messagesData.messages || []);
        setUsers(usersData.users || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, baseURL]);

  // Delete message
  const handleDeleteMessage = async (messageId) => {
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
        const response = await fetch(`${baseURL}/message-to-user/${messageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete message');
        }

        setMessages(messages.filter(message => message._id !== messageId));

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

  // Open create modal (single user)
  const handleOpenCreateModal = () => {
    setCreateFormData({
      receiverId: '',
      content: '',
      type: 'general'
    });
    setUserSearchTerm('');
    setDebouncedUserSearchTerm('');
    setShowCreateModal(true);
  };

  // Open create all modal
  const handleOpenCreateAllModal = () => {
    setCreateAllFormData({
      content: '',
      type: 'general'
    });
    setShowCreateAllModal(true);
  };

  // Open update modal
  const handleOpenUpdateModal = (message) => {
    setCurrentMessage(message);
    setUpdateFormData({
      content: message.content || '',
      type: message.type || 'general'
    });
    setShowUpdateModal(true);
  };

  // Open details modal
  const handleOpenDetailsModal = (message) => {
    setSelectedMessage(message);
    setShowDetailsModal(true);
  };

  // Close modals
  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowCreateAllModal(false);
    setShowUpdateModal(false);
    setShowDetailsModal(false);
    setCurrentMessage(null);
    setSelectedMessage(null);
  };

  // Handle create form input changes (single user)
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData({ ...createFormData, [name]: value });
  };

  // Handle create all form input changes
  const handleCreateAllInputChange = (e) => {
    const { name, value } = e.target;
    setCreateAllFormData({ ...createAllFormData, [name]: value });
  };

  // Handle update form input changes
  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData({ ...updateFormData, [name]: value });
  };

  // Handle user search
  const handleUserSearch = (e) => {
    setUserSearchTerm(e.target.value);
  };

  // Filter users based on search term (debounced)
  // const filteredUsers = users.filter(user =>
  //   user.role !== 'admin' &&
  //   (user.username.toLowerCase().includes(debouncedUserSearchTerm.toLowerCase()) ||
  //     user.phone.includes(debouncedUserSearchTerm))
  // );

  const filteredUsers = users;

  // Group similar messages
  const groupSimilarMessages = (messages) => {
    const grouped = {};

    messages.forEach(message => {
      // Create a key based on content, type, and sender (ignoring receiver and exact timestamp)
      const key = `${message.content}-${message.type}-${message.sender?._id}`;

      if (!grouped[key]) {
        grouped[key] = {
          ...message,
          receivers: [message.receiver],
          isGrouped: false
        };
      } else {
        // If it's the first time we're grouping, mark it
        if (!grouped[key].isGrouped) {
          grouped[key].isGrouped = true;
          grouped[key].receivers = [grouped[key].receiver, message.receiver];
          delete grouped[key].receiver; // Remove single receiver
        } else {
          // Add to existing receivers array
          grouped[key].receivers.push(message.receiver);
        }
      }
    });

    // Convert grouped object back to array
    return Object.values(grouped);
  };

  // Submit create form (single user)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseURL}/message-to-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create message');
      }

      const newMessage = await response.json();

      // Fetch the full message with populated data
      const fullMessageResponse = await fetch(`${baseURL}/message-to-user/${newMessage.message._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (fullMessageResponse.ok) {
        const fullMessageData = await fullMessageResponse.json();
        setMessages([fullMessageData.message, ...messages]);
      } else {
        setMessages([newMessage.message, ...messages]);
      }

      Swal.fire({
        title: 'Success!',
        text: 'Message sent successfully.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });

      handleCloseModals();
    } catch (err) {
      console.error('Error creating message:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to send message. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // Submit create all form
  const handleCreateAllSubmit = async (e) => {
    e.preventDefault();

    // Confirm before sending to all users
    const result = await Swal.fire({
      title: 'Send to All Users?',
      text: 'This will send the message to all users in the system. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, send to all!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${baseURL}/message-to-user/all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createAllFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create message');
      }

      const resultData = await response.json();

      Swal.fire({
        title: 'Success!',
        text: `Message sent to ${resultData.count} users successfully.`,
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });

      // Refresh messages list
      const messagesRes = await fetch(`${baseURL}/message-to-user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData.messages || []);
      }

      handleCloseModals();
    } catch (err) {
      console.error('Error creating message to all users:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to send message to all users. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // Submit update form
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseURL}/message-to-user/edit/${currentMessage._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update message');
      }

      const updatedMessage = await response.json();
      setMessages(messages.map(message =>
        message._id === currentMessage._id ? updatedMessage.updated : message
      ));

      Swal.fire({
        title: 'Success!',
        text: 'Message updated successfully.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });

      handleCloseModals();
    } catch (err) {
      console.error('Error updating message:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to update message. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // Filter messages based on search term
  const filteredMessages = groupSimilarMessages(
    messages.filter(message =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.sender?.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.receiver?.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.type?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
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

  // Get type badge class
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'notification':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'system':
        return 'bg-purple-100 text-purple-800';
      case 'reply':
        return 'bg-green-100 text-green-800';
      case 'general':
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Messages to Users</h1>
            <p className="mt-1 text-sm text-gray-600">Send and manage messages to users</p>
            {currentUser && (
              <p className="mt-1 text-sm text-gray-500">Logged in as: {currentUser.username}</p>
            )}
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
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={handleOpenCreateModal}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Send Message
              </button>
            </div>
            <button
              className="inline-flex items-center px-4 py-2 border border border-gray-700 p-2 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={handleOpenCreateAllModal}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              To All Users
            </button>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receiver
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
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
                  filteredMessages.map((message, index) => (
                    <tr key={`${message._id || index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                              <span className="text-white font-medium">
                                {message.sender?.username?.charAt(0).toUpperCase() || 'A'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {message.sender?.username || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {message.sender?.role || 'Admin'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {message.isGrouped ? (
                          <div className="text-sm text-gray-900">
                            Sent to {message.receivers.length} users
                            <button
                              onClick={() => handleOpenDetailsModal({ ...message, groupedReceivers: message.receivers })}
                              className="ml-2 text-xs text-primary hover:underline"
                            >
                              View all
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-700 font-medium text-xs">
                                  {message.receiver?.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {message.receiver?.username || 'Unknown'}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {message.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(message.type)}`}>
                          {message.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(message.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenDetailsModal(message)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="View Details"
                          >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {!message.isGrouped && (
                            <>
                              <button
                                onClick={() => handleOpenUpdateModal(message)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                title="Edit Message"
                              >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message._id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete Message"
                              >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'No messages found matching your search.' : 'No messages found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Message Modal (Single User) */}
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
                      Send Message to User
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleCreateSubmit}>
                        <div className="mb-4">
                          <label htmlFor="receiverId" className="block text-sm font-medium text-gray-700">
                            Receiver *
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              placeholder="Search users..."
                              value={userSearchTerm}
                              onChange={handleUserSearch}
                              className="focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md mb-2"
                            />
                            <select
                              name="receiverId"
                              id="receiverId"
                              required
                              value={createFormData.receiverId}
                              onChange={handleCreateInputChange}
                              className="focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                            >
                              <option value="">Select a user</option>
                              {filteredUsers.map((user) => (
                                <option key={user._id} value={user._id}>
                                  {user.username} ({user.phone})
                                </option>
                              ))}
                            </select>
                            {debouncedUserSearchTerm && filteredUsers.length === 0 && (
                              <p className="mt-1 text-sm text-gray-500">No users found matching your search.</p>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Message Type
                          </label>
                          <select
                            name="type"
                            id="type"
                            value={createFormData.type}
                            onChange={handleCreateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                          >
                            <option value="general">General</option>
                            <option value="notification">Notification</option>
                            <option value="warning">Warning</option>
                            <option value="system">System</option>
                            <option value="reply">Reply</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                            Message Content *
                          </label>
                          <textarea
                            name="content"
                            id="content"
                            rows="4"
                            required
                            value={createFormData.content}
                            onChange={handleCreateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                            placeholder="Enter your message here..."
                          ></textarea>
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-primary text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Send Message
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

      {/* Create Message Modal (All Users) */}
      {showCreateAllModal && (
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
                      Send Message to All Users
                    </h3>
                    <div className="mt-2">
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              This message will be sent to <span className="font-medium">all users</span> in the system.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <form onSubmit={handleCreateAllSubmit}>
                        <div className="mb-4">
                          <label htmlFor="all-type" className="block text-sm font-medium text-gray-700">
                            Message Type
                          </label>
                          <select
                            name="type"
                            id="all-type"
                            value={createAllFormData.type}
                            onChange={handleCreateAllInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                          >
                            <option value="general">General</option>
                            <option value="notification">Notification</option>
                            <option value="warning">Warning</option>
                            <option value="system">System</option>
                            <option value="reply">Reply</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="all-content" className="block text-sm font-medium text-gray-700">
                            Message Content *
                          </label>
                          <textarea
                            name="content"
                            id="all-content"
                            rows="4"
                            required
                            value={createAllFormData.content}
                            onChange={handleCreateAllInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                            placeholder="Enter your message here..."
                          ></textarea>
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-primary text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Send to All Users
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

      {/* Update Message Modal */}
      {showUpdateModal && currentMessage && (
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
                      Update Message
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleUpdateSubmit}>
                        <div className="mb-4">
                          <label htmlFor="update-type" className="block text-sm font-medium text-gray-700">
                            Message Type
                          </label>
                          <select
                            name="type"
                            id="update-type"
                            value={updateFormData.type}
                            onChange={handleUpdateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                          >
                            <option value="general">General</option>
                            <option value="notification">Notification</option>
                            <option value="warning">Warning</option>
                            <option value="system">System</option>
                            <option value="reply">Reply</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="update-content" className="block text-sm font-medium text-gray-700">
                            Message Content *
                          </label>
                          <textarea
                            name="content"
                            id="update-content"
                            rows="4"
                            required
                            value={updateFormData.content}
                            onChange={handleUpdateInputChange}
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-gray-700 p-2 rounded-md"
                          ></textarea>
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-primary text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Update Message
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

      {/* Message Details Modal */}
      {showDetailsModal && selectedMessage && (
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
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedMessage.isGrouped ? 'Grouped Message Details' : 'Message Details'}
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

                    <div className="mt-2">
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Sender</h5>
                          <div className="mt-1 flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {selectedMessage.sender?.username?.charAt(0).toUpperCase() || 'A'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {selectedMessage.sender?.username || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {selectedMessage.sender?.role || 'Admin'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedMessage.isGrouped ? (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Receivers</h5>
                            <div className="mt-1 max-h-40 overflow-y-auto">
                              <ul className="divide-y divide-gray-200">
                                {selectedMessage.receivers?.map((receiver, index) => (
                                  <li key={index} className="py-2">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-8 w-8">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                          <span className="text-gray-700 font-medium text-xs">
                                            {receiver?.username?.charAt(0).toUpperCase() || 'U'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                          {receiver?.username || 'Unknown'}
                                        </p>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                              {(!selectedMessage.receivers || selectedMessage.receivers.length === 0) && (
                                <p className="text-sm text-gray-500">No receivers found</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Receiver</h5>
                            <div className="mt-1 flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-700 font-medium">
                                    {selectedMessage.receiver?.username?.charAt(0).toUpperCase() || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {selectedMessage.receiver?.username || 'Unknown'}
                                  <span className='block text-gray-500'>#{selectedMessage.receiver?._id || 'Unknown Id'}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Message Type</h5>
                          <div className="mt-1">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(selectedMessage.type)}`}>
                              {selectedMessage.type}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Content</h5>
                          <div className="mt-1 text-sm text-gray-900 bg-white p-3 rounded-md border">
                            {selectedMessage.content}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Created At</h5>
                            <p className="mt-1 text-sm text-gray-900">
                              {formatDate(selectedMessage.createdAt)}
                            </p>
                          </div>
                          {!selectedMessage.isGrouped && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Status</h5>
                              <p className="mt-1 text-sm text-gray-900">
                                {selectedMessage.isRead ? (
                                  <span className="text-green-600">Read</span>
                                ) : (
                                  <span className="text-yellow-600">Unread</span>
                                )}
                              </p>
                            </div>
                          )}
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

export default MessagesToUsers;