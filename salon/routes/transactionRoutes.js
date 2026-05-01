const express = require('express');
const { body } = require('express-validator');
const {
  createTransaction,
  getMyTransactions,
  getAllTransactions,
  getTransactionStats,
  updateTransactionStatus
} = require('../controllers/transactionController');
const { verifyToken, requireAdmin, requireAdminOrStaff } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', [
  verifyToken,
  body('booking_id').isInt().withMessage('Valid booking ID is required'),
  body('customer_id').isInt().withMessage('Valid customer ID is required'),
  body('amount').isDecimal().withMessage('Valid amount is required'),
  body('payment_method').optional().isIn(['cash', 'card', 'mpesa', 'other']).withMessage('Invalid payment method'),
  body('payment_status').optional().isIn(['pending', 'completed', 'failed', 'refunded']).withMessage('Invalid payment status')
], createTransaction);

// @route   GET /api/transactions/my-transactions
// @desc    Get my transactions
// @access  Private (Customer)
router.get('/my-transactions', verifyToken, getMyTransactions);

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Private (Admin/Staff)
router.get('/', verifyToken, requireAdminOrStaff, getAllTransactions);

// @route   GET /api/transactions/stats
// @desc    Get transaction statistics
// @access  Private (Admin/Staff)
router.get('/stats', verifyToken, requireAdminOrStaff, getTransactionStats);

// @route   PATCH /api/transactions/:id/status
// @desc    Update transaction status
// @access  Private (Admin/Staff)
router.patch('/:id/status', [
  verifyToken,
  requireAdminOrStaff,
  body('status').isIn(['pending', 'completed', 'failed', 'refunded']).withMessage('Invalid status')
], updateTransactionStatus);

module.exports = router;
