const { validationResult } = require('express-validator');
const Service = require('../models/serviceModel');

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { category, search } = req.query;
    let services;

    if (search) {
      services = await Service.searchServices(search);
    } else if (category) {
      services = await Service.getByCategory(category);
    } else {
      services = await Service.getAllActive();
    }

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all services (admin)
// @route   GET /api/services/admin
// @access  Private (Admin)
const getAllServices = async (req, res) => {
  try {
    const services = await Service.getAll();

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin)
const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, price, duration, category, is_active = true } = req.body;

    const serviceId = await Service.create({
      name,
      description,
      price,
      duration,
      category,
      is_active
    });

    const service = await Service.findById(serviceId);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin)
const updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const { name, description, price, duration, category, is_active } = req.body;

    await Service.update(req.params.id, {
      name,
      description,
      price,
      duration,
      category,
      is_active
    });

    const updatedService = await Service.findById(req.params.id);

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await Service.delete(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get service statistics
// @route   GET /api/services/stats
// @access  Private (Admin)
const getServiceStats = async (req, res) => {
  try {
    const stats = await Service.getServiceStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get service stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getServices,
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServiceStats
};



