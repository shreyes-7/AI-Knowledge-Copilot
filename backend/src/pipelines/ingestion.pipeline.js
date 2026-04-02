const TextExtractor = require('../utils/textExtractor');
const TextChunker = require('../utils/chunker');
const DocumentRepository = require('../utils/documentRepository');
const { getEmbeddingService } = require('../services/embedding.service');
const logger = require('../utils/logger');
const config = require('../config/env');
const fs = require('fs').promises;

/**
 * Document Ingestion Pipeline
 * Handles the complete document processing workflow:
 * 1. Extract text from file
 * 2. Clean and chunk text
 * 3. Generate embeddings
 * 4. Store in MongoDB
 */
class IngestionPipeline {
  constructor() {
    this.textExtractor = new TextExtractor();
    this.textChunker = new TextChunker({
      chunkSize: 800,
      overlapSize: 160,
    });
    this.documentRepository = new DocumentRepository();
    this.embeddingService = getEmbeddingService();
  }

  /**
   * Process a single file through the entire pipeline
   */
  async processFile(filePath, metadata = {}) {
    try {
      logger.info('Starting document ingestion', {
        filePath,
        metadata,
      });

      // Step 1: Extract text
      const fileExtension = metadata.originalFileType || this.textExtractor.getFileExtension(filePath);
      const fileName = metadata.originalFileName || this.textExtractor.getFileName(filePath);
      
      const text = await this.textExtractor.extractText(filePath, fileExtension);

      // Step 2: Chunk text
      const chunks = this.textChunker.chunk(text);

      if (chunks.length === 0) {
        throw new Error('No text chunks generated from file');
      }

      logger.info('Text chunks created', {
        chunkCount: chunks.length,
        avgChunkSize: Math.round(text.length / chunks.length),
      });

      // Step 3: Generate embeddings
      const embeddings = await this.embeddingService.generateEmbeddings(chunks);

      // Step 4: Prepare documents for storage
      const docId = metadata.docId || `doc_${Date.now()}`;
      const documents = chunks.map((chunk, index) => ({
        text: chunk,
        embedding: embeddings[index],
        metadata: {
          doc_id: docId,
          source: fileName,
          chunk_index: index,
          total_chunks: chunks.length,
          file_type: fileExtension,
          ...metadata,
        },
      }));

      // Step 5: Store in MongoDB
      const result = await this.documentRepository.insertMany(documents);

      logger.info('Document ingestion completed', {
        docId,
        insertedCount: result.insertedIds.length,
        chunkCount: chunks.length,
      });

      // Clean up uploaded file
      try {
        await fs.unlink(filePath);
        logger.info('Uploaded file cleaned up', { filePath });
      } catch (error) {
        logger.warn('Failed to cleanup file', { filePath, error: error.message });
      }

      return {
        success: true,
        docId,
        insertedCount: result.insertedIds.length,
        chunkCount: chunks.length,
        fileName,
      };
    } catch (error) {
      logger.error('Document ingestion failed', {
        filePath,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Process multiple files
   */
  async processFiles(filePaths, metadata = {}) {
    try {
      logger.info('Starting batch ingestion', { fileCount: filePaths.length });

      const results = [];
      for (let i = 0; i < filePaths.length; i++) {
        try {
          const result = await this.processFile(filePaths[i], {
            ...metadata,
            batchId: `batch_${Date.now()}`,
            batchIndex: i,
          });
          results.push(result);
        } catch (error) {
          logger.error('Failed to process file in batch', {
            filePath: filePaths[i],
            error: error.message,
          });
          results.push({
            success: false,
            filePath: filePaths[i],
            error: error.message,
          });
        }
      }

      logger.info('Batch ingestion completed', {
        totalFiles: filePaths.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
      });

      return results;
    } catch (error) {
      logger.error('Batch ingestion failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get ingestion status/statistics
   */
  async getStats() {
    try {
      const totalDocuments = await this.documentRepository.count();
      const uniqueSources = await this.documentRepository
        .getCollection()
        .distinct('metadata.source');

      return {
        totalChunks: totalDocuments,
        uniqueDocuments: uniqueSources.length,
        sources: uniqueSources,
      };
    } catch (error) {
      logger.error('Failed to get stats', { error: error.message });
      throw error;
    }
  }
}

// Singleton instance
let ingestionPipeline = null;

const getIngestionPipeline = () => {
  if (!ingestionPipeline) {
    ingestionPipeline = new IngestionPipeline();
  }
  return ingestionPipeline;
};

module.exports = {
  IngestionPipeline,
  getIngestionPipeline,
};
