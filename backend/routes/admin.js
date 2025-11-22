const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getDashboardStats,
    getUsers,
    getTransactions,
    getTransaction,
    approveTransaction,
    rejectTransaction,
    exportParticipants
} = require('../controllers/adminController');
const {
    getAllWithdrawals,
    approveWithdrawal,
    rejectWithdrawal
} = require('../controllers/withdrawalController');

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);

// Transaction management
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransaction);
router.put('/transactions/:id/approve', approveTransaction);
router.put('/transactions/:id/reject', rejectTransaction);

// Withdrawal management
router.get('/withdrawals', getAllWithdrawals);
router.put('/withdrawals/:id/approve', approveWithdrawal);
router.put('/withdrawals/:id/reject', rejectWithdrawal);

// Export data
router.get('/export-participants', exportParticipants);

module.exports = router;
