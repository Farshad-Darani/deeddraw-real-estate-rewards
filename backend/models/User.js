const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'last_name'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    licenseNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'license_number'
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('agent-broker', 'developer', 'sales-marketing', 'mortgage-broker'),
        allowNull: false
    },
    company: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    province: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    postalCode: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'postal_code'
    },
    referralCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'referral_code'
    },
    referredBy: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'referred_by',
        comment: 'Referral code of the user who referred this user'
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_admin'
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_verified'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    totalPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_points'
    },
    totalPaid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'total_paid'
    },
    referralEarnings: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'referral_earnings',
        comment: 'Total earnings from referrals'
    },
    referralCredits: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'referral_credits',
        comment: 'Available credits from referrals that can be used for entries'
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login'
    },
    emailVerificationToken: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'email_verification_token'
    },
    emailVerificationExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'email_verification_expires'
    },
    resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'reset_password_token'
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_password_expires'
    }
}, {
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeValidate: async (user) => {
            // Generate referral code if not provided (before validation)
            if (!user.referralCode) {
                user.referralCode = await User.generateReferralCode(user.firstName, user.lastName);
            }
        },
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to generate unique referral code
User.generateReferralCode = async function(firstName, lastName) {
    const base = (firstName.substring(0, 3) + lastName.substring(0, 3)).toUpperCase();
    let referralCode = base + Math.floor(1000 + Math.random() * 9000);
    
    // Check if code already exists
    let exists = await User.findOne({ where: { referralCode } });
    let attempts = 0;
    
    while (exists && attempts < 10) {
        referralCode = base + Math.floor(1000 + Math.random() * 9000);
        exists = await User.findOne({ where: { referralCode } });
        attempts++;
    }
    
    // If still exists after 10 attempts, add random letters
    if (exists) {
        const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
        referralCode = base + randomChars;
    }
    
    return referralCode;
};

// Method to get public user data (without sensitive info)
User.prototype.toPublicJSON = function() {
    return {
        id: this.id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        category: this.category,
        company: this.company,
        referralCode: this.referralCode,
        totalPoints: this.totalPoints,
        totalPaid: this.totalPaid,
        referralEarnings: this.referralEarnings,
        referralCredits: this.referralCredits,
        isVerified: this.isVerified,
        isAdmin: this.isAdmin,
        createdAt: this.created_at
    };
};

module.exports = User;
