const express = require('express');
const { body, query } = require('express-validator');
const {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffStats
} = require('../controllers/adminController');
const { verifyToken, requireAdmin, requireAdminOrStaff } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin/Staff)
router.get('/dashboard', verifyToken, requireAdminOrStaff, getDashboardStats);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', [
  verifyToken,
  requireAdmin,
  query('role').optional().isIn(['customer', 'admin', 'staff'])
], getUsers);

// @route   GET /api/admin/users/:id
// @desc    Get single user
// @access  Private (Admin)
router.get('/users/:id', verifyToken, requireAdmin, getUser);

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin)
router.put('/users/:id', [
  verifyToken,
  requireAdmin,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['customer', 'admin', 'staff'])
    .withMessage('Role must be customer, admin, or staff')
], updateUser);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', verifyToken, requireAdmin, deleteUser);

// @route   GET /api/admin/staff
// @desc    Get all staff
// @access  Private (Admin)
router.get('/staff', [
  verifyToken,
  requireAdmin,
  query('specialty').optional().isString(),
  query('search').optional().isString()
], getStaff);

// @route   GET /api/admin/staff/stats
// @desc    Get staff statistics
// @access  Private (Admin)
router.get('/staff/stats', verifyToken, requireAdmin, getStaffStats);

// @route   GET /api/admin/staff/:id
// @desc    Get single staff member
// @access  Private (Admin)
router.get('/staff/:id', verifyToken, requireAdmin, getStaffMember);

// @route   POST /api/admin/staff
// @desc    Create staff member
// @access  Private (Admin)
router.post('/staff', [
  verifyToken,
  requireAdmin,
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('specialty')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Specialty must be between 2 and 50 characters'),
  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must be less than 1000 characters')
], createStaff);

// @route   PUT /api/admin/staff/:id
// @desc    Update staff member
// @access  Private (Admin)
router.put('/staff/:id', [
  verifyToken,
  requireAdmin,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('specialty')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Specialty must be between 2 and 50 characters'),
  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must be less than 1000 characters'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
], updateStaff);

// @route   DELETE /api/admin/staff/:id
// @desc    Delete staff member
// @access  Private (Admin)
router.delete('/staff/:id', verifyToken, requireAdmin, deleteStaff);

module.exports = router;



