import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineTicket,
  HiOutlineChat,
  HiOutlineChatAlt,
  HiOutlineMail,
  HiOutlineChartBar,
  HiOutlineCog
} from 'react-icons/hi';

const sidebarLinks = [
  { name: 'Dashboard', path: '/', icon: HiOutlineHome },
  { name: 'Orders', path: '/orders', icon: HiOutlineShoppingCart },
  { name: 'Products', path: '/products', icon: HiOutlineCube },
  { name: 'Users', path: '/users', icon: HiOutlineUserGroup },
  { name: 'Coupons', path: '/coupons', icon: HiOutlineTicket },
  { name: 'Messages F.U', path: '/messages', icon: HiOutlineChat },
  { name: 'Messages T.U', path: '/message-to-user', icon: HiOutlineChatAlt },
  { name: 'Subscribers', path: '/subscribers', icon: HiOutlineMail },
  { name: 'Analytics', path: '/analytics', icon: HiOutlineChartBar },
  { name: 'Settings', path: '/settings', icon: HiOutlineCog },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:static md:inset-0 md:flex md:w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out bg-white border-r border-gray-200`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 md:hidden">
            <span className="text-xl font-bold text-primary">AdminDash</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-6 px-6">
            <nav className="px-2 space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors ${isActive(link.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                      }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-6 w-6" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;