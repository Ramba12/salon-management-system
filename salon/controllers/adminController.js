const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const Service = require('../models/serviceModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const Staff = require('../models/staffModel');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const [userStats, serviceStats, bookingStats, reviewStats, staffStats] = await Promise.all([
      User.getUserStats(),
      Service.getServiceStats(),
      Booking.getBookingStats(),
      Review.getReviewStats(),
      Staff.getStaffStats()
    ]);

    res.json({
      success: true,
      data: {
        users: userStats,
        services: serviceStats,
        bookings: bookingStats,
        reviews: reviewStats,
        staff: staffStats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let users;
    if (search && search.trim() !== '') {
      // New: Search by name/email, optionally by role
      users = await User.searchUsers({ search: search.trim(), role });
    } else if (role) {
      users = await User.getUsersByRole(role);
    } else {
      users = await User.getAllUsers();
    }
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, email, phone, role } = req.body;

    // Update user profile
    await User.updateProfile(req.params.id, { name, phone });

    // Update role if provided
    if (role) {
      const updateRoleQuery = 'UPDATE users SET role = ? WHERE id = ?';
      const { promisePool } = require('../config/db');
      await promisePool.execute(updateRoleQuery, [role, req.params.id]);
    }

    const updatedUser = await User.findById(req.params.id);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await User.deleteUser(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all staff
// @route   GET /api/admin/staff
// @access  Private (Admin)
const getStaff = async (req, res) => {
  try {
    const { specialty, search } = req.query;
    let staff;

    if (search) {
      staff = await Staff.searchStaff(search);
    } else if (specialty) {
      staff = await Staff.getBySpecialty(specialty);
    } else {
      staff = await Staff.getAll();
    }

    res.json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single staff member
// @route   GET /api/admin/staff/:id
// @access  Private (Admin)
const getStaffMember = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get staff member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create staff member
// @route   POST /api/admin/staff
// @access  Private (Admin)
const createStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, specialty, experience, bio } = req.body;

    const staffId = await Staff.create({
      name,
      email,
      phone,
      specialty,
      experience,
      bio
    });

    const staff = await Staff.findById(staffId);

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staff
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update staff member
// @route   PUT /api/admin/staff/:id
// @access  Private (Admin)
const updateStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const { name, email, phone, specialty, experience, bio, is_active } = req.body;

    await Staff.update(req.params.id, {
      name,
      email,
      phone,
      specialty,
      experience,
      bio,
      is_active
    });

    const updatedStaff = await Staff.findById(req.params.id);

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: updatedStaff
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/admin/staff/:id
// @access  Private (Admin)
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    await Staff.delete(req.params.id);

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get staff statistics
// @route   GET /api/admin/staff/stats
// @access  Private (Admin)
const getStaffStats = async (req, res) => {
  try {
    const [stats, specialtyStats] = await Promise.all([
      Staff.getStaffStats(),
      Staff.getSpecialtyStats()
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        specialty_breakdown: specialtyStats
      }
    });
  } catch (error) {
    console.error('Get staff stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
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
};




