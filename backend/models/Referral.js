const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Referral = sequelize.define('Referral', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    referrerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'referrer_id',
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'User who owns the referral code'
    },
    referredUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'referred_user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'New user who used the referral code'
    },
    transactionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'transaction_id',
        references: {
            model: 'transactions',
            key: 'id'
        },
        comment: 'Transaction where referral code was used'
    },
    referralCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'referral_code'
    },
    rewardAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 100.00,
        field: 'reward_amount'
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'paid', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false,
        comment: 'pending: awaiting transaction verification, approved: ready to pay, paid: reward sent, cancelled: transaction rejected'
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'paid_at'
    },
    paymentMethod: {
        type: DataTypes.ENUM('credit', 'etransfer', 'manual'),
        allowNull: true,
        field: 'payment_method',
        comment: 'How the reward was paid: credit=added to account, etransfer=sent via e-transfer, manual=paid outside system'
    },
    paymentReference: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'payment_reference',
        comment: 'E-transfer confirmation or payment reference'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'referrals',
    timestamps: true,
    indexes: [
        { fields: ['referrer_id'] },
        { fields: ['referred_user_id'] },
        { fields: ['transaction_id'] },
        { fields: ['status'] }
    ]
});

module.exports = Referral;
