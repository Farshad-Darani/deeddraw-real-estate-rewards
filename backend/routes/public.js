const express = require('express');
const router = express.Router();
const { getGlobalStats, searchParticipants, getLeaderboard } = require('../controllers/publicController');

// Public routes - no authentication required
router.get('/stats', getGlobalStats);
router.get('/search-participants', searchParticipants);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
