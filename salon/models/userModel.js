const { promisePool } = require('../config/db');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.phone = data.phone;
    this.created_at = data.created_at;
  }

  // Create a new user
  static async create(userData) {
    const { name, email, password, role = 'customer', phone } = userData;
    const query = `
      INSERT INTO users (name, email, password, role, phone) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await promisePool.execute(query, [name, email, password, role, phone]);
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await promisePool.execute(query, [email]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await promisePool.execute(query, [id]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Update user profile
  static async updateProfile(id, updateData) {
    const { name, phone } = updateData;
    const query = 'UPDATE users SET name = ?, phone = ? WHERE id = ?';
    await promisePool.execute(query, [name, phone, id]);
  }

  // Update password
  static async updatePassword(id, hashedPassword) {
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    await promisePool.execute(query, [hashedPassword, id]);
  }

  // Get all users (admin only)
  static async getAllUsers() {
    const query = 'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC';
    const [rows] = await promisePool.execute(query);
    return rows;
  }

  // Get users by role
  static async getUsersByRole(role) {
    const query = 'SELECT id, name, email, phone, created_at FROM users WHERE role = ? ORDER BY created_at DESC';
    const [rows] = await promisePool.execute(query, [role]);
    return rows;
  }

  // Delete user
  static async deleteUser(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    await promisePool.execute(query, [id]);
  }

  // Get user statistics
  static async getUserStats() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'staff' THEN 1 ELSE 0 END) as staff
      FROM users
    `;
    const [rows] = await promisePool.execute(query);
    return rows[0];
  }

  // Search users by name/email (optionally by role)
  static async searchUsers({ search, role }) {
    let query = `SELECT id, name, email, role, phone, created_at FROM users WHERE (LOWER(name) LIKE ? OR LOWER(email) LIKE ?)`;
    const values = [`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`];
    if (role) {
      query += ' AND role = ?';
      values.push(role);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await promisePool.execute(query, values);
    return rows;
  }
}

module.exports = User;


