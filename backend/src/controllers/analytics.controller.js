const AnalyticsService = require('../services/analytics.service');
const { asyncHandler } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const analyticsService = new AnalyticsService();

/**
 * Analytics Controller
 * Provides analytics endpoints
 */

/**
 * GET /api/analytics/queries
 * Get query statistics
 */
const getQueryStats = asyncHandler(async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;

    const stats = await analyticsService.getQueryStats(days);

    res.json({
      success: true,
      data: {
        ...stats,
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    logger.error('Query stats error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve query statistics',
    });
  }
});

/**
 * GET /api/analytics/uploads
 * Get upload statistics
 */
const getUploadStats = asyncHandler(async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;

    const stats = await analyticsService.getUploadStats(days);

    res.json({
      success: true,
      data: {
        ...stats,
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    logger.error('Upload stats error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve upload statistics',
    });
  }
});

/**
 * GET /api/analytics/performance
 * Get performance metrics
 */
const getPerformanceMetrics = asyncHandler(async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;

    const metrics = await analyticsService.getPerformanceMetrics(days);

    res.json({
      success: true,
      data: {
        metrics,
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    logger.error('Performance metrics error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics',
    });
  }
});

/**
 * GET /api/analytics/top-queries
 * Get top queries
 */
const getTopQueries = asyncHandler(async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const days = req.query.days ? parseInt(req.query.days) : 7;

    const queries = await analyticsService.getTopQueries(limit, days);

    res.json({
      success: true,
      data: {
        queries,
        limit,
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    logger.error('Top queries error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve top queries',
    });
  }
});

/**
 * GET /api/analytics/users
 * Get user activity
 */
const getUserActivity = asyncHandler(async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;

    const activity = await analyticsService.getUserActivity(days);

    res.json({
      success: true,
      data: {
        activity,
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    logger.error('User activity error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user activity',
    });
  }
});

/**
 * GET /api/analytics/models
 * Get model usage
 */
const getModelUsage = asyncHandler(async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;

    const usage = await analyticsService.getModelUsage(days);

    res.json({
      success: true,
      data: {
        usage,
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    logger.error('Model usage error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve model usage',
    });
  }
});

/**
 * POST /api/analytics/cleanup
 * Clean up old logs
 */
const cleanupLogs = asyncHandler(async (req, res) => {
  try {
    const daysToKeep = req.body.daysToKeep || 90;

    const deletedCount = await analyticsService.clearOldLogs(daysToKeep);

    res.json({
      success: true,
      data: {
        message: `Deleted ${deletedCount} old log entries`,
        daysToKeep,
      },
    });
  } catch (error) {
    logger.error('Cleanup error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to cleanup logs',
    });
  }
});

module.exports = {
  getQueryStats,
  getUploadStats,
  getPerformanceMetrics,
  getTopQueries,
  getUserActivity,
  getModelUsage,
  cleanupLogs,
};
