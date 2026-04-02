const VectorSearchService = require('./vector.service');
const GroqService = require('./groq.service');
const { getEmbeddingService } = require('./embedding.service');
const DocumentRepository = require('../utils/documentRepository');
const logger = require('../utils/logger');
const config = require('../config/env');
const { getCollection } = require('../config/db');

/**
 * RAG (Retrieval-Augmented Generation) Service
 * Orchestrates the complete RAG pipeline:
 * 1. Convert query to embedding
 * 2. Retrieve relevant documents
 * 3. Build context string
 * 4. Generate response with Groq
 * 5. Return answer with sources
 */
class RAGService {
  constructor() {
    this.vectorSearch = new VectorSearchService();
    this.groq = new GroqService();
    this.embedding = getEmbeddingService();
    this.documentRepository = new DocumentRepository();
  }

  /**
   * Execute complete RAG query
   */
  async query(userQuery, options = {}) {
    const startTime = Date.now();

    try {
      if (!userQuery || typeof userQuery !== 'string') {
        throw new Error('Query must be a non-empty string');
      }

      logger.info('Starting RAG query', {
        query: userQuery.substring(0, 100),
        hybrid: config.ENABLE_HYBRID_SEARCH,
      });

      // Step 1: Convert query to embedding
      logger.debug('Step 1: Generating query embedding');
      const queryEmbedding = await this.embedding.generateEmbedding(userQuery);

      // Step 2: Retrieve relevant documents
      logger.debug('Step 2: Retrieving documents');
      let retrievedDocs;

      if (config.ENABLE_HYBRID_SEARCH && options.useHybrid !== false) {
        retrievedDocs = await this.vectorSearch.hybridSearch(
          queryEmbedding,
          userQuery,
          {
            topK: options.topK || config.VECTOR_SEARCH_TOP_K,
          }
        );
      } else {
        retrievedDocs = await this.vectorSearch.search(queryEmbedding, {
          topK: options.topK || config.VECTOR_SEARCH_TOP_K,
        });
      }

      if (retrievedDocs.length === 0) {
        logger.warn('No documents retrieved for query');
        return {
          answer: "I don't have any relevant documents to answer this question.",
          sources: [],
          queryTime: Date.now() - startTime,
          model: this.groq.model,
        };
      }

      // Step 3: Build context string
      logger.debug('Step 3: Building context');
      const context = this.buildContext(retrievedDocs);

      // Step 4: Generate response with Groq
      logger.debug('Step 4: Generating response with Groq');
      const result = await this.groq.generateRAGResponse(userQuery, context, {
        temperature: options.temperature || config.GROQ_TEMPERATURE,
        maxTokens: options.maxTokens || config.GROQ_MAX_TOKENS,
      });

      // Step 5: Extract sources
      logger.debug('Step 5: Extracting sources');
      const sources = this.extractSources(retrievedDocs);

      const queryTime = Date.now() - startTime;

      logger.info('RAG query completed successfully', {
        query: userQuery.substring(0, 100),
        retrievedDocCount: retrievedDocs.length,
        sourceCount: sources.length,
        queryTime,
        tokens: result.usage?.total_tokens,
      });

      // Log to MongoDB
      await this.logQuery({
        query: userQuery,
        answer: result.answer,
        retrievedDocCount: retrievedDocs.length,
        sourceCount: sources.length,
        queryTime,
        status: 'success',
      });

      return {
        answer: result.answer,
        sources,
        retrievedDocuments: retrievedDocs.length,
        queryTime,
        model: result.model,
        usage: result.usage,
      };
    } catch (error) {
      logger.error('RAG query failed', {
        query: userQuery?.substring(0, 100),
        error: error.message,
        queryTime: Date.now() - startTime,
      });

      // Log failure to MongoDB
      await this.logQuery({
        query: userQuery,
        error: error.message,
        queryTime: Date.now() - startTime,
        status: 'failed',
      });

      throw error;
    }
  }

  /**
   * Build context string from retrieved documents
   */
  buildContext(documents, maxContextLength = 3000) {
    try {
      let context = '';
      let charCount = 0;

      for (const doc of documents) {
        const docText = `[Source: ${doc.metadata.source}]\n${doc.text}\n\n`;

        if (charCount + docText.length > maxContextLength) {
          // Stop if we exceed max context length
          if (charCount > 0) {
            context += '\n[Context truncated...]';
          }
          break;
        }

        context += docText;
        charCount += docText.length;
      }

      logger.debug('Context built', {
        documentCount: documents.length,
        contextLength: context.length,
      });

      return context;
    } catch (error) {
      logger.error('Context building failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Extract unique sources from retrieved documents
   */
  extractSources(documents) {
    try {
      const sources = new Map();

      for (const doc of documents) {
        const source = doc.metadata.source;
        const key = `${source}_${doc.metadata.doc_id}`;

        if (!sources.has(key)) {
          sources.set(key, {
            source: source,
            docId: doc.metadata.doc_id,
            fileType: doc.metadata.file_type,
            chunkCount: doc.metadata.total_chunks,
          });
        }
      }

      return Array.from(sources.values());
    } catch (error) {
      logger.error('Source extraction failed', { error: error.message });
      return [];
    }
  }

  /**
   * Log query for analytics
   */
  async logQuery(logData) {
    try {
      const logsCollection = getCollection(config.MONGODB_LOG_COLLECTION);
      await logsCollection.insertOne({
        ...logData,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to log query', { error: error.message });
      // Don't throw - logging failure shouldn't crash the query
    }
  }

  /**
   * Get analytics
   */
  async getAnalytics(options = {}) {
    try {
      const logsCollection = getCollection(config.MONGODB_LOG_COLLECTION);

      const stats = await logsCollection
        .aggregate([
          {
            $match: {
              timestamp: {
                $gte: new Date(Date.now() - (options.days || 7) * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: null,
              totalQueries: { $sum: 1 },
              successfulQueries: {
                $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
              },
              failedQueries: {
                $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
              },
              avgQueryTime: { $avg: '$queryTime' },
              avgTokens: { $avg: '$tokens' },
            },
          },
        ])
        .toArray();

      if (stats.length === 0) {
        return {
          totalQueries: 0,
          successfulQueries: 0,
          failedQueries: 0,
          avgQueryTime: 0,
          avgTokens: 0,
        };
      }

      return stats[0];
    } catch (error) {
      logger.error('Failed to get analytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Search with custom filters
   */
  async advancedSearch(query, filters = {}, options = {}) {
    try {
      logger.info('Starting advanced RAG search', { query, filters });

      // Generate query embedding
      const queryEmbedding = await this.embedding.generateEmbedding(query);

      // Perform advanced search
      const retrievedDocs = await this.vectorSearch.advancedSearch(
        queryEmbedding,
        filters,
        {
          topK: options.topK || config.VECTOR_SEARCH_TOP_K,
        }
      );

      // Generate response
      const context = this.buildContext(retrievedDocs);
      const result = await this.groq.generateRAGResponse(query, context, options);
      const sources = this.extractSources(retrievedDocs);

      return {
        answer: result.answer,
        sources,
        retrievedDocuments: retrievedDocs.length,
        model: result.model,
      };
    } catch (error) {
      logger.error('Advanced search failed', { error: error.message });
      throw error;
    }
  }
}

// Singleton instance
let ragService = null;

const getRAGService = () => {
  if (!ragService) {
    ragService = new RAGService();
  }
  return ragService;
};

module.exports = {
  RAGService,
  getRAGService,
};
