const { promisePool } = require('../config/db');

class Transaction {
  constructor(data) {
    this.id = data.id;
    this.booking_id = data.booking_id;
    this.customer_id = data.customer_id;
    this.amount = data.amount;
    this.payment_method = data.payment_method;
    this.payment_status = data.payment_status;
    this.transaction_date = data.transaction_date;
    this.notes = data.notes;
  }

  // Create a new transaction
  static async create(transactionData) {
    const { booking_id, customer_id, amount, payment_method, payment_status, notes } = transactionData;
    const query = `
      INSERT INTO transactions (booking_id, customer_id, amount, payment_method, payment_status, notes) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await promisePool.execute(query, [booking_id, customer_id, amount, payment_method, payment_status, notes]);
    return result.insertId;
  }

  // Get transaction by ID
  static async findById(id) {
    const query = `
      SELECT t.*, u.name as customer_name, b.booking_date, b.booking_time, s.name as service_name
      FROM transactions t
      LEFT JOIN users u ON t.customer_id = u.id
      LEFT JOIN bookings b ON t.booking_id = b.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE t.id = ?
    `;
    const [rows] = await promisePool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Get transactions by customer ID
  static async getByCustomerId(customerId) {
    const query = `
      SELECT t.*, s.name as service_name
      FROM transactions t
      LEFT JOIN bookings b ON t.booking_id = b.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE t.customer_id = ?
      ORDER BY t.transaction_date DESC
    `;
    const [rows] = await promisePool.execute(query, [customerId]);
    return rows;
  }

  // Get all transactions (for admin)
  static async getAll(filters = {}) {
    let query = `
      SELECT t.*, u.name as customer_name, s.name as service_name
      FROM transactions t
      LEFT JOIN users u ON t.customer_id = u.id
      LEFT JOIN bookings b ON t.booking_id = b.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND t.payment_status = ?';
      params.push(filters.status);
    }

    if (filters.method) {
      query += ' AND t.payment_method = ?';
      params.push(filters.method);
    }

    query += ' ORDER BY t.transaction_date DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [rows] = await promisePool.execute(query, params);
    return rows;
  }

  // Get transaction analytics
  static async getTransactionStats() {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_revenue,
        SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as completed_revenue,
        SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN payment_status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM transactions
    `;
    const [rows] = await promisePool.execute(query);
    
    // Get daily revenue for the last 7 days
    const dailyQuery = `
      SELECT DATE(transaction_date) as date, SUM(amount) as revenue
      FROM transactions
      WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      AND payment_status = 'completed'
      GROUP BY DATE(transaction_date)
      ORDER BY date ASC
    `;
    const [dailyRows] = await promisePool.execute(dailyQuery);

    return {
      overview: rows[0],
      dailyHistory: dailyRows
    };
  }

  // Update transaction status
  static async updateStatus(id, status) {
    const query = 'UPDATE transactions SET payment_status = ? WHERE id = ?';
    await promisePool.execute(query, [status, id]);
  }
}

module.exports = Transaction;
