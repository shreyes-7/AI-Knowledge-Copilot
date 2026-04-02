const { getRAGService } = require('../services/rag.service');
const { asyncHandler } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Chat Controller
 * Handles RAG queries and conversation
 */

/**
 * POST /api/chat
 * Submit a query to the RAG system
 */
const chat = asyncHandler(async (req, res) => {
  try {
    const { query, topK, temperature, useHybrid } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be a non-empty string',
      });
    }

    logger.info('Chat request received', {
      queryLength: query.length,
      topK: topK || 'default',
      useHybrid: useHybrid || 'default',
    });

    const ragService = getRAGService();
    const result = await ragService.query(query, {
      topK: topK ? parseInt(topK) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      useHybrid: useHybrid !== false,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Chat endpoint error', {
      error: error.message,
      query: req.body.query?.substring(0, 100),
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process query',
    });
  }
});

/**
 * POST /api/chat/search
 * Advanced search with filters
 */
const advancedSearch = asyncHandler(async (req, res) => {
  try {
    const { query, filters, topK, temperature } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    logger.info('Advanced search request', { query, filters });

    const ragService = getRAGService();
    const result = await ragService.advancedSearch(query, filters || {}, {
      topK: topK ? parseInt(topK) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Advanced search error', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/chat/analytics
 * Get chat analytics
 */
const getAnalytics = asyncHandler(async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;

    const ragService = getRAGService();
    const analytics = await ragService.getAnalytics({ days });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Analytics error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics',
    });
  }
});

module.exports = {
  chat,
  advancedSearch,
  getAnalytics,
};
