# Salon Management System

A comprehensive salon service management system built with Node.js, Express.js, MySQL, and React.js. This system allows customers to book salon services and enables administrators to manage the salon operations.

## 🚀 Features

### Customer Features
- **User Registration & Authentication** - JWT-based secure authentication
- **Service Browsing** - View available salon services with details
- **Appointment Booking** - Book services with preferred date, time, and stylist
- **Booking Management** - View booking history and upcoming appointments
- **Review System** - Leave reviews and ratings for completed services
- **Profile Management** - Update personal information and change password

### Admin Features
- **Dashboard** - Overview of salon statistics and operations
- **Service Management** - Add, edit, delete salon services
- **Booking Management** - Approve, reject, or cancel appointments
- **User Management** - Manage customer accounts
- **Staff Management** - Add and manage salon staff
- **Review Management** - Monitor customer reviews and ratings

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database (via XAMPP)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - Frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Icons
- **React Toastify** - Notifications

## 📁 Project Structure

```
salon-system/
├── server.js                 # Main server file
├── package.json             # Backend dependencies
├── config/
│   └── db.js                # Database configuration
├── models/                  # Database models
│   ├── userModel.js
│   ├── serviceModel.js
│   ├── bookingModel.js
│   ├── reviewModel.js
│   └── staffModel.js
├── controllers/             # Route controllers
│   ├── authController.js
│   ├── serviceController.js
│   ├── bookingController.js
│   ├── reviewController.js
│   └── adminController.js
├── routes/                  # API routes
│   ├── authRoutes.js
│   ├── serviceRoutes.js
│   ├── bookingRoutes.js
│   ├── reviewRoutes.js
│   └── adminRoutes.js
├── middleware/              # Custom middleware
│   ├── authMiddleware.js
│   └── errorHandler.js
├── utils/
│   ├── generateToken.js
│   └── seedData.js          # Database seeding
└── client/                  # React frontend
    ├── package.json
    ├── public/
    └── src/
        ├── components/
        ├── pages/
        ├── contexts/
        └── App.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (via XAMPP)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd salon-system
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=salon_management
   JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

5. **Start XAMPP**
   - Start Apache and MySQL services in XAMPP
   - Ensure MySQL is running on port 3306

6. **Seed the database**
   ```bash
   npm run seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Start the React frontend** (in a new terminal)
   ```bash
   cd client
   npm start
   ```

### Default Login Credentials

After seeding the database, you can use these credentials:

**Admin Account:**
- Email: admin@salon.com
- Password: admin123

**Customer Accounts:**
- Email: john@example.com / Password: customer123
- Email: jane@example.com / Password: customer123
- Email: mike@example.com / Password: customer123

## 📱 Usage

### For Customers
1. **Register** a new account or **login** with existing credentials
2. **Browse services** to see available salon services
3. **Book appointments** by selecting service, date, time, and optional stylist
4. **Manage bookings** in your dashboard
5. **Leave reviews** for completed services

### For Administrators
1. **Login** with admin credentials
2. **Access admin dashboard** to view salon statistics
3. **Manage services** - add, edit, or remove salon services
4. **Manage bookings** - approve, reject, or cancel appointments
5. **Manage users** - view and manage customer accounts
6. **Manage staff** - add and manage salon staff members
7. **Monitor reviews** - view customer feedback and ratings

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Services
- `GET /api/services` - Get all active services
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Bookings
- `GET /api/bookings` - Get all bookings (Admin/Staff)
- `GET /api/bookings/my-bookings` - Get customer bookings
- `POST /api/bookings` - Create booking (Customer)
- `PUT /api/bookings/:id/status` - Update booking status (Admin/Staff)

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/my-reviews` - Get customer reviews
- `POST /api/reviews` - Create review (Customer)
- `PUT /api/reviews/:id` - Update review (Customer)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/staff` - Get all staff
- `POST /api/admin/staff` - Create staff member

## 🗄 Database Schema

### Users Table
- `id`, `name`, `email`, `password`, `role`, `phone`, `created_at`

### Services Table
- `id`, `name`, `description`, `price`, `duration`, `category`, `is_active`, `created_at`

### Bookings Table
- `id`, `customer_id`, `service_id`, `staff_id`, `booking_date`, `booking_time`, `status`, `notes`, `total_price`, `created_at`

### Reviews Table
- `id`, `booking_id`, `customer_id`, `service_id`, `rating`, `comment`, `created_at`

### Staff Table
- `id`, `name`, `email`, `phone`, `specialty`, `experience`, `bio`, `is_active`, `created_at`

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production` in your environment variables
2. Use a strong JWT secret key
3. Configure a production MySQL database
4. Build the React frontend: `cd client && npm run build`
5. Use a process manager like PM2 for Node.js

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=salon_management
JWT_SECRET=your_strong_jwt_secret_key
JWT_EXPIRE=7d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the documentation
2. Review the API endpoints
3. Check the database connection
4. Ensure all dependencies are installed

## 🔮 Future Enhancements

- Email notifications for bookings
- Payment integration
- Mobile app development
- Advanced reporting and analytics
- Multi-location support
- Staff scheduling system
- Inventory management
- Customer loyalty program

---

**Built with ❤️ for salon management**
