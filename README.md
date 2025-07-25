# Admin Dashboard

A comprehensive admin dashboard for managing an e-commerce platform built with React and Tailwind CSS.

## Features

### Authentication

- Secure login for admin users
- Token-based authentication
- Session management with cookies

### Dashboard Overview

- Key metrics cards (Products, Users, Orders, etc.)
- Interactive charts and graphs
- Recent activity feed
- Real-time data visualization

### Product Management

- **CRUD Operations**: Create, Read, Update, Delete products
- Image upload support
- Category and tag management
- Inventory tracking
- Discount management

### Order Management

- View all orders with filtering and search
- Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
- Delete orders
- Detailed order information

### User Management

- View all registered users
- Search and filter users
- Delete users
- User detail modal with comprehensive information

### Coupon Management

- **CRUD Operations**: Create, Read, Update, Delete coupons
- Percentage and fixed amount discounts
- Expiration dates
- Minimum cart value requirements

### Message Management

- View messages from users
- Delete messages
- User details modal for sender information
- Search functionality

### Subscriber Management

- View all email subscribers
- Delete subscribers
- User details for each subscriber

### Analytics & Reporting

- Sales trend visualization
- Revenue by category
- Top selling products
- User growth charts
- Order status distribution
- Coupon usage analytics

## Technologies Used

### Frontend

- **React** - JavaScript library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Declarative charting library
- **SweetAlert2** - Beautiful alert modals
- **JS Cookie** - Simple cookie management

### Backend Integration

- RESTful API consumption
- JWT authentication
- Role-based access control (Admin only)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (version 14 or higher)
- npm or yarn
- Backend API server running

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd admin-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:5000
```

4. Start the development server:

```bash
npm start
```

The dashboard will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm eject` - Ejects the Create React App configuration

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders

- `GET /api/orders/all` - Get all orders
- `PUT /api/orders/status/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Users

- `GET /api/users` - Get all users
- `DELETE /api/users/:id` - Delete user
- `GET /api/user/:id` - Get user by ID

### Coupons

- `GET /api/coupons` - Get all coupons
- `POST /api/coupons` - Create coupon
- `PUT /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon

### Messages

- `GET /api/messages` - Get all messages
- `DELETE /api/messages/:id` - Delete message

### Subscribers

- `GET /api/subscribers` - Get all subscribers
- `DELETE /api/subscribers/:id` - Delete subscriber

## Folder Structure

```
src/
├── components/
│   ├── Layout.js
│   ├── Navbar.js
│   └── Sidebar.js
├── pages/
│   ├── Dashboard.js
│   ├── Login.js
│   ├── Products.js
│   ├── Orders.js
│   ├── Users.js
│   ├── Coupons.js
│   ├── Messages.js
│   ├── Subscribers.js
│   └── Analytics.js
├── App.js
└── index.js
```

## Security Features

- JWT token authentication
- Role-based access control (Admin only)
- Protected routes
- Secure cookie storage
- Input validation
- Error handling

## Responsive Design

The dashboard is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile devices

## Customization

### Branding

- Update colors in `tailwind.config.js`
- Modify logo in `src/components/Navbar.js`
- Adjust gradients in CSS classes

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/App.js`
3. Update the sidebar navigation in `src/components/Sidebar.js`

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a pull request

## Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [SweetAlert2](https://sweetalert2.github.io/)
- [JS Cookie](https://github.com/js-cookie/js-cookie)

---

## 🧑‍💻 Developed By

[Gerges Samuel @josamcode]  
Frontend & Backend Developer
