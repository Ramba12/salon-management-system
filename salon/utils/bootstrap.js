const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/db');

async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@salon.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  // Check if a user with the target email exists
  const [byEmail] = await promisePool.execute('SELECT id, role FROM users WHERE email = ? LIMIT 1', [adminEmail]);
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(adminPassword, salt);

  if (byEmail.length > 0) {
    const user = byEmail[0];
    // Promote to admin if not already, and ensure password matches provided one
    await promisePool.execute('UPDATE users SET role = "admin", password = ? WHERE id = ?', [hashed, user.id]);
    return;
  }

  // If no such email, ensure at least one admin exists; if none, create this admin account
  const [anyAdmin] = await promisePool.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
  if (anyAdmin.length === 0) {
    await promisePool.execute(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, "admin", NULL)',
      [adminName, adminEmail, hashed]
    );
  }
}

async function ensureTransactionTable() {
  try {
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        customer_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method ENUM('cash', 'card', 'mpesa', 'other') DEFAULT 'cash',
        payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Transactions table verified/created');
  } catch (error) {
    console.error('❌ Failed to ensure transactions table:', error.message);
  }
}

module.exports = { ensureAdminUser, ensureTransactionTable };


