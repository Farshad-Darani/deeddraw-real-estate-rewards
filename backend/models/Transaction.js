const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Total amount paid for the points ($2000 per point)'
    },
    certificateNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'certificate_number'
    },
    transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'transaction_date'
    },
    transactionAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: 'transaction_amount',
        comment: 'Original real estate transaction amount'
    },
    eTransferReference: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'etransfer_reference',
        comment: 'E-transfer reference number or confirmation'
    },
    eTransferEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'etransfer_email',
        comment: 'Email used to send e-transfer'
    },
    eTransferDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'etransfer_date'
    },
    status: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected', 'refunded'),
        defaultValue: 'pending',
        allowNull: false
    },
    verifiedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'verified_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'verified_at'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Admin notes about this transaction'
    },
    referralCodeUsed: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'referral_code_used',
        comment: 'Referral code used for this transaction'
    },
    referralDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        field: 'referral_discount',
        comment: 'Discount amount from referral code ($100 per point)'
    },
    drawingId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'drawing_id',
        comment: 'Which drawing this entry is part of'
    }
}, {
    tableName: 'transactions',
    timestamps: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['status'] },
        { fields: ['certificate_number'] },
        { fields: ['created_at'] }
    ]
});

module.exports = Transaction;
