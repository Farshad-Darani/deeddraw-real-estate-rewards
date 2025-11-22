const { User, Transaction, Referral } = require('../models');
const { Op } = require('sequelize');
const { generateCertificate } = require('../utils/certificateGenerator');
const { sendETransferInstructions } = require('../utils/emailService');

/**
 * Generate a unique certificate number
 * Format: DD-YYYY-XXXXXX (e.g., DD-2025-001234)
 */
const generateCertificateNumber = async () => {
    const year = new Date().getFullYear();
    const prefix = `DD-${year}-`;
    
    // Get the latest certificate number for this year
    const latestTransaction = await Transaction.findOne({
        where: {
            certificateNumber: {
                [Op.like]: `${prefix}%`
            }
        },
        order: [['created_at', 'DESC']]
    });
    
    let sequenceNumber = 1;
    if (latestTransaction && latestTransaction.certificateNumber) {
        const lastNumber = latestTransaction.certificateNumber.split('-')[2];
        sequenceNumber = parseInt(lastNumber) + 1;
    }
    
    // Pad with zeros to make it 6 digits
    const paddedNumber = sequenceNumber.toString().padStart(6, '0');
    return `${prefix}${paddedNumber}`;
};

/**
 * Create a new transaction (entry registration)
 * POST /api/transactions
 */
exports.createTransaction = async (req, res) => {
    try {
        const {
            points,
            transactionAmount,
            transactionDate,
            eTransferReference,
            eTransferEmail,
            eTransferDate,
            referralCodeUsed,
            notes
        } = req.body;

        // Validation
        if (!points || points < 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Points must be at least 1' 
            });
        }

        if (!transactionAmount || transactionAmount < 500000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Real estate transaction amount must be at least $500,000' 
            });
        }

        if (!eTransferReference || !eTransferEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'E-transfer reference and email are required' 
            });
        }

        // Calculate base registration amount ($2,000 per point)
        const baseAmount = points * 2000;
        
        // Validate referral code if provided and calculate discount
        let referralUser = null;
        let referralDiscount = 0;
        
        if (referralCodeUsed) {
            referralUser = await User.findOne({
                where: { referralCode: referralCodeUsed.toUpperCase() }
            });

            if (!referralUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid referral code'
                });
            }

            // Can't use your own referral code
            if (referralUser.id === req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot use your own referral code'
                });
            }
            
            // Calculate discount: $100 per point
            referralDiscount = points * 100;
        }
        
        // Calculate final amount after discount
        const amount = baseAmount - referralDiscount;

        // Generate unique certificate number
        const certificateNumber = await generateCertificateNumber();

        // Create the transaction
        const transaction = await Transaction.create({
            userId: req.user.id,
            points,
            amount,
            certificateNumber,
            transactionDate: transactionDate || new Date(),
            transactionAmount,
            eTransferReference,
            eTransferEmail,
            eTransferDate: eTransferDate || new Date(),
            status: 'pending',
            referralCodeUsed: referralCodeUsed ? referralCodeUsed.toUpperCase() : null,
            referralDiscount: referralDiscount,
            notes
        });

        // If referral code was used, create referral record (reward paid when transaction is verified)
        if (referralUser) {
            await Referral.create({
                referrerId: referralUser.id,
                referredUserId: req.user.id,
                transactionId: transaction.id,
                referralCode: referralCodeUsed.toUpperCase(),
                rewardAmount: 100.00, // Default $100 reward
                status: 'pending'
            });
        }

        // Fetch the created transaction with user details
        const createdTransaction = await Transaction.findByPk(transaction.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'referralCode']
            }]
        });

        // Send e-Transfer instructions email to user
        try {
            const userName = `${req.user.firstName} ${req.user.lastName}`.trim();
            await sendETransferInstructions(
                req.user.email,
                userName,
                amount,
                certificateNumber
            );
            console.log(`✅ E-Transfer instructions email sent to ${req.user.email}`);
        } catch (emailError) {
            console.error('⚠️  Failed to send e-Transfer instructions email:', emailError);
            // Don't fail the transaction if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Transaction registered successfully. Awaiting admin verification.',
            transaction: createdTransaction
        });

    } catch (error) {
        console.error('❌ Create transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register transaction',
            error: error.message
        });
    }
};

/**
 * Get all transactions for the logged-in user
 * GET /api/transactions/my-transactions
 */
exports.getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { userId: req.user.id },
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'verifier',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });

        res.json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error('❌ Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
};

/**
 * Get user statistics (total points, entries, pending)
 * GET /api/users/stats
 */
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all transactions
        const transactions = await Transaction.findAll({
            where: { userId }
        });

        // Calculate stats
        const verifiedTransactions = transactions.filter(t => t.status === 'verified');
        const pendingTransactions = transactions.filter(t => t.status === 'pending');

        const totalPoints = verifiedTransactions.reduce((sum, t) => sum + t.points, 0);
        const pendingPoints = pendingTransactions.reduce((sum, t) => sum + t.points, 0);
        const totalEntries = verifiedTransactions.length;
        const pendingEntries = pendingTransactions.length;
        const totalAmountPaid = verifiedTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // Get referral stats
        const referrals = await Referral.findAll({
            where: { referrerId: userId }
        });

        // Calculate earnings from transactions that used this user's referral code
        const user = await User.findByPk(userId);
        const referralCodeUsed = await Transaction.findAll({
            where: { 
                referralCodeUsed: user.referralCode,
                status: 'verified'
            }
        });

        // Each referral earns the referrer $100 per point from the referred transaction
        const referralRewardsEarned = referralCodeUsed.reduce((sum, t) => {
            return sum + (t.points * 100);
        }, 0);

        const completedReferrals = referralCodeUsed.length;

        res.json({
            success: true,
            stats: {
                totalPoints,
                pendingPoints,
                totalEntries,
                pendingEntries,
                totalAmountPaid,
                completedReferrals,
                referralRewardsEarned,
                allTimeTotal: totalPoints
            }
        });

    } catch (error) {
        console.error('❌ Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics',
            error: error.message
        });
    }
};

/**
 * Get transaction by ID (user can only view their own transactions)
 * GET /api/transactions/:id
 */
exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id // Users can only view their own transactions
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'referralCode']
                },
                {
                    model: User,
                    as: 'verifier',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            transaction
        });

    } catch (error) {
        console.error('❌ Get transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction',
            error: error.message
        });
    }
};

/**
 * Download certificate PDF for a verified transaction
 * GET /api/transactions/:id/certificate
 */
exports.downloadCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find the transaction and verify it belongs to the user and is verified
        const transaction = await Transaction.findOne({
            where: {
                id,
                user_id: userId,
                status: 'verified'
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'category', 'referralCode']
            }]
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Verified transaction not found'
            });
        }

        // Prepare certificate data
        const certificateData = {
            firstName: transaction.user.firstName,
            lastName: transaction.user.lastName,
            email: transaction.user.email,
            category: transaction.user.category,
            referralCode: transaction.user.referralCode,
            certificateNumber: transaction.certificateNumber,
            points: transaction.points,
            transactionAmount: transaction.transactionAmount || transaction.amount,
            verifiedAt: transaction.verifiedAt || transaction.createdAt
        };

        // Generate PDF
        const pdfBuffer = await generateCertificate(certificateData, 'entry');

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="DeedDraw-Certificate-${transaction.certificateNumber}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF
        res.send(pdfBuffer);

    } catch (error) {
        console.error('❌ Download certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate certificate',
            error: error.message
        });
    }
};
