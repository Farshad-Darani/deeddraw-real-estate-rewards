const { User, Transaction, Withdrawal } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Sequelize = require('sequelize');
const { sendPaymentApprovalEmail } = require('../utils/emailService');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // Get total participants (non-admin users)
        const totalParticipants = await User.count({
            where: { isAdmin: false }
        });

        // Get total points from verified transactions
        const pointsStats = await Transaction.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('points')), 'totalPoints']
            ],
            where: { status: 'verified' }
        });

        // Get total revenue from verified transactions
        const revenueStats = await Transaction.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalRevenue']
            ],
            where: { status: 'verified' }
        });

        // Count pending transactions
        const pendingTransactions = await Transaction.count({
            where: { status: 'pending' }
        });

        // Count verified transactions
        const verifiedTransactions = await Transaction.count({
            where: { status: 'verified' }
        });

        // Count rejected transactions
        const rejectedTransactions = await Transaction.count({
            where: { status: 'rejected' }
        });

        // Get recent transactions
        const recentTransactions = await Transaction.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'email']
            }]
        });

        // Get recent withdrawals
        const recentWithdrawals = await Withdrawal.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'email']
            }]
        });

        // Combine and sort by date
        const allActivities = [
            ...recentTransactions.map(t => ({
                type: 'transaction',
                id: t.id,
                certificateNumber: t.certificateNumber,
                participantName: t.user ? `${t.user.firstName} ${t.user.lastName}` : 'Deleted User',
                participantEmail: t.user ? t.user.email : 'N/A',
                points: t.points,
                amount: t.amount,
                status: t.status,
                date: t.created_at
            })),
            ...recentWithdrawals.map(w => ({
                type: 'withdrawal',
                id: w.id,
                participantName: w.user ? `${w.user.firstName} ${w.user.lastName}` : 'Deleted User',
                participantEmail: w.user ? w.user.email : 'N/A',
                amount: w.amount,
                status: w.status,
                date: w.created_at
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        const totalPoints = parseInt(pointsStats?.dataValues?.totalPoints || 0);
        const totalRevenue = parseFloat(revenueStats?.dataValues?.totalRevenue || 0);

        res.json({
            success: true,
            data: {
                totalParticipants,
                totalPoints,
                totalRevenue,
                pendingTransactions,
                verifiedTransactions,
                rejectedTransactions,
                poolProgress: Math.min((totalPoints / 400) * 100, 100).toFixed(2),
                recentActivity: allActivities
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all users (participants)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search = '', 
            category = '',
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {
            isAdmin: false
        };

        // Add search filter
        if (search) {
            whereClause[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        // Add category filter
        if (category) {
            whereClause.category = category;
        }

        // Get users with transaction stats
        const users = await User.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder]],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COALESCE(SUM(points), 0)
                            FROM transactions
                            WHERE transactions.user_id = \`User\`.id
                            AND transactions.status = 'verified'
                        )`),
                        'totalPoints'
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COALESCE(SUM(amount), 0)
                            FROM transactions
                            WHERE transactions.user_id = \`User\`.id
                            AND transactions.status = 'verified'
                        )`),
                        'totalPaid'
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM transactions
                            WHERE transactions.user_id = \`User\`.id
                        )`),
                        'transactionCount'
                    ]
                ]
            },
            distinct: true
        });

        res.json({
            success: true,
            data: {
                users: users.rows.map(user => ({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    category: user.category,
                    province: user.province,
                    city: user.city,
                    isVerified: user.isVerified,
                    isActive: user.isActive,
                    totalPoints: parseInt(user.dataValues.totalPoints || 0),
                    totalPaid: parseFloat(user.dataValues.totalPaid || 0),
                    transactionCount: parseInt(user.dataValues.transactionCount || 0),
                    createdAt: user.created_at
                })),
                pagination: {
                    total: users.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(users.count / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all transactions with filters
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = '',
            userId = '',
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (userId) {
            whereClause.userId = userId;
        }

        const transactions = await Transaction.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder]],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'category']
            }]
        });

        res.json({
            success: true,
            data: {
                transactions: transactions.rows.map(t => ({
                    id: t.id,
                    certificateNumber: t.certificateNumber,
                    transactionAmount: t.transactionAmount,
                    points: t.points,
                    amount: t.amount,
                    referralDiscount: t.referralDiscount || 0,
                    referralCodeUsed: t.referralCodeUsed,
                    etransferEmail: t.etransferEmail,
                    etransferName: t.etransferName,
                    status: t.status,
                    referralCode: t.referralCode,
                    notes: t.notes,
                    createdAt: t.created_at,
                    updatedAt: t.updated_at,
                    user: t.user ? {
                        id: t.user.id,
                        name: `${t.user.firstName} ${t.user.lastName}`,
                        email: t.user.email,
                        category: t.user.category
                    } : {
                        id: null,
                        name: 'Deleted User',
                        email: 'N/A',
                        category: 'N/A'
                    }
                })),
                pagination: {
                    total: transactions.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(transactions.count / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transactions',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Approve a transaction
// @route   PUT /api/admin/transactions/:id/approve
// @access  Private/Admin
exports.approveTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const transaction = await Transaction.findByPk(id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Transaction is already ${transaction.status}`
            });
        }

        // Update transaction status
        transaction.status = 'verified';
        if (notes) {
            transaction.notes = notes;
        }
        await transaction.save();

        // Update user's total points and paid amount
        const user = transaction.user;
        user.totalPoints = (user.totalPoints || 0) + transaction.points;
        user.totalPaid = parseFloat(user.totalPaid || 0) + parseFloat(transaction.amount);
        await user.save();

        console.log(`✅ Transaction ${id} approved by admin`);
        console.log(`📊 User ${user.email} now has ${user.totalPoints} points`);

        // Send payment approval confirmation email to user
        try {
            const userName = `${user.firstName} ${user.lastName}`.trim();
            await sendPaymentApprovalEmail(
                user.email,
                userName,
                transaction.amount,
                transaction.points,
                transaction.certificateNumber
            );
            console.log(`✅ Payment approval email sent to ${user.email}`);
        } catch (emailError) {
            console.error('⚠️  Failed to send payment approval email:', emailError);
            // Don't fail the approval if email fails
        }

        res.json({
            success: true,
            message: 'Transaction approved successfully',
            data: {
                transaction: {
                    id: transaction.id,
                    certificateNumber: transaction.certificateNumber,
                    status: transaction.status,
                    points: transaction.points,
                    amount: transaction.amount
                },
                user: {
                    id: user.id,
                    email: user.email,
                    totalPoints: user.totalPoints,
                    totalPaid: user.totalPaid
                }
            }
        });

    } catch (error) {
        console.error('Approve transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving transaction',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Reject a transaction
// @route   PUT /api/admin/transactions/:id/reject
// @access  Private/Admin
exports.rejectTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const transaction = await Transaction.findByPk(id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Transaction is already ${transaction.status}`
            });
        }

        // Update transaction status
        transaction.status = 'rejected';
        transaction.notes = reason;
        await transaction.save();

        console.log(`❌ Transaction ${id} rejected by admin`);
        console.log(`📝 Reason: ${reason}`);

        res.json({
            success: true,
            message: 'Transaction rejected',
            data: {
                transaction: {
                    id: transaction.id,
                    certificateNumber: transaction.certificateNumber,
                    status: transaction.status,
                    notes: transaction.notes
                }
            }
        });

    } catch (error) {
        console.error('Reject transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting transaction',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get single transaction details
// @route   GET /api/admin/transactions/:id
// @access  Private/Admin
exports.getTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'category', 'province', 'city']
            }]
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            data: {
                transaction: {
                    id: transaction.id,
                    certificateNumber: transaction.certificateNumber,
                    transactionAmount: transaction.transactionAmount,
                    points: transaction.points,
                    amount: transaction.amount,
                    referralDiscount: transaction.referralDiscount || 0,
                    referralCodeUsed: transaction.referralCodeUsed,
                    eTransferEmail: transaction.etransferEmail,
                    eTransferName: transaction.etransferName,
                    eTransferReference: transaction.etransferReference,
                    eTransferDate: transaction.etransferDate,
                    status: transaction.status,
                    referralCode: transaction.referralCode,
                    notes: transaction.notes,
                    createdAt: transaction.created_at,
                    updatedAt: transaction.updated_at,
                    user: {
                        id: transaction.user.id,
                        firstName: transaction.user.firstName,
                        lastName: transaction.user.lastName,
                        email: transaction.user.email,
                        phone: transaction.user.phone,
                        category: transaction.user.category,
                        province: transaction.user.province,
                        city: transaction.user.city
                    }
                }
            }
        });

    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Export all participants data for draw
// @route   GET /api/admin/export-participants
// @access  Private/Admin
exports.exportParticipants = async (req, res) => {
    try {
        // Get all non-admin users with their verified transactions
        const users = await User.findAll({
            where: { isAdmin: false },
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'province', 'city', 'referralCode', 'created_at'],
            include: [{
                model: Transaction,
                as: 'transactions',
                attributes: ['points', 'certificateNumber', 'status'],
                where: { status: 'verified' },
                required: false // Include users even if they have no verified transactions
            }],
            order: [['created_at', 'DESC']]
        });

        // Format data for export
        const participants = users.map(user => {
            const verifiedTransactions = user.transactions || [];
            const totalPoints = verifiedTransactions.reduce((sum, tx) => sum + (tx.points || 0), 0);
            const certificateNumbers = verifiedTransactions
                .map(tx => tx.certificateNumber)
                .filter(cert => cert)
                .join('; ');

            return {
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email,
                phone: user.phone || '',
                points: totalPoints,
                province: user.province || '',
                city: user.city || '',
                referralCode: user.referralCode || '',
                certificateNumbers: certificateNumbers,
                registeredDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : ''
            };
        });

        res.json({
            success: true,
            participants,
            count: participants.length
        });

    } catch (error) {
        console.error('Export participants error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting participant data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = exports;
