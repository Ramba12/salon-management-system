const { validationResult } = require('express-validator');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const { rating, service_id, limit } = req.query;
    const filters = { rating, service_id, limit };

    const reviews = await Review.getAll(filters);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get reviews by service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
const getReviewsByService = async (req, res) => {
  try {
    const reviews = await Review.getByServiceId(req.params.serviceId);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews by service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get customer reviews
// @route   GET /api/reviews/my-reviews
// @access  Private (Customer)
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.getByCustomerId(req.user.id);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { booking_id, rating, comment } = req.body;

    // Check if booking exists and belongs to customer
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only review your own bookings.'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }

    // Check if customer has already reviewed this booking
    const existingReview = await Review.checkExistingReview(booking_id, req.user.id);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const reviewId = await Review.create({
      booking_id,
      customer_id: req.user.id,
      service_id: booking.service_id,
      rating,
      comment
    });

    const review = await Review.findById(reviewId);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Customer)
const updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user can update this review
    if (review.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own reviews.'
      });
    }

    const { rating, comment } = req.body;

    await Review.update(req.params.id, { rating, comment });

    const updatedReview = await Review.findById(req.params.id);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Customer/Admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user can delete this review
    if (req.user.role !== 'admin' && review.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Review.delete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get review statistics
// @route   GET /api/reviews/stats
// @access  Public
const getReviewStats = async (req, res) => {
  try {
    const stats = await Review.getReviewStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get service rating statistics
// @route   GET /api/reviews/service/:serviceId/stats
// @access  Public
const getServiceRatingStats = async (req, res) => {
  try {
    const stats = await Review.getServiceRatingStats(req.params.serviceId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get service rating stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get recent reviews
// @route   GET /api/reviews/recent
// @access  Public
const getRecentReviews = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const reviews = await Review.getRecent(parseInt(limit));

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getReviews,
  getReviewsByService,
  getMyReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getReviewStats,
  getServiceRatingStats,
  getRecentReviews
};









