const { promisePool } = require('../config/db');

class Staff {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.specialty = data.specialty;
    this.experience = data.experience;
    this.bio = data.bio;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
  }

  // Create a new staff member
  static async create(staffData) {
    const { name, email, phone, specialty, experience, bio } = staffData;
    const query = `
      INSERT INTO staff (name, email, phone, specialty, experience, bio) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await promisePool.execute(query, [name, email, phone, specialty, experience, bio]);
    return result.insertId;
  }

  // Get all active staff
  static async getAllActive() {
    const query = 'SELECT * FROM staff WHERE is_active = 1 ORDER BY name';
    const [rows] = await promisePool.execute(query);
    return rows.map(row => new Staff(row));
  }

  // Get all staff (including inactive)
  static async getAll() {
    const query = 'SELECT * FROM staff ORDER BY name';
    const [rows] = await promisePool.execute(query);
    return rows.map(row => new Staff(row));
  }

  // Get staff by ID
  static async findById(id) {
    const query = 'SELECT * FROM staff WHERE id = ?';
    const [rows] = await promisePool.execute(query, [id]);
    return rows.length > 0 ? new Staff(rows[0]) : null;
  }

  // Get staff by specialty
  static async getBySpecialty(specialty) {
    const query = 'SELECT * FROM staff WHERE specialty = ? AND is_active = 1 ORDER BY name';
    const [rows] = await promisePool.execute(query, [specialty]);
    return rows.map(row => new Staff(row));
  }

  // Update staff member
  static async update(id, updateData) {
    const { name, email, phone, specialty, experience, bio, is_active } = updateData;
    const query = `
      UPDATE staff 
      SET name = ?, email = ?, phone = ?, specialty = ?, experience = ?, bio = ?, is_active = ?
      WHERE id = ?
    `;
    await promisePool.execute(query, [name, email, phone, specialty, experience, bio, is_active, id]);
  }

  // Delete staff member (soft delete)
  static async delete(id) {
    const query = 'UPDATE staff SET is_active = 0 WHERE id = ?';
    await promisePool.execute(query, [id]);
  }

  // Get staff statistics
  static async getStaffStats() {
    const query = `
      SELECT 
        COUNT(*) as total_staff,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_staff,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_staff
      FROM staff
    `;
    const [rows] = await promisePool.execute(query);
    return rows[0];
  }

  // Get staff by specialty statistics
  static async getSpecialtyStats() {
    const query = `
      SELECT 
        specialty,
        COUNT(*) as count
      FROM staff 
      WHERE is_active = 1
      GROUP BY specialty
      ORDER BY count DESC
    `;
    const [rows] = await promisePool.execute(query);
    return rows;
  }

  // Search staff
  static async searchStaff(searchTerm) {
    const query = `
      SELECT * FROM staff 
      WHERE (name LIKE ? OR specialty LIKE ? OR bio LIKE ?) AND is_active = 1
      ORDER BY name
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await promisePool.execute(query, [searchPattern, searchPattern, searchPattern]);
    return rows.map(row => new Staff(row));
  }

  // Get staff availability for a specific date and time
  static async getAvailableStaff(bookingDate, bookingTime, duration) {
    const query = `
      SELECT s.*
      FROM staff s
      WHERE s.is_active = 1
      AND s.id NOT IN (
        SELECT DISTINCT b.staff_id
        FROM bookings b
        WHERE b.booking_date = ?
        AND b.status IN ('pending', 'approved')
        AND (
          (b.booking_time <= ? AND ADDTIME(b.booking_time, (SELECT duration FROM services WHERE id = b.service_id)) > ?) OR
          (b.booking_time < ADDTIME(?, (SELECT duration FROM services WHERE id = b.service_id)) AND ADDTIME(b.booking_time, (SELECT duration FROM services WHERE id = b.service_id)) > ?)
        )
      )
      ORDER BY s.name
    `;
    const [rows] = await promisePool.execute(query, [bookingDate, bookingTime, bookingTime, bookingTime, bookingTime]);
    return rows.map(row => new Staff(row));
  }
}

module.exports = Staff;


