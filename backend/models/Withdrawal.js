const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Withdrawal = sequelize.define('Withdrawal', {
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
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: true
        },
        comment: 'Email address for e-transfer'
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'admin_notes'
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'processed_at'
    }
}, {
    tableName: 'withdrawal_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Withdrawal;
