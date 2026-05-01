# Salon Management System - Setup Guide

This guide will help you set up the Salon Management System on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **XAMPP** - [Download here](https://www.apachefriends.org/)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Step-by-Step Setup

### Step 1: Download and Install XAMPP

1. Download XAMPP from the official website
2. Install XAMPP on your system
3. Start XAMPP Control Panel
4. Start **Apache** and **MySQL** services
5. Ensure MySQL is running on port 3306

### Step 2: Clone the Repository

```bash
git clone <repository-url>
cd salon-system
```

### Step 3: Install Dependencies

**Install Backend Dependencies:**
```bash
npm install
```

**Install Frontend Dependencies:**
```bash
cd client
npm install
cd ..
```

### Step 4: Environment Configuration

Create a `.env` file in the root directory with the following content:

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

**Note:** If your XAMPP MySQL has a password, update the `DB_PASSWORD` field.

### Step 5: Database Setup

**Seed the database with initial data:**
```bash
npm run seed
```

This will:
- Create the database and tables
- Insert sample data (users, services, staff, bookings)
- Set up default admin and customer accounts

### Step 6: Start the Application

**Start the Backend Server:**
```bash
npm run dev
```

**Start the Frontend (in a new terminal):**
```bash
cd client
npm start
```

### Step 7: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## 🔑 Default Login Credentials

After seeding the database, you can use these accounts:

### Admin Account
- **Email:** admin@salon.com
- **Password:** admin123
- **Access:** Full admin dashboard and management features

### Customer Accounts
- **Email:** john@example.com / **Password:** customer123
- **Email:** jane@example.com / **Password:** customer123
- **Email:** mike@example.com / **Password:** customer123

## 🧪 Testing the Setup

### 1. Test Database Connection
Visit: http://localhost:5000/api/health

You should see:
```json
{
  "status": "OK",
  "message": "Salon Management System API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Frontend
Visit: http://localhost:3000

You should see the salon homepage with navigation options.

### 3. Test Authentication
1. Click "Login" in the navigation
2. Use admin credentials: admin@salon.com / admin123
3. You should be redirected to the admin dashboard

## 🛠 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Error
**Error:** `Database connection failed`

**Solutions:**
- Ensure XAMPP MySQL is running
- Check if MySQL is running on port 3306
- Verify database credentials in `.env` file
- Try restarting XAMPP services

#### 2. Port Already in Use
**Error:** `Port 5000 is already in use`

**Solutions:**
- Change the PORT in `.env` file to a different port (e.g., 5001)
- Kill the process using the port: `npx kill-port 5000`

#### 3. Frontend Build Issues
**Error:** React build fails

**Solutions:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

#### 4. JWT Token Issues
**Error:** Authentication fails

**Solutions:**
- Ensure JWT_SECRET is set in `.env` file
- Check if the secret key is strong enough
- Clear browser localStorage and try again

### Database Reset

If you need to reset the database:

```bash
# Stop the server (Ctrl+C)
# Drop and recreate the database
mysql -u root -p
DROP DATABASE salon_management;
CREATE DATABASE salon_management;
exit

# Re-seed the database
npm run seed
```

## 📁 Project Structure Overview

```
salon-system/
├── server.js              # Main server file
├── package.json           # Backend dependencies
├── .env                   # Environment variables (create this)
├── config/
│   └── db.js             # Database configuration
├── models/               # Database models
├── controllers/          # API controllers
├── routes/              # API routes
├── middleware/          # Custom middleware
├── utils/               # Utility functions
└── client/              # React frontend
    ├── package.json     # Frontend dependencies
    ├── public/          # Static files
    └── src/            # React source code
```

## 🚀 Development Workflow

### Backend Development
- Server runs on port 5000
- API endpoints start with `/api/`
- Database models handle data operations
- Controllers handle business logic
- Routes define API endpoints

### Frontend Development
- React app runs on port 3000
- Uses React Router for navigation
- Axios for API calls
- Bootstrap for styling
- Context API for state management

## 📱 Features Overview

### Customer Features
- Browse salon services
- Book appointments
- View booking history
- Leave reviews
- Manage profile

### Admin Features
- Dashboard with statistics
- Manage services
- Manage bookings
- Manage users
- Manage staff
- View reviews

## 🔧 Customization

### Adding New Services
1. Login as admin
2. Go to Admin → Services
3. Add new service with details

### Adding New Staff
1. Login as admin
2. Go to Admin → Staff
3. Add new staff member

### Modifying Styling
- Edit `client/src/index.css` for global styles
- Modify Bootstrap classes in components
- Update color scheme in CSS variables

## 📞 Support

If you encounter issues:

1. Check this setup guide
2. Verify all prerequisites are installed
3. Check the console for error messages
4. Ensure XAMPP services are running
5. Try the troubleshooting steps above

## 🎉 Success!

Once everything is running, you should have:
- A fully functional salon management system
- Admin dashboard for managing the salon
- Customer interface for booking services
- Database with sample data
- Authentication system working

Happy coding! 🚀









