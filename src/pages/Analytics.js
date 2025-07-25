import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Layout from '../components/Layout';
import Cookies from 'js-cookie';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [productsData, setProductsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [couponsData, setCouponsData] = useState([]);
  const [messagesData, setMessagesData] = useState([]);
  const [subscribersData, setSubscribersData] = useState([]);

  // Analytics states
  const [salesTrendData, setSalesTrendData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [revenueByCategoryData, setRevenueByCategoryData] = useState([]);
  const [couponUsageData, setCouponUsageData] = useState([]);

  const token = Cookies.get('token');
  const baseURL = process.env.REACT_APP_API_URL;

  // Fetch all analytics data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
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

        // Set raw data
        setProductsData(productsData.data || []);
        setUsersData(usersData.users || []);
        setOrdersData(ordersData.orders || []);
        setCouponsData(couponsData.coupons || []);
        setMessagesData(messagesData.data || []);
        setSubscribersData(subscribersData.subscribers || []);

        // Process analytics data
        processAnalyticsData(
          productsData.data || [],
          usersData.users || [],
          ordersData.orders || [],
          couponsData.coupons || [],
          messagesData.data || [],
          subscribersData.subscribers || []
        );

      } catch (err) {
        setError(err.message);
        console.error('Error fetching analytics data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, baseURL]);

  // Process analytics data
  const processAnalyticsData = (
    products,
    users,
    orders,
    coupons,
    messages,
    subscribers
  ) => {
    // Sales Trend Data (Monthly)
    const salesByMonth = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!salesByMonth[monthYear]) {
        salesByMonth[monthYear] = { revenue: 0, orders: 0 };
      }

      salesByMonth[monthYear].revenue += order.total;
      salesByMonth[monthYear].orders += 1;
    });

    const salesTrend = Object.keys(salesByMonth).map(month => ({
      name: month,
      revenue: salesByMonth[month].revenue,
      orders: salesByMonth[month].orders
    })).sort((a, b) => a.name.localeCompare(b.name));

    setSalesTrendData(salesTrend);

    // Top Products by Revenue
    const productRevenue = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productRevenue[item.productId]) {
          productRevenue[item.productId] = 0;
        }
        productRevenue[item.productId] += item.price * item.quantity;
      });
    });

    const topProducts = Object.keys(productRevenue)
      .map(productId => {
        const product = products.find(p => p._id === productId);
        return {
          name: product ? product.title : 'Unknown Product',
          value: productRevenue[productId]
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    setTopProductsData(topProducts);

    // User Growth Data (Monthly)
    const usersByMonth = {};
    users.forEach(user => {
      const date = new Date(user.createdAt);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!usersByMonth[monthYear]) {
        usersByMonth[monthYear] = 0;
      }

      usersByMonth[monthYear] += 1;
    });

    const userGrowth = Object.keys(usersByMonth).map(month => ({
      name: month,
      users: usersByMonth[month]
    })).sort((a, b) => a.name.localeCompare(b.name));

    setUserGrowthData(userGrowth);

    // Order Status Distribution
    const statusCount = {};
    orders.forEach(order => {
      if (!statusCount[order.state]) {
        statusCount[order.state] = 0;
      }
      statusCount[order.state] += 1;
    });

    const orderStatusDistribution = Object.keys(statusCount).map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusCount[status]
    }));

    setOrderStatusData(orderStatusDistribution);

    // Revenue by Category
    const categoryRevenue = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p._id === item.productId);
        if (product && product.category && product.category.length > 0) {
          const category = product.category[0]; // Use first category

          if (!categoryRevenue[category]) {
            categoryRevenue[category] = 0;
          }

          categoryRevenue[category] += item.price * item.quantity;
        }
      });
    });

    const revenueByCategory = Object.keys(categoryRevenue).map(category => ({
      name: category,
      value: categoryRevenue[category]
    }));

    setRevenueByCategoryData(revenueByCategory);

    // Coupon Usage Data
    const couponUsage = {};
    orders.forEach(order => {
      if (order.couponCode) {
        if (!couponUsage[order.couponCode]) {
          couponUsage[order.couponCode] = 0;
        }
        couponUsage[order.couponCode] += 1;
      }
    });

    const couponUsageData = Object.keys(couponUsage).map(code => ({
      name: code,
      value: couponUsage[code]
    })).sort((a, b) => b.value - a.value);

    setCouponUsageData(couponUsageData);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Comprehensive insights into your platform's performance</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{productsData.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="bg-green-500 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{usersData.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{ordersData.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(ordersData.reduce((sum, order) => sum + order.total, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
            <div className="h-80">
              {salesTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) =>
                      name === 'revenue' ? formatCurrency(value) : value
                    } />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      fill="#c7d2fe"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="#818cf8"
                      fill="#e0e7ff"
                      strokeWidth={2}
                      name="Orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No sales data available
                </div>
              )}
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            <div className="h-80">
              {topProductsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#4f46e5"
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No product data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="h-80">
              {userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#10b981"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No user data available
                </div>
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
            <div className="h-80">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No order status data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
            <div className="h-80">
              {revenueByCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#8b5cf6"
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No category data available
                </div>
              )}
            </div>
          </div>

          {/* Coupon Usage */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Coupon Usage</h3>
            <div className="h-80">
              {couponUsageData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={couponUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {couponUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No coupon data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;