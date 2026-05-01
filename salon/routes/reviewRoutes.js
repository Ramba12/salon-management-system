const express = require('express');
const { body, query } = require('express-validator');
const {
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
} = require('../controllers/reviewController');
const { verifyToken, requireCustomer } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Public
router.get('/', [
  query('rating').optional().isInt({ min: 1, max: 5 }),
  query('service_id').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], getReviews);

// @route   GET /api/reviews/recent
// @desc    Get recent reviews
// @access  Public
router.get('/recent', [
  query('limit').optional().isInt({ min: 1, max: 50 })
], getRecentReviews);

// @route   GET /api/reviews/stats
// @desc    Get review statistics
// @access  Public
router.get('/stats', getReviewStats);

// @route   GET /api/reviews/service/:serviceId
// @desc    Get reviews by service
// @access  Public
router.get('/service/:serviceId', getReviewsByService);

// @route   GET /api/reviews/service/:serviceId/stats
// @desc    Get service rating statistics
// @access  Public
router.get('/service/:serviceId/stats', getServiceRatingStats);

// @route   GET /api/reviews/my-reviews
// @desc    Get customer reviews
// @access  Private (Customer)
router.get('/my-reviews', verifyToken, requireCustomer, getMyReviews);

// @route   GET /api/reviews/:id
// @desc    Get single review
// @access  Public
router.get('/:id', getReview);

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private (Customer)
router.post('/', [
  verifyToken,
  requireCustomer,
  body('booking_id')
    .isInt({ min: 1 })
    .withMessage('Booking ID is required and must be a positive integer'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
], createReview);

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private (Customer)
router.put('/:id', [
  verifyToken,
  requireCustomer,
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
], updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private (Customer/Admin)
router.delete('/:id', verifyToken, deleteReview);

module.exports = router;









