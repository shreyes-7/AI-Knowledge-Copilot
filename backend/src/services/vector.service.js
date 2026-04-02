const { getCollection } = require('../config/db');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Vector Search Service
 * Performs semantic search using MongoDB Atlas Vector Search
 */
class VectorSearchService {
  constructor() {
    this.collectionName = config.MONGODB_COLLECTION_NAME;
    this.indexName = config.MONGODB_VECTOR_INDEX;
    this.topK = config.VECTOR_SEARCH_TOP_K;
    this.candidates = config.VECTOR_SEARCH_CANDIDATES;
  }

  /**
   * Perform vector search
   * Returns documents most similar to the query embedding
   */
  async search(embedding, options = {}) {
    try {
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Invalid embedding format');
      }

      const topK = options.topK || this.topK;
      const candidates = options.candidates || this.candidates;

      logger.debug('Performing vector search', {
        embeddingDim: embedding.length,
        topK,
        candidates,
      });

      const collection = getCollection(this.collectionName);

      // MongoDB vector search aggregation pipeline
      const results = await collection
        .aggregate([
          {
            $search: {
              index: this.indexName,
              cosmosSearch: false, // MongoDB Atlas doesn't use cosinesearch
              'vector': embedding,
              'k': topK,
            },
          },
          {
            $project: {
              _id: 1,
              text: 1,
              embedding: 1,
              'metadata.source': 1,
              'metadata.doc_id': 1,
              'metadata.chunk_index': 1,
              'metadata.file_type': 1,
              metadata: 1,
              score: { $meta: 'searchScore' },
            },
          },
        ])
        .toArray();

      logger.info('Vector search completed', {
        resultCount: results.length,
        topK,
      });

      return results;
    } catch (error) {
      logger.error('Vector search failed', {
        error: error.message,
        embeddingDim: embedding?.length || 0,
      });
      throw error;
    }
  }

  /**
   * Perform hybrid search (vector + keyword)
   * Combines vector and text search results using Reciprocal Rank Fusion (RRF)
   */
  async hybridSearch(embedding, query, options = {}) {
    try {
      if (config.ENABLE_HYBRID_SEARCH === false) {
        throw new Error('Hybrid search is not enabled');
      }

      logger.info('Performing hybrid search', {
        query,
        embeddingDim: embedding.length,
      });

      const vectorResults = await this.search(embedding, options);
      const keywordResults = await this.keywordSearch(query, options);

      // Combine results using RRF
      const combined = this.reciprocalRankFusion(
        vectorResults,
        keywordResults,
        config.RRF_K
      );

      const topK = options.topK || this.topK;
      return combined.slice(0, topK);
    } catch (error) {
      logger.error('Hybrid search failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Keyword search
   */
  async keywordSearch(query, options = {}) {
    try {
      if (!query || typeof query !== 'string') {
        throw new Error('Query must be a non-empty string');
      }

      logger.debug('Performing keyword search', { query });

      const collection = getCollection(this.collectionName);
      const topK = options.topK || this.topK;

      const results = await collection
        .find({
          $text: { $search: query },
        })
        .project({
          score: { $meta: 'textScore' },
          text: 1,
          embedding: 1,
          metadata: 1,
        })
        .sort({ score: { $meta: 'textScore' } })
        .limit(topK * 2) // Get more results for RRF
        .toArray();

      logger.info('Keyword search completed', { resultCount: results.length });

      return results;
    } catch (error) {
      logger.error('Keyword search failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Reciprocal Rank Fusion (RRF)
   * Combines rankings from multiple search methods
   */
  reciprocalRankFusion(vectorResults, keywordResults, k = 60) {
    try {
      const scoreMap = new Map();

      // Score vector results
      vectorResults.forEach((result, rank) => {
        const id = result._id.toString();
        const rrfScore = 1 / (k + rank + 1);
        scoreMap.set(id, {
          ...result,
          vectorRank: rank + 1,
          vectorScore: rrfScore,
          rrfScore: rrfScore,
        });
      });

      // Score keyword results and combine
      keywordResults.forEach((result, rank) => {
        const id = result._id.toString();
        const rrfScore = 1 / (k + rank + 1);

        if (scoreMap.has(id)) {
          const existing = scoreMap.get(id);
          existing.keywordRank = rank + 1;
          existing.keywordScore = rrfScore;
          existing.rrfScore = existing.vectorScore + rrfScore;
        } else {
          scoreMap.set(id, {
            ...result,
            keywordRank: rank + 1,
            keywordScore: rrfScore,
            rrfScore,
          });
        }
      });

      // Sort by combined RRF score
      const combined = Array.from(scoreMap.values())
        .sort((a, b) => b.rrfScore - a.rrfScore);

      logger.debug('RRF fusion completed', {
        resultCount: combined.length,
        vectorCount: vectorResults.length,
        keywordCount: keywordResults.length,
      });

      return combined;
    } catch (error) {
      logger.error('RRF fusion failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Advanced search with filters
   */
  async advancedSearch(embedding, filters = {}, options = {}) {
    try {
      const collection = getCollection(this.collectionName);
      const topK = options.topK || this.topK;

      // Build filter query
      let filterQuery = {};
      if (filters.source) {
        filterQuery['metadata.source'] = filters.source;
      }
      if (filters.docId) {
        filterQuery['metadata.doc_id'] = filters.docId;
      }
      if (filters.fileType) {
        filterQuery['metadata.file_type'] = filters.fileType;
      }
      if (filters.dateRange) {
        filterQuery.createdAt = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end),
        };
      }

      logger.debug('Performing advanced search', {
        filters,
        embeddingDim: embedding.length,
      });

      // Vector search with filters
      const results = await collection
        .aggregate([
          {
            $search: {
              index: this.indexName,
              'vector': embedding,
              'k': topK,
              'filter': Object.keys(filterQuery).length > 0 ? filterQuery : undefined,
            },
          },
          ...(Object.keys(filterQuery).length > 0 ? [{ $match: filterQuery }] : []),
          {
            $project: {
              _id: 1,
              text: 1,
              embedding: 1,
              metadata: 1,
              score: { $meta: 'searchScore' },
            },
          },
          { $limit: topK },
        ])
        .toArray();

      logger.info('Advanced search completed', {
        resultCount: results.length,
      });

      return results;
    } catch (error) {
      logger.error('Advanced search failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = VectorSearchService;
