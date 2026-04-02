const express = require('express');
const router = express.Router();
const { chat, advancedSearch, getAnalytics } = require('../controllers/chat.controller');

/**
 * Chat Routes
 */

/**
 * POST /api/chat
 * Submit a query to the RAG system
 */
router.post('/', chat);

/**
 * POST /api/chat/search
 * Advanced search with filters
 */
router.post('/search', advancedSearch);

/**
 * GET /api/chat/analytics
 * Get analytics
 */
router.get('/analytics', getAnalytics);

module.exports = router;
