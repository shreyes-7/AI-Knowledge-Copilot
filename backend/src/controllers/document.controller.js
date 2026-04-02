const DocumentRepository = require('../utils/documentRepository');
const { asyncHandler } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Document Controller
 * Manages document operations and retrieval
 */

/**
 * GET /api/documents
 * List all documents
 */
const listDocuments = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const repository = new DocumentRepository();
    const documents = await repository.findAll({}, {
      skip,
      limit,
      sort: { createdAt: -1 },
    });

    const total = await repository.count();

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('List documents error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve documents',
    });
  }
});

/**
 * GET /api/documents/:id
 * Get document by ID
 */
const getDocument = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const repository = new DocumentRepository();
    const document = await repository.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    logger.error('Get document error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve document',
    });
  }
});

/**
 * GET /api/documents/source/:source
 * Get documents by source
 */
const getDocumentsBySource = asyncHandler(async (req, res) => {
  try {
    const { source } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const repository = new DocumentRepository();
    const documents = await repository.findAll(
      { 'metadata.source': source },
      {
        skip,
        limit,
        sort: { 'metadata.chunk_index': 1 },
      }
    );

    const total = await repository.count({ 'metadata.source': source });

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get documents by source error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve documents',
    });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
const deleteDocument = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const repository = new DocumentRepository();
    const result = await repository.deleteOne(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    logger.error('Delete document error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
    });
  }
});

/**
 * DELETE /api/documents/source/:source
 * Delete all documents from a source
 */
const deleteDocumentsBySource = asyncHandler(async (req, res) => {
  try {
    const { source } = req.params;

    const repository = new DocumentRepository();
    const result = await repository.deleteMany({ 'metadata.source': source });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} documents`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    logger.error('Delete documents by source error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to delete documents',
    });
  }
});

module.exports = {
  listDocuments,
  getDocument,
  getDocumentsBySource,
  deleteDocument,
  deleteDocumentsBySource,
};
