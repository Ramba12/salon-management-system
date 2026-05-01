const { promisePool } = require('../config/db');

class Review {
  constructor(data) {
    this.id = data.id;
    this.booking_id = data.booking_id;
    this.customer_id = data.customer_id;
    this.service_id = data.service_id;
    this.rating = data.rating;
    this.comment = data.comment;
    this.created_at = data.created_at;
  }

  // Create a new review
  static async create(reviewData) {
    const { booking_id, customer_id, service_id, rating, comment } = reviewData;
    const query = `
      INSERT INTO reviews (booking_id, customer_id, service_id, rating, comment) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await promisePool.execute(query, [booking_id, customer_id, service_id, rating, comment]);
    return result.insertId;
  }

  // Get review by ID
  static async findById(id) {
    const query = `
      SELECT 
        r.*,
        u.name as customer_name,
        s.name as service_name,
        b.booking_date,
        b.booking_time
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.id
      LEFT JOIN services s ON r.service_id = s.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE r.id = ?
    `;
    const [rows] = await promisePool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Get reviews by service ID
  static async getByServiceId(serviceId) {
    const query = `
      SELECT 
        r.*,
        u.name as customer_name,
        b.booking_date
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE r.service_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await promisePool.execute(query, [serviceId]);
    return rows;
  }

  // Get reviews by customer ID
  static async getByCustomerId(customerId) {
    const query = `
      SELECT 
        r.*,
        s.name as service_name,
        b.booking_date,
        b.booking_time
      FROM reviews r
      LEFT JOIN services s ON r.service_id = s.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE r.customer_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await promisePool.execute(query, [customerId]);
    return rows;
  }

  // Get all reviews with filters
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        r.*,
        u.name as customer_name,
        s.name as service_name,
        b.booking_date,
        b.booking_time
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.id
      LEFT JOIN services s ON r.service_id = s.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.rating) {
      query += ' AND r.rating = ?';
      params.push(filters.rating);
    }

    if (filters.service_id) {
      query += ' AND r.service_id = ?';
      params.push(filters.service_id);
    }

    query += ' ORDER BY r.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await promisePool.execute(query, params);
    return rows;
  }

  // Update review
  static async update(id, updateData) {
    const { rating, comment } = updateData;
    const query = 'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?';
    await promisePool.execute(query, [rating, comment, id]);
  }

  // Delete review
  static async delete(id) {
    const query = 'DELETE FROM reviews WHERE id = ?';
    await promisePool.execute(query, [id]);
  }

  // Check if customer has already reviewed a booking
  static async checkExistingReview(bookingId, customerId) {
    const query = 'SELECT id FROM reviews WHERE booking_id = ? AND customer_id = ?';
    const [rows] = await promisePool.execute(query, [bookingId, customerId]);
    return rows.length > 0;
  }

  // Get review statistics
  static async getReviewStats() {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews
    `;
    const [rows] = await promisePool.execute(query);
    return rows[0];
  }

  // Get service rating statistics
  static async getServiceRatingStats(serviceId) {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews
      WHERE service_id = ?
    `;
    const [rows] = await promisePool.execute(query, [serviceId]);
    return rows[0];
  }

  // Get recent reviews
  static async getRecent(limit = 10) {
    const query = `
      SELECT 
        r.*,
        u.name as customer_name,
        s.name as service_name
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.id
      LEFT JOIN services s ON r.service_id = s.id
      ORDER BY r.created_at DESC
      LIMIT ?
    `;
    const [rows] = await promisePool.execute(query, [limit]);
    return rows;
  }
}

module.exports = Review;


