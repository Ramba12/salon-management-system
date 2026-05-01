const express = require('express');
const { body, query } = require('express-validator');
const {
  getServices,
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServiceStats
} = require('../controllers/serviceController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/services
// @desc    Get all active services
// @access  Public
router.get('/', [
  query('category').optional().isString(),
  query('search').optional().isString()
], getServices);

// @route   GET /api/services/admin
// @desc    Get all services (admin)
// @access  Private (Admin)
router.get('/admin', verifyToken, requireAdmin, getAllServices);

// @route   GET /api/services/stats
// @desc    Get service statistics
// @access  Private (Admin)
router.get('/stats', verifyToken, requireAdmin, getServiceStats);

// @route   GET /api/services/:id
// @desc    Get single service
// @access  Public
router.get('/:id', getService);

// @route   POST /api/services
// @desc    Create new service
// @access  Private (Admin)
router.post('/', [
  verifyToken,
  requireAdmin,
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .isFloat({ min: 0 })
    .toFloat()
    .withMessage('Price must be a positive number'),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .toInt()
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
], createService);

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Private (Admin)
router.put('/:id', [
  verifyToken,
  requireAdmin,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
], updateService);

// @route   DELETE /api/services/:id
// @desc    Delete service
// @access  Private (Admin)
router.delete('/:id', verifyToken, requireAdmin, deleteService);

module.exports = router;



