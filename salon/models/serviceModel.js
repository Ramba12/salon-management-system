const { promisePool } = require('../config/db');

class Service {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.duration = data.duration;
    this.category = data.category;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
  }

  // Create a new service
  static async create(serviceData) {
    const { name, description, price, duration, category = 'general', is_active = 1 } = serviceData;
    const query = `
      INSERT INTO services (name, description, price, duration, category, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await promisePool.execute(query, [name, description, price, duration, category, is_active ? 1 : 0]);
    return result.insertId;
  }

  // Get all active services
  static async getAllActive() {
    const query = 'SELECT * FROM services WHERE is_active = 1 ORDER BY category, name';
    const [rows] = await promisePool.execute(query);
    return rows.map(row => new Service(row));
  }

  // Get all services (including inactive)
  static async getAll() {
    const query = 'SELECT * FROM services ORDER BY category, name';
    const [rows] = await promisePool.execute(query);
    return rows.map(row => new Service(row));
  }

  // Get service by ID
  static async findById(id) {
    const query = 'SELECT * FROM services WHERE id = ?';
    const [rows] = await promisePool.execute(query, [id]);
    return rows.length > 0 ? new Service(rows[0]) : null;
  }

  // Update service
  static async update(id, updateData) {
    const { name, description, price, duration, category, is_active } = updateData;
    const query = `
      UPDATE services 
      SET name = ?, description = ?, price = ?, duration = ?, category = ?, is_active = ?
      WHERE id = ?
    `;
    await promisePool.execute(query, [name, description, price, duration, category, is_active, id]);
  }

  // Delete service (soft delete by setting is_active to 0)
  static async delete(id) {
    const query = 'UPDATE services SET is_active = 0 WHERE id = ?';
    await promisePool.execute(query, [id]);
  }

  // Get services by category
  static async getByCategory(category) {
    const query = 'SELECT * FROM services WHERE category = ? AND is_active = 1 ORDER BY name';
    const [rows] = await promisePool.execute(query, [category]);
    return rows.map(row => new Service(row));
  }

  // Get service statistics
  static async getServiceStats() {
    const query = `
      SELECT 
        COUNT(*) as total_services,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_services,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_services,
        AVG(price) as average_price
      FROM services
    `;
    const [rows] = await promisePool.execute(query);
    return rows[0];
  }

  // Search services
  static async searchServices(searchTerm) {
    const query = `
      SELECT * FROM services 
      WHERE (name LIKE ? OR description LIKE ?) AND is_active = 1
      ORDER BY name
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await promisePool.execute(query, [searchPattern, searchPattern]);
    return rows.map(row => new Service(row));
  }
}

module.exports = Service;


