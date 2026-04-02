const express = require('express');
const router = express.Router();
const {
  listDocuments,
  getDocument,
  getDocumentsBySource,
  deleteDocument,
  deleteDocumentsBySource,
} = require('../controllers/document.controller');

/**
 * Document Routes
 */

/**
 * GET /api/documents
 * List all documents with pagination
 */
router.get('/', listDocuments);

/**
 * GET /api/documents/:id
 * Get document by ID
 */
router.get('/:id', getDocument);

/**
 * GET /api/documents/source/:source
 * Get documents by source
 */
router.get('/source/:source', getDocumentsBySource);

/**
 * DELETE /api/documents/:id
 * Delete document by ID
 */
router.delete('/:id', deleteDocument);

/**
 * DELETE /api/documents/source/:source
 * Delete all documents from a source
 */
router.delete('/source/:source', deleteDocumentsBySource);

module.exports = router;
