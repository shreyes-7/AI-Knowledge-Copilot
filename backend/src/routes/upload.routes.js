const express = require('express');
const router = express.Router();
const { uploadDocument, getUploadStats } = require('../controllers/upload.controller');

/**
 * Upload Routes
 */

/**
 * POST /api/upload
 * Upload and ingest document(s)
 */
router.post('/', uploadDocument);

/**
 * GET /api/upload/stats
 * Get upload statistics
 */
router.get('/stats', getUploadStats);

module.exports = router;
