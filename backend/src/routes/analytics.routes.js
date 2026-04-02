const express = require('express');
const router = express.Router();
const {
  getQueryStats,
  getUploadStats,
  getPerformanceMetrics,
  getTopQueries,
  getUserActivity,
  getModelUsage,
  cleanupLogs,
} = require('../controllers/analytics.controller');

/**
 * Analytics Routes
 */

/**
 * GET /api/analytics/queries
 * Query statistics
 */
router.get('/queries', getQueryStats);

/**
 * GET /api/analytics/uploads
 * Upload statistics
 */
router.get('/uploads', getUploadStats);

/**
 * GET /api/analytics/performance
 * Performance metrics
 */
router.get('/performance', getPerformanceMetrics);

/**
 * GET /api/analytics/top-queries
 * Top queries
 */
router.get('/top-queries', getTopQueries);

/**
 * GET /api/analytics/users
 * User activity
 */
router.get('/users', getUserActivity);

/**
 * GET /api/analytics/models
 * Model usage statistics
 */
router.get('/models', getModelUsage);

/**
 * POST /api/analytics/cleanup
 * Clean up old logs
 */
router.post('/cleanup', cleanupLogs);

module.exports = router;
