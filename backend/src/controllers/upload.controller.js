const { getIngestionPipeline } = require('../pipelines/ingestion.pipeline');
const { asyncHandler } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const config = require('../config/env');

/**
 * Upload Controller
 * Handles document upload and ingestion initiation
 */

/**
 * POST /api/upload
 * Upload and ingest a document
 */
const uploadDocument = asyncHandler(async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      });
    }

    const uploadedFiles = Object.values(req.files).flat();
    const pipeline = getIngestionPipeline();
    const results = [];

    for (const file of uploadedFiles) {
      try {
        // Validate file type
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!config.ALLOWED_FILE_TYPES.includes(fileExt)) {
          results.push({
            success: false,
            fileName: file.name,
            error: `File type not allowed. Allowed types: ${config.ALLOWED_FILE_TYPES.join(', ')}`,
          });
          continue;
        }

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > config.MAX_FILE_SIZE_MB) {
          results.push({
            success: false,
            fileName: file.name,
            error: `File size exceeds limit of ${config.MAX_FILE_SIZE_MB}MB`,
          });
          continue;
        }

        // Process file
        const result = await pipeline.processFile(file.tempFilePath, {
          uploadedBy: req.body.userId || 'anonymous',
          uploadedAt: new Date(),
        });

        results.push(result);
      } catch (error) {
        logger.error('File processing error', {
          fileName: file.name,
          error: error.message,
        });

        results.push({
          success: false,
          fileName: file.name,
          error: error.message,
        });
      }
    }

    // Separate successful and failed uploads
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    res.json({
      success: failed.length === 0,
      message: `Successfully processed ${successful.length}/${uploadedFiles.length} files`,
      data: {
        successful,
        failed,
      },
    });
  } catch (error) {
    logger.error('Upload endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Upload processing failed',
    });
  }
});

/**
 * GET /api/upload/stats
 * Get upload statistics
 */
const getUploadStats = asyncHandler(async (req, res) => {
  try {
    const pipeline = getIngestionPipeline();
    const stats = await pipeline.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get upload stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
    });
  }
});

module.exports = {
  uploadDocument,
  getUploadStats,
};
