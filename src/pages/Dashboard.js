import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import Cookies from 'js-cookie';
import {
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineShoppingCart,
  HiOutlineTicket,
  HiOutlineMail,
  HiOutlineChat,
  HiOutlineUser
} from 'react-icons/hi';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { name: 'Total Products', value: 0, icon: HiOutlineCube, color: 'bg-blue-500', change: '+0%' },
    { name: 'Total Users', value: 0, icon: HiOutlineUserGroup, color: 'bg-green-500', change: '+0%' },
    { name: 'Total Orders', value: 0, icon: HiOutlineShoppingCart, color: 'bg-purple-500', change: '+0%' },
    { name: 'Active Coupons', value: 0, icon: HiOutlineTicket, color: 'bg-yellow-500', change: '+0%' },
    { name: 'Subscribers', value: 0, icon: HiOutlineMail, color: 'bg-pink-500', change: '+0%' },
    { name: 'Messages', value: 0, icon: HiOutlineChat, color: 'bg-indigo-500', change: '+0%' },
  ]);

  const [ordersData, setOrdersData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = Cookies.get('token');
  const baseURL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          productsRes,
          usersRes,
          ordersRes,
          couponsRes,
          messagesRes,
          subscribersRes
        ] = await Promise.all([
          fetch(`${baseURL}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${baseURL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${baseURL}/orders/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${baseURL}/coupons`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${baseURL}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${baseURL}/subscribers`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const productsData = await productsRes.json();
        const usersData = await usersRes.json();
        const ordersData = await ordersRes.json();
        const couponsData = await couponsRes.json();
        const messagesData = await messagesRes.json();
        const subscribersData = await subscribersRes.json();

        const updatedStats = [...stats];
        updatedStats[0].value = productsData.totalAllProducts || 0;
        updatedStats[1].value = usersData.count || 0;
        updatedStats[2].value = ordersData.length || 0;
        updatedStats[3].value = couponsData.length || 0;
        updatedStats[4].value = subscribersData.length || 0;
        updatedStats[5].value = messagesData.count || 0;

        updatedStats.forEach(stat => {
          stat.change = '+0%';
        });

        setStats(updatedStats);

        if (ordersData.orders && ordersData.orders.length > 0) {
          const ordersByMonth = {};
          ordersData.orders.forEach(order => {
            const date = new Date(order.createdAt);
            const month = date.toLocaleString('default', { month: 'short' });
            ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
          });

          const ordersChartData = Object.keys(ordersByMonth).map(month => ({
            name: month,
            orders: ordersByMonth[month]
          }));

          setOrdersData(ordersChartData);

          const statusCount = {};
          ordersData.orders.forEach(order => {
            statusCount[order.state] = (statusCount[order.state] || 0) + 1;
          });

          const statusChartData = Object.keys(statusCount).map(status => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: statusCount[status]
          }));

          setOrderStatusData(statusChartData);
        }

        if (productsData.data && productsData.data.length > 0) {
          const categoryCount = {};
          productsData.data.forEach(product => {
            if (product.category && product.category.length > 0) {
              const category = product.category[0];
              categoryCount[category] = (categoryCount[category] || 0) + 1;
            }
          });

          const productsChartData = Object.keys(categoryCount).map(category => ({
            name: category,
            value: categoryCount[category]
          }));

          setProductsData(productsChartData);
        }

        // Prepare recent activity data
        const activity = [];

        // Add recent users (from usersData)
        if (usersData.users && usersData.users.length > 0) {
          const recentUsers = usersData.users
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

          recentUsers.forEach(user => {
            activity.push({
              id: user._id,
              type: 'user',
              title: 'New user registered',
              description: user.username,
              time: user.createdAt,
              icon: HiOutlineUser,
              iconColor: 'bg-blue-100',
              iconTextColor: 'text-blue-600'
            });
          });
        }

        // Add recent orders (from ordersData)
        if (ordersData.orders && ordersData.orders.length > 0) {
          const recentOrders = ordersData.orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

          recentOrders.forEach(order => {
            activity.push({
              id: order._id,
              type: 'order',
              title: 'New order placed',
              description: `Order #${order._id.substring(0, 8)}`,
              time: order.createdAt,
              icon: HiOutlineShoppingCart,
              iconColor: 'bg-green-100',
              iconTextColor: 'text-green-600'
            });
          });
        }

        // Add recent coupons (from couponsData)
        if (couponsData.coupons && couponsData.coupons.length > 0) {
          const recentCoupons = couponsData.coupons
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

          recentCoupons.forEach(coupon => {
            activity.push({
              id: coupon._id,
              type: 'coupon',
              title: 'New coupon created',
              description: coupon.coupon,
              time: coupon.createdAt,
              icon: HiOutlineTicket,
              iconColor: 'bg-purple-100',
              iconTextColor: 'text-purple-600'
            });
          });
        }

        // Sort all activities by time and take the most recent 5
        const sortedActivity = activity
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 4);

        setRecentActivity(sortedActivity);

      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, baseURL]);

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }

    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }

    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }

    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }

    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }

    return Math.floor(seconds) + " seconds ago";
  };

  // Colors for charts
  const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff', '#a5b4fc'];
  const STATUS_COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6'];

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center text-sm text-green-600">
                      <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      {stat.change} from last month
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Orders Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h3>
            <div className="h-80">
              {ordersData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No order data available
                </div>
              )}
            </div>
          </div>

          {/* Products Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Products by Category</h3>
            <div className="h-80">
              {productsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {productsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No product data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
            <div className="h-80">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No order status data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activityItem) => {
                  const IconComponent = activityItem.icon;
                  return (
                    <div key={activityItem.id} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full ${activityItem.iconColor} flex items-center justify-center`}>
                          <IconComponent className={`h-5 w-5 ${activityItem.iconTextColor}`} />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{activityItem.title}</p>
                        <p className="text-sm text-gray-500">{activityItem.description}</p>
                        <p className="text-xs text-gray-400">{formatTimeAgo(activityItem.time)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;