/**
 * Hybrid Search Configuration
 * Tunable parameters for vector + keyword search combination
 */

const HYBRID_SEARCH_CONFIG = {
  // RRF (Reciprocal Rank Fusion) parameters
  rrf: {
    // K parameter: higher values reduce the effect of rank order
    k: parseInt(process.env.RRF_K) || 60,
    
    // Enable RRF fusion
    enabled: process.env.ENABLE_HYBRID_SEARCH === 'true',
  },

  // Vector search weights
  vector: {
    // Top K for vector search
    topK: parseInt(process.env.VECTOR_SEARCH_TOP_K) || 5,
    
    // Number of candidates to evaluate
    candidates: parseInt(process.env.VECTOR_SEARCH_CANDIDATES) || 100,
    
    // Vector search weight in RRF (0-1)
    // Higher = more weight on vector similarity
    weight: 0.7,
  },

  // Keyword search weights
  keyword: {
    // Top K for keyword search
    topK: parseInt(process.env.VECTOR_SEARCH_TOP_K) || 5,
    
    // Keyword search weight in RRF (0-1)
    // Higher = more weight on keyword matching
    weight: 0.3,
  },

  // Advanced settings
  advanced: {
    // Use boosting for exact phrase matches
    boostExactPhrase: true,
    
    // Reduce weighting for common words
    reduceCommonWords: true,
    
    // Field boost configuration
    fieldBoosts: {
      'metadata.source': 1.0,
      'text': 1.5, // Prioritize main content
    },

    // Time decay (recent documents ranked higher)
    timeDecay: {
      enabled: true,
      lambda: 0.0001, // Decay factor
    },
  },

  // Search result diversification
  diversify: {
    // Reduce duplicate source appearance
    maxFromSameSource: 2,
    
    // Prefer variety in chunk indices
    spreadAcrossChunks: true,
  },

  // Performance optimization
  performance: {
    // Enable caching of search results
    cache: process.env.ENABLE_CACHE === 'true',
    
    // Cache TTL in seconds
    cacheTTL: parseInt(process.env.CACHE_TTL) || 300,
    
    // Batch keyword search for efficiency
    batchKeywordSearch: true,
    batchSize: 50,
  },
};

module.exports = HYBRID_SEARCH_CONFIG;
