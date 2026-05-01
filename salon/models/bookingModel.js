const { promisePool } = require('../config/db');

class Booking {
  constructor(data) {
    this.id = data.id;
    this.customer_id = data.customer_id;
    this.service_id = data.service_id;
    this.staff_id = data.staff_id;
    this.booking_date = data.booking_date;
    this.booking_time = data.booking_time;
    this.status = data.status;
    this.notes = data.notes;
    this.total_price = data.total_price;
    this.created_at = data.created_at;
  }

  // Create a new booking
  static async create(bookingData) {
    const { customer_id, service_id, staff_id, booking_date, booking_time, notes, total_price } = bookingData;
    const query = `
      INSERT INTO bookings (customer_id, service_id, staff_id, booking_date, booking_time, notes, total_price, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `;
    const [result] = await promisePool.execute(query, [customer_id, service_id, staff_id, booking_date, booking_time, notes, total_price]);
    return result.insertId;
  }

  // Get booking by ID with related data
  static async findById(id) {
    const query = `
      SELECT 
        b.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        s.name as service_name,
        s.price as service_price,
        s.duration as service_duration,
        st.name as staff_name
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN staff st ON b.staff_id = st.id
      WHERE b.id = ?
    `;
    const [rows] = await promisePool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Get bookings by customer ID
  static async getByCustomerId(customerId, options = {}) {
    const { limit, offset } = options;
    const query = `
      SELECT 
        b.*,
        s.name as service_name,
        s.price as service_price,
        s.duration as service_duration,
        st.name as staff_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN staff st ON b.staff_id = st.id
      WHERE b.customer_id = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
      ${typeof limit === 'number' ? 'LIMIT ?' : ''}
      ${typeof offset === 'number' ? 'OFFSET ?' : ''}
    `;
    const params = [customerId];
    if (typeof limit === 'number') params.push(limit);
    if (typeof offset === 'number') params.push(offset);
    const [rows] = await promisePool.execute(query, params);
    return rows;
  }

  static async countByCustomerId(customerId) {
    const query = 'SELECT COUNT(*) as total FROM bookings WHERE customer_id = ?';
    const [rows] = await promisePool.execute(query, [customerId]);
    return rows[0].total;
  }

  // Get all bookings with filters
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        b.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        s.name as service_name,
        s.price as service_price,
        s.duration as service_duration,
        st.name as staff_name
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN staff st ON b.staff_id = st.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND b.status = ?';
      params.push(filters.status);
    }

    if (filters.date) {
      query += ' AND b.booking_date = ?';
      params.push(filters.date);
    }

    if (filters.staff_id) {
      query += ' AND b.staff_id = ?';
      params.push(filters.staff_id);
    }

    query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await promisePool.execute(query, params);
    return rows;
  }

  // Update booking status
  static async updateStatus(id, status) {
    const query = 'UPDATE bookings SET status = ? WHERE id = ?';
    await promisePool.execute(query, [status, id]);
  }

  // Update booking details
  static async update(id, updateData) {
    const { service_id, staff_id, booking_date, booking_time, notes, total_price } = updateData;
    const query = `
      UPDATE bookings 
      SET service_id = ?, staff_id = ?, booking_date = ?, booking_time = ?, notes = ?, total_price = ?
      WHERE id = ?
    `;
    await promisePool.execute(query, [service_id, staff_id, booking_date, booking_time, notes, total_price, id]);
  }

  // Delete booking
  static async delete(id) {
    const query = 'DELETE FROM bookings WHERE id = ?';
    await promisePool.execute(query, [id]);
  }

  // Get booking statistics
  static async getBookingStats() {
    const query = `
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_bookings,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
        SUM(total_price) as total_revenue
      FROM bookings
    `;
    const [rows] = await promisePool.execute(query);
    return rows[0];
  }

  // Get bookings by date range
  static async getByDateRange(startDate, endDate) {
    const query = `
      SELECT 
        b.*,
        u.name as customer_name,
        s.name as service_name,
        st.name as staff_name
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN staff st ON b.staff_id = st.id
      WHERE b.booking_date BETWEEN ? AND ?
      ORDER BY b.booking_date, b.booking_time
    `;
    const [rows] = await promisePool.execute(query, [startDate, endDate]);
    return rows;
  }

  // Check for booking conflicts
  static async checkConflict(staffId, bookingDate, bookingTime, duration, excludeBookingId = null) {
    // Use service duration for existing bookings, and the provided duration (in minutes)
    // for the requested time slot. Convert minutes to time using SEC_TO_TIME(duration*60).
    let query = `
      SELECT COUNT(*) as conflict_count
      FROM bookings b
      WHERE b.staff_id = ?
      AND b.booking_date = ?
      AND b.status IN ('pending', 'approved')
      AND (
        (
          b.booking_time <= ?
          AND ADDTIME(
            b.booking_time,
            (SELECT SEC_TO_TIME(s.duration * 60) FROM services s WHERE s.id = b.service_id)
          ) > ?
        ) OR (
          b.booking_time < ADDTIME(?, SEC_TO_TIME(? * 60))
          AND ADDTIME(
            b.booking_time,
            (SELECT SEC_TO_TIME(s.duration * 60) FROM services s WHERE s.id = b.service_id)
          ) > ?
        )
      )
    `;
    const params = [
      staffId,
      bookingDate,
      bookingTime,
      bookingTime,
      bookingTime,
      duration,
      bookingTime
    ];

    if (excludeBookingId) {
      query += ' AND id != ?';
      params.push(excludeBookingId);
    }

    const [rows] = await promisePool.execute(query, params);
    return rows[0].conflict_count > 0;
  }
}

module.exports = Booking;


