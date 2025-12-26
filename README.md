<<<<<<< HEAD
# Meraab & Emaan - E-Commerce Web Application

A complete MERN stack e-commerce web application for "Meraab & Emaan" - an elegant Pakistani clothing brand specializing in Shalwar Kameez, Bridal, Formal, Casual, Party Wear, and Seasonal Collections.

## 🌟 Features

### Customer Features
- Browse products by category with advanced filtering
- Product search and sorting
- Detailed product pages with size/color selection
- Shopping cart with quantity management
- Secure checkout with Stripe integration
- Cash on Delivery (COD) option
- User registration and authentication
- Order tracking and history
- Wishlist functionality
- User profile management
- Custom measurements for tailored orders

### Admin Features
- Dashboard with sales analytics
- Product management (CRUD)
- Category management
- Order management with status updates
- User management
- Inventory tracking

## 🛠️ Tech Stack

### Frontend
- React 19.2
- React Router DOM
- Tailwind CSS
- Axios
- React Icons
- React Hot Toast
- Stripe.js

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt.js
- Multer (file uploads)
- Stripe API
- Express Validator

## 📁 Project Structure

```
meraab-emaan/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   ├── layout/
    │   │   └── products/
    │   ├── context/
    │   ├── pages/
    │   │   └── admin/
    │   ├── services/
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Stripe Account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/meraab-emaan.git
cd meraab-emaan
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### Environment Variables

#### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/meraab-emaan
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_xxx
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## 📱 Pages & Routes

### Public Routes
- `/` - Home Page
- `/shop` - Shop with filters
- `/product/:slug` - Product Details
- `/cart` - Shopping Cart
- `/login` - User Login
- `/register` - User Registration

### Protected Routes
- `/checkout` - Checkout Process
- `/profile` - User Profile & Orders

### Admin Routes
- `/admin` - Dashboard
- `/admin/products` - Product Management
- `/admin/orders` - Order Management
- `/admin/users` - User Management
- `/admin/categories` - Category Management

## 🎨 Design System

### Colors
- **Primary (Terracotta)**: #B5651D - Brand identity color
- **Secondary (Beige)**: #D4B896 - Elegant backdrop
- **Accent (Pink)**: #DDA0DD - Feminine touches
- **Gold**: #D4AF37 - Luxury accents

### Typography
- **Display**: Playfair Display (headings)
- **Body**: Poppins (content)

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:slug` - Get product by slug
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/my` - Get user's orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update status (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart

### Payment
- `POST /api/payment/create-intent` - Create Stripe payment intent

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Contact

For any inquiries, please contact us at support@meraab-emaan.com

---

Made with ❤️ for Meraab & Emaan
=======
# mernpro
>>>>>>> 6ccabc367f4dd0f01c601e18d557dca5e6982cc3
