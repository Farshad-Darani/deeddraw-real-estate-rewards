const { Transaction, User } = require('../models');
const Sequelize = require('sequelize');
const { Op } = Sequelize;

/**
 * Get public global statistics
 * No authentication required - public endpoint
 */
exports.getGlobalStats = async (req, res) => {
    try {
        // Get total points from verified transactions
        const pointsStats = await Transaction.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('points')), 'totalPoints']
            ],
            where: { status: 'verified' }
        });

        // Get unique participants count (users with verified transactions)
        const participantsCount = await Transaction.count({
            distinct: true,
            col: 'user_id',
            where: { status: 'verified' }
        });

        const totalPoints = parseInt(pointsStats?.dataValues?.totalPoints || 0);
        const pointsUntilDraw = Math.max(400 - totalPoints, 0);
        const progress = Math.min((totalPoints / 400) * 100, 100);

        res.json({
            success: true,
            data: {
                totalPoints,
                pointsUntilDraw,
                progress: parseFloat(progress.toFixed(2)),
                targetPoints: 400,
                prizePool: 500000,
                participants: participantsCount
            }
        });
    } catch (error) {
        console.error('Error fetching global stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch global statistics'
        });
    }
};

/**
 * Search participants by name
 * Public endpoint - returns users with verified transactions
 */
exports.searchParticipants = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.json({
                success: true,
                data: []
            });
        }

        // Search for users with verified transactions
        const users = await User.findAll({
            where: {
                isAdmin: false,
                [Op.or]: [
                    {
                        firstName: {
                            [Op.like]: `%${query}%`
                        }
                    },
                    {
                        lastName: {
                            [Op.like]: `%${query}%`
                        }
                    }
                ]
            },
            attributes: ['id', 'firstName', 'lastName', 'category', 'city', 'province', 'totalPoints'],
            limit: 10,
            order: [['totalPoints', 'DESC']]
        });

        // Only return users who have verified transactions
        const usersWithTransactions = [];
        for (const user of users) {
            const hasVerifiedTransaction = await Transaction.findOne({
                where: {
                    user_id: user.id,
                    status: 'verified'
                }
            });

            if (hasVerifiedTransaction) {
                usersWithTransactions.push({
                    name: `${user.firstName} ${user.lastName}`,
                    category: user.category,
                    location: user.city && user.province ? `${user.city}, ${user.province}` : 'N/A',
                    points: user.totalPoints || 0
                });
            }
        }

        res.json({
            success: true,
            data: usersWithTransactions
        });
    } catch (error) {
        console.error('Error searching participants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search participants'
        });
    }
};

/**
 * Get leaderboard - top 5 users by points
 * Public endpoint
 */
exports.getLeaderboard = async (req, res) => {
    try {
        // Get top 10 non-admin users with points, ordered by total points
        const users = await User.findAll({
            where: {
                isAdmin: false,
                totalPoints: {
                    [Op.gt]: 0
                }
            },
            attributes: ['id', 'firstName', 'lastName', 'category', 'city', 'province', 'totalPoints', [Sequelize.col('created_at'), 'createdAt']],
            order: [['totalPoints', 'DESC'], [Sequelize.col('created_at'), 'ASC']],
            limit: 10
        });

        // Build leaderboard
        const leaderboard = users.map(user => ({
            name: `${user.firstName} ${user.lastName}`,
            category: user.category,
            location: user.city && user.province ? `${user.city}, ${user.province}` : 'N/A',
            points: user.totalPoints || 0,
            registrationDate: user.dataValues.createdAt
        }));

        res.json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard'
        });
    }
};
