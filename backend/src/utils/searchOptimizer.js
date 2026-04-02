const HYBRID_SEARCH_CONFIG = require('../config/hybridSearchConfig');
const logger = require('./logger');

/**
 * Search Result Optimizer
 * Optimizes hybrid search results using RRF and other techniques
 */
class SearchOptimizer {
  constructor() {
    this.config = HYBRID_SEARCH_CONFIG;
  }

  /**
   * Apply time decay to scores
   * Recent documents get higher scores
   */
  applyTimeDecay(results) {
    if (!this.config.advanced.timeDecay.enabled) {
      return results;
    }

    const lambda = this.config.advanced.timeDecay.lambda;
    const now = Date.now();

    return results.map(result => {
      const docAge = (now - new Date(result.createdAt).getTime()) / (1000 * 60 * 60 * 24); // days
      const decayFactor = Math.exp(-lambda * docAge);

      return {
        ...result,
        decayAdjustedScore: (result.rrfScore || result.score) * decayFactor,
      };
    });
  }

  /**
   * Diversify results
   * Prevent too many results from same source
   */
  diversifyResults(results) {
    const { maxFromSameSource, spreadAcrossChunks } = this.config.diversify;
    const sourceCount = new Map();
    const diversified = [];

    for (const result of results) {
      const source = result.metadata?.source || 'unknown';
      const currentCount = sourceCount.get(source) || 0;

      if (currentCount < maxFromSameSource) {
        diversified.push(result);
        sourceCount.set(source, currentCount + 1);
      }
    }

    return diversified;
  }

  /**
   * Boost exact phrase matches
   */
  boostExactMatches(results, query) {
    if (!this.config.advanced.boostExactPhrase) {
      return results;
    }

    return results.map(result => {
      const text = result.text.toLowerCase();
      const queryLower = query.toLowerCase();

      // Check if exact phrase exists
      if (text.includes(queryLower)) {
        // Boost the score
        return {
          ...result,
          score: (result.score || 0) * 1.5,
        };
      }

      return result;
    });
  }

  /**
   * Remove stop words from query
   */
  removeStopWords(text) {
    if (!this.config.advanced.reduceCommonWords) {
      return text;
    }

    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ]);

    return text
      .toLowerCase()
      .split(' ')
      .filter(word => !stopWords.has(word))
      .join(' ');
  }

  /**
   * Apply field boosts
   */
  applyFieldBoosts(results) {
    return results.map(result => {
      let boostedScore = result.score || 0;

      for (const [field, boost] of Object.entries(this.config.advanced.fieldBoosts)) {
        const fieldValue = this.getNestedValue(result, field);
        if (fieldValue) {
          boostedScore *= boost;
        }
      }

      return {
        ...result,
        boostedScore,
      };
    });
  }

  /**
   * Get nested object value
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Rank results with all optimizations
   */
  rankResults(results, query) {
    try {
      logger.debug('Optimizing search results', { resultCount: results.length });

      // Apply all optimizations
      let optimized = results;

      // 1. Apply time decay
      optimized = this.applyTimeDecay(optimized);

      // 2. Boost exact matches
      optimized = this.boostExactMatches(optimized, query);

      // 3. Apply field boosts
      optimized = this.applyFieldBoosts(optimized);

      // 4. Sort by adjusted score
      optimized.sort((a, b) => {
        const scoreA = a.decayAdjustedScore || a.boostedScore || a.score || 0;
        const scoreB = b.decayAdjustedScore || b.boostedScore || b.score || 0;
        return scoreB - scoreA;
      });

      // 5. Diversify
      optimized = this.diversifyResults(optimized);

      logger.debug('Search results optimized', { resultCount: optimized.length });

      return optimized;
    } catch (error) {
      logger.error('Result ranking failed', { error: error.message });
      return results;
    }
  }

  /**
   * Calculate dynamic weights based on query characteristics
   */
  calculateDynamicWeights(query, queryContext = {}) {
    let vectorWeight = this.config.vector.weight;
    let keywordWeight = this.config.keyword.weight;

    // If query has many keywords, increase keyword weight
    const wordCount = query.split(' ').length;
    if (wordCount > 5) {
      keywordWeight = Math.min(0.6, keywordWeight + 0.1);
      vectorWeight = Math.max(0.4, vectorWeight - 0.1);
    }

    // If query is short, rely more on vector search
    if (wordCount <= 2) {
      vectorWeight = Math.min(0.85, vectorWeight + 0.15);
      keywordWeight = Math.max(0.15, keywordWeight - 0.15);
    }

    // Normalize
    const total = vectorWeight + keywordWeight;
    return {
      vector: vectorWeight / total,
      keyword: keywordWeight / total,
    };
  }
}

module.exports = SearchOptimizer;
