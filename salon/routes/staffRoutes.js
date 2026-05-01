const express = require('express');
const Staff = require('../models/staffModel');

const router = express.Router();

// @route   GET /api/staff
// @desc    Get all active staff (public for customers to pick stylists)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.getAllActive();
    res.json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    console.error('Get public staff error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;


