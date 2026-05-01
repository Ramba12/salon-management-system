const express = require('express');
const { body, query } = require('express-validator');
const {
  getBookings,
  getMyBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  getBookingStats,
  getBookingsByDateRange
} = require('../controllers/bookingController');
const { verifyToken, requireAdminOrStaff, requireCustomer } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings
// @access  Private (Admin/Staff)
router.get('/', [
  verifyToken,
  requireAdminOrStaff,
  query('status').optional().isIn(['pending', 'approved', 'completed', 'cancelled']),
  query('date').optional().isISO8601(),
  query('staff_id').optional().isInt(),
  query('limit').optional().isInt({ min: 1, max: 100 })
], getBookings);

// @route   GET /api/bookings/my-bookings
// @desc    Get customer bookings
// @access  Private (Customer)
router.get('/my-bookings', verifyToken, requireCustomer, getMyBookings);

// @route   GET /api/bookings/stats
// @desc    Get booking statistics
// @access  Private (Admin)
router.get('/stats', verifyToken, requireAdminOrStaff, getBookingStats);

// @route   GET /api/bookings/date-range
// @desc    Get bookings by date range
// @access  Private (Admin/Staff)
router.get('/date-range', [
  verifyToken,
  requireAdminOrStaff,
  query('start_date').isISO8601().withMessage('Start date is required and must be valid'),
  query('end_date').isISO8601().withMessage('End date is required and must be valid')
], getBookingsByDateRange);

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', verifyToken, getBooking);

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private (Customer)
router.post('/', [
  verifyToken,
  requireCustomer,
  body('service_id')
    .isInt({ min: 1 })
    .withMessage('Service ID is required and must be a positive integer'),
  body('staff_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Staff ID must be a positive integer'),
  body('booking_date')
    .isISO8601()
    .withMessage('Booking date is required and must be valid'),
  body('booking_time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Booking time must be in HH:MM format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
], createBooking);

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Admin/Staff)
router.put('/:id/status', [
  verifyToken,
  requireAdminOrStaff,
  body('status')
    .isIn(['pending', 'approved', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, approved, completed, cancelled')
], updateBookingStatus);

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private (Admin/Staff)
router.put('/:id', [
  verifyToken,
  requireAdminOrStaff,
  body('service_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Service ID must be a positive integer'),
  body('staff_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Staff ID must be a positive integer'),
  body('booking_date')
    .optional()
    .isISO8601()
    .withMessage('Booking date must be valid'),
  body('booking_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Booking time must be in HH:MM format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
], updateBooking);

// @route   DELETE /api/bookings/:id
// @desc    Delete booking
// @access  Private (Admin/Staff)
router.delete('/:id', verifyToken, requireAdminOrStaff, deleteBooking);

// @route   PATCH /api/bookings/:id/cancel
// @desc    Customer cancels their own booking
// @access  Private (Customer)
router.patch('/:id/cancel', verifyToken, requireCustomer, require('../controllers/bookingController').cancelMyBooking);

module.exports = router;



