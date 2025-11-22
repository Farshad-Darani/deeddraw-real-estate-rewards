const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createWithdrawal,
    getUserWithdrawals
} = require('../controllers/withdrawalController');

// User routes (protected)
router.post('/', protect, createWithdrawal);
router.get('/', protect, getUserWithdrawals);

module.exports = router;
