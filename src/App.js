import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Users from './pages/Users';
import Coupons from './pages/Coupons';
import Messages from './pages/Messages';
import MessagesToUsers from './pages/MessagesToUsers';
import Subscribers from './pages/Subscribers';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/message-to-user" element={<MessagesToUsers />} />
        <Route path="/subscribers" element={<Subscribers />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;