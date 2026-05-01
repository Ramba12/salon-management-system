const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/db');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create database if it doesn't exist (using query instead of execute for DDL)
    const connection = await promisePool.getConnection();
    
    try {
      await connection.query('CREATE DATABASE IF NOT EXISTS salon_system_db');
      await connection.query('USE salon_system_db');
    } finally {
      connection.release();
    }

    // Create tables
    await createTables();
    
    // Insert seed data
    await insertSeedData();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

const createTables = async () => {
  console.log('📋 Creating database tables...');

  // Users table
  await promisePool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Services table
  await promisePool.execute(`
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      duration INT NOT NULL COMMENT 'Duration in minutes',
      category VARCHAR(50) DEFAULT 'general',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Staff table
  await promisePool.execute(`
    CREATE TABLE IF NOT EXISTS staff (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20),
      specialty VARCHAR(100),
      experience INT DEFAULT 0 COMMENT 'Years of experience',
      bio TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bookings table
  await promisePool.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      service_id INT NOT NULL,
      staff_id INT,
      booking_date DATE NOT NULL,
      booking_time TIME NOT NULL,
      status ENUM('pending', 'approved', 'completed', 'cancelled') DEFAULT 'pending',
      notes TEXT,
      total_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
    )
  `);

  // Reviews table
  await promisePool.execute(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT NOT NULL,
      customer_id INT NOT NULL,
      service_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Tables created successfully!');
};

const insertSeedData = async () => {
  console.log('🌱 Inserting seed data...');

  // Hash password for admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Insert admin user
  await promisePool.execute(`
    INSERT IGNORE INTO users (name, email, password, role, phone) VALUES
    ('Admin User', 'admin@salon.com', ?, 'admin', '+1234567890')
  `, [hashedPassword]);

  // Insert sample customers
  const customerPassword = await bcrypt.hash('customer123', 10);
  await promisePool.execute(`
    INSERT IGNORE INTO users (name, email, password, role, phone) VALUES
    ('John Doe', 'john@example.com', ?, 'customer', '+1234567891'),
    ('Jane Smith', 'jane@example.com', ?, 'customer', '+1234567892'),
    ('Mike Johnson', 'mike@example.com', ?, 'customer', '+1234567893')
  `, [customerPassword, customerPassword, customerPassword]);

  // Insert sample staff
  await promisePool.execute(`
    INSERT IGNORE INTO staff (name, email, phone, specialty, experience, bio) VALUES
    ('Sarah Wilson', 'sarah@salon.com', '+1234567894', 'Hair Styling', 5, 'Expert hair stylist with 5 years of experience in cutting and coloring.'),
    ('Emily Davis', 'emily@salon.com', '+1234567895', 'Nail Art', 3, 'Creative nail artist specializing in manicures and pedicures.'),
    ('Lisa Brown', 'lisa@salon.com', '+1234567896', 'Facial Treatments', 7, 'Licensed esthetician with expertise in facial treatments and skincare.'),
    ('Maria Garcia', 'maria@salon.com', '+1234567897', 'Hair Coloring', 8, 'Master colorist with advanced training in hair coloring techniques.')
  `);

  // Insert sample services
  await promisePool.execute(`
    INSERT IGNORE INTO services (name, description, price, duration, category) VALUES
    ('Haircut & Style', 'Professional haircut with styling and blow-dry', 45.00, 60, 'Hair'),
    ('Hair Coloring', 'Full hair coloring service with premium products', 120.00, 120, 'Hair'),
    ('Highlights', 'Partial or full highlights for dimensional color', 80.00, 90, 'Hair'),
    ('Manicure', 'Classic manicure with nail shaping and polish', 35.00, 45, 'Nails'),
    ('Pedicure', 'Relaxing pedicure with foot massage and polish', 50.00, 60, 'Nails'),
    ('Facial Treatment', 'Deep cleansing facial with extraction and mask', 75.00, 75, 'Skincare'),
    ('Eyebrow Shaping', 'Professional eyebrow shaping and tinting', 25.00, 30, 'Brows'),
    ('Hair Wash & Blow Dry', 'Shampoo, conditioning, and professional blow-dry', 30.00, 45, 'Hair'),
    ('Deep Conditioning', 'Intensive hair treatment for damaged hair', 40.00, 60, 'Hair'),
    ('Nail Art', 'Creative nail art design with gel polish', 60.00, 90, 'Nails')
  `);

  // Insert sample bookings
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  await promisePool.execute(`
    INSERT IGNORE INTO bookings (customer_id, service_id, staff_id, booking_date, booking_time, status, total_price) VALUES
    (2, 1, 1, ?, '10:00:00', 'approved', 45.00),
    (3, 2, 4, ?, '14:00:00', 'pending', 120.00),
    (4, 5, 2, ?, '16:30:00', 'completed', 50.00)
  `, [tomorrow.toISOString().split('T')[0], tomorrow.toISOString().split('T')[0], today.toISOString().split('T')[0]]);

  // Insert sample reviews
  await promisePool.execute(`
    INSERT IGNORE INTO reviews (booking_id, customer_id, service_id, rating, comment) VALUES
    (3, 4, 5, 5, 'Excellent service! The staff was very professional and the results exceeded my expectations.')
  `);

  console.log('✅ Seed data inserted successfully!');
  console.log('\n📋 Default Login Credentials:');
  console.log('Admin: admin@salon.com / admin123');
  console.log('Customer: john@example.com / customer123');
  console.log('Customer: jane@example.com / customer123');
  console.log('Customer: mike@example.com / customer123');
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
