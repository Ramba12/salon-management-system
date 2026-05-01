const { validationResult } = require('express-validator');
const Booking = require('../models/bookingModel');
const Service = require('../models/serviceModel');
const Staff = require('../models/staffModel');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin/Staff)
const getBookings = async (req, res) => {
  try {
    const { status, date, staff_id, limit } = req.query;
    const filters = { status, date, staff_id, limit };

    const bookings = await Booking.getAll(filters);

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get customer bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Customer)
const getMyBookings = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const offset = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.getByCustomerId(req.user.id, { limit, offset }),
      Booking.countByCustomerId(req.user.id)
    ]);

    res.json({
      success: true,
      count: bookings.length,
      total,
      page,
      limit,
      hasMore: offset + bookings.length < total,
      data: bookings
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can access this booking
    if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { service_id, staff_id, booking_date, booking_time, notes } = req.body;

    // Check if service exists
    const service = await Service.findById(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if staff exists (if provided)
    if (staff_id) {
      const staff = await Staff.findById(staff_id);
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      // Check for booking conflicts
      const hasConflict = await Booking.checkConflict(
        staff_id,
        booking_date,
        booking_time,
        service.duration
      );

      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'Time slot is not available for the selected staff member'
        });
      }
    }

    // Create booking
    const normalizedStaffId = staff_id || null;
    const bookingId = await Booking.create({
      customer_id: req.user.id,
      service_id,
      staff_id: normalizedStaffId,
      booking_date,
      booking_time,
      notes,
      total_price: service.price
    });

    const booking = await Booking.findById(bookingId);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin/Staff)
const updateBookingStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, completed, cancelled'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await Booking.updateStatus(req.params.id, status);

    const updatedBooking = await Booking.findById(req.params.id);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private (Admin/Staff)
const updateBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const { service_id, staff_id, booking_date, booking_time, notes } = req.body;

    // Check if service exists
    const service = await Service.findById(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check for conflicts if staff is changed
    if (staff_id && staff_id !== booking.staff_id) {
      const hasConflict = await Booking.checkConflict(
        staff_id,
        booking_date,
        booking_time,
        service.duration,
        req.params.id
      );

      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'Time slot is not available for the selected staff member'
        });
      }
    }

    await Booking.update(req.params.id, {
      service_id,
      staff_id,
      booking_date,
      booking_time,
      notes,
      total_price: service.price
    });

    const updatedBooking = await Booking.findById(req.params.id);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin/Staff)
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await Booking.delete(req.params.id);

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private (Admin)
const getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.getBookingStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get bookings by date range
// @route   GET /api/bookings/date-range
// @access  Private (Admin/Staff)
const getBookingsByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const bookings = await Booking.getByDateRange(start_date, end_date);

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings by date range error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Customer cancels their own booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Customer)
const cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied!' });
    }
    if (booking.status !== 'pending' && booking.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only pending/approved bookings can be cancelled.' });
    }
    await Booking.updateStatus(req.params.id, 'cancelled');
    const updated = await Booking.findById(req.params.id);
    res.json({ success: true, message: 'Booking cancelled', data: updated });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getBookings,
  getMyBookings,
  getBooking,
  createBooking,
  cancelMyBooking,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  getBookingStats,
  getBookingsByDateRange
};



