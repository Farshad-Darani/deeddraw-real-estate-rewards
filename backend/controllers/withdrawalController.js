const { Withdrawal, User, Transaction } = require('../models');
const { Op } = require('sequelize');

// @desc    Create withdrawal request
// @route   POST /api/withdrawals
// @access  Private
exports.createWithdrawal = async (req, res) => {
    try {
        const { email, amount } = req.body;
        const userId = req.user.id;

        // Validate email
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address for e-transfer'
            });
        }

        // Validate amount
        if (!amount || amount < 100) {
            return res.status(400).json({
                success: false,
                message: 'Minimum withdrawal amount is $100'
            });
        }

        // Calculate user's available earnings
        const user = await User.findByPk(userId);
        const referralCodeUsed = await Transaction.findAll({
            where: { 
                referralCodeUsed: user.referralCode,
                status: 'verified'
            }
        });

        const totalEarnings = referralCodeUsed.reduce((sum, t) => {
            return sum + (t.points * 100);
        }, 0);

        // Check previous withdrawals
        const previousWithdrawals = await Withdrawal.findAll({
            where: {
                userId,
                status: { [Op.in]: ['pending', 'approved'] }
            }
        });

        const totalWithdrawn = previousWithdrawals.reduce((sum, w) => {
            return sum + parseFloat(w.amount);
        }, 0);

        const availableBalance = totalEarnings - totalWithdrawn;

        // Check if user has enough balance
        if (amount > availableBalance) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Available: $${availableBalance.toFixed(2)}`
            });
        }

        // Create withdrawal request
        const withdrawal = await Withdrawal.create({
            userId,
            amount,
            email,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Withdrawal request submitted successfully. You will receive an e-transfer shortly.',
            data: {
                id: withdrawal.id,
                amount: withdrawal.amount,
                email: withdrawal.email,
                status: withdrawal.status,
                createdAt: withdrawal.created_at
            }
        });

    } catch (error) {
        console.error('❌ Create withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to process withdrawal request'
        });
    }
};

// @desc    Get user's withdrawal requests
// @route   GET /api/withdrawals
// @access  Private
exports.getUserWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.findAll({
            where: { userId: req.user.id },
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: withdrawals.map(w => ({
                id: w.id,
                amount: w.amount,
                email: w.email,
                status: w.status,
                createdAt: w.created_at,
                processedAt: w.processedAt
            }))
        });

    } catch (error) {
        console.error('❌ Get user withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch withdrawal history'
        });
    }
};

// @desc    Get all withdrawal requests (Admin)
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
exports.getAllWithdrawals = async (req, res) => {
    try {
        const { status } = req.query;
        
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const withdrawals = await Withdrawal.findAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'referralCode']
            }],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: withdrawals.map(w => ({
                id: w.id,
                amount: w.amount,
                email: w.email,
                status: w.status,
                adminNotes: w.adminNotes,
                createdAt: w.created_at,
                processedAt: w.processedAt,
                user: {
                    id: w.user.id,
                    name: `${w.user.firstName} ${w.user.lastName}`,
                    email: w.user.email,
                    phone: w.user.phone,
                    referralCode: w.user.referralCode
                }
            }))
        });

    } catch (error) {
        console.error('❌ Get all withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch withdrawal requests'
        });
    }
};

// @desc    Approve withdrawal request
// @route   PUT /api/admin/withdrawals/:id/approve
// @access  Private/Admin
exports.approveWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const withdrawal = await Withdrawal.findByPk(id);

        if (!withdrawal) {
            return res.status(404).json({
                success: false,
                message: 'Withdrawal request not found'
            });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending withdrawals can be approved'
            });
        }

        withdrawal.status = 'approved';
        withdrawal.processedAt = new Date();
        if (notes) withdrawal.adminNotes = notes;
        await withdrawal.save();

        res.json({
            success: true,
            message: 'Withdrawal request approved',
            data: {
                id: withdrawal.id,
                status: withdrawal.status,
                processedAt: withdrawal.processedAt
            }
        });

    } catch (error) {
        console.error('❌ Approve withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to approve withdrawal request'
        });
    }
};

// @desc    Reject withdrawal request
// @route   PUT /api/admin/withdrawals/:id/reject
// @access  Private/Admin
exports.rejectWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const withdrawal = await Withdrawal.findByPk(id);

        if (!withdrawal) {
            return res.status(404).json({
                success: false,
                message: 'Withdrawal request not found'
            });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending withdrawals can be rejected'
            });
        }

        withdrawal.status = 'rejected';
        withdrawal.processedAt = new Date();
        if (notes) withdrawal.adminNotes = notes;
        await withdrawal.save();

        res.json({
            success: true,
            message: 'Withdrawal request rejected',
            data: {
                id: withdrawal.id,
                status: withdrawal.status,
                processedAt: withdrawal.processedAt
            }
        });

    } catch (error) {
        console.error('❌ Reject withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to reject withdrawal request'
        });
    }
};
