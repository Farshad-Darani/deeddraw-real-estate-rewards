const User = require('./User');
const Transaction = require('./Transaction');
const Referral = require('./Referral');
const Withdrawal = require('./Withdrawal');

// Define associations

// User has many Transactions
User.hasMany(Transaction, {
    foreignKey: 'user_id',
    as: 'transactions'
});

Transaction.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// User can verify transactions (as admin)
Transaction.belongsTo(User, {
    foreignKey: 'verified_by',
    as: 'verifier'
});

// Referral relationships
User.hasMany(Referral, {
    foreignKey: 'referrer_id',
    as: 'referralsMade'
});

User.hasMany(Referral, {
    foreignKey: 'referred_user_id',
    as: 'referralsReceived'
});

Referral.belongsTo(User, {
    foreignKey: 'referrer_id',
    as: 'referrer'
});

Referral.belongsTo(User, {
    foreignKey: 'referred_user_id',
    as: 'referredUser'
});

Referral.belongsTo(Transaction, {
    foreignKey: 'transaction_id',
    as: 'transaction'
});

Transaction.hasOne(Referral, {
    foreignKey: 'transaction_id',
    as: 'referral'
});

// Withdrawal relationships
User.hasMany(Withdrawal, {
    foreignKey: 'user_id',
    as: 'withdrawals'
});

Withdrawal.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

module.exports = {
    User,
    Transaction,
    Referral,
    Withdrawal
};
