const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createTransaction,
    getMyTransactions,
    getTransactionById,
    downloadCertificate
} = require('../controllers/transactionController');

/**
 * @route   POST /api/transactions
 * @desc    Register a new transaction (entry)
 * @access  Protected
 */
router.post('/', protect, createTransaction);

/**
 * @route   GET /api/transactions/my-transactions
 * @desc    Get all transactions for logged-in user
 * @access  Protected
 */
router.get('/my-transactions', protect, getMyTransactions);

/**
 * @route   GET /api/transactions/:id/certificate
 * @desc    Download certificate PDF for verified transaction
 * @access  Protected
 */
router.get('/:id/certificate', protect, downloadCertificate);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction by ID
 * @access  Protected
 */
router.get('/:id', protect, getTransactionById);

module.exports = router;
