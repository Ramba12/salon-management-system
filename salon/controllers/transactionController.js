const Transaction = require('../models/transactionModel');
const { validationResult } = require('express-validator');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { booking_id, customer_id, amount, payment_method, payment_status, notes } = req.body;

    // Check if user is creating for themselves or is admin/staff
    if (req.user.role === 'customer' && req.user.id !== parseInt(customer_id)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to create transaction for another user'
      });
    }

    const transactionId = await Transaction.create({
      booking_id,
      customer_id,
      amount,
      payment_method,
      payment_status: payment_status || 'pending',
      notes
    });

    const transaction = await Transaction.findById(transactionId);

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get my transactions
// @route   GET /api/transactions/my-transactions
// @access  Private (Customer)
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.getByCustomerId(req.user.id);
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Get my transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private (Admin/Staff)
const getAllTransactions = async (req, res) => {
  try {
    const { status, method, limit } = req.query;
    const transactions = await Transaction.getAll({ status, method, limit });
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private (Admin/Staff)
const getTransactionStats = async (req, res) => {
  try {
    const stats = await Transaction.getTransactionStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update transaction status
// @route   PATCH /api/transactions/:id/status
// @access  Private (Admin/Staff)
const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await Transaction.updateStatus(req.params.id, status);

    res.json({
      success: true,
      message: 'Transaction status updated successfully'
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createTransaction,
  getMyTransactions,
  getAllTransactions,
  getTransactionStats,
  updateTransactionStatus
};
