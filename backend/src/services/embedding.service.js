const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * HuggingFace Embedding Service
 * Generates vector embeddings using HuggingFace Inference API
 */
class EmbeddingService {
  constructor() {
    this.provider = config.EMBEDDING_PROVIDER;
    this.model = config.EMBEDDING_MODEL;
    this.dimensions = config.EMBEDDING_DIMENSIONS;
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.apiUrl = 'https://api-inference.huggingface.co/models';
    this.timeout = config.REQUEST_TIMEOUT_MS;

    if (!this.apiKey && this.provider === 'huggingface') {
      logger.warn('HUGGINGFACE_API_KEY not set, embeddings may fail');
    }
  }

  /**
   * Generate embedding for a single text
   * Returns a vector array of size EMBEDDING_DIMENSIONS
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Text must be a non-empty string');
    }

    try {
      logger.debug('Generating embedding for text', { textLength: text.length });

      const response = await axios.post(
        `${this.apiUrl}/${this.model}`,
        { inputs: text.substring(0, 512) }, // Limit to 512 chars for API
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: this.timeout,
        }
      );

      // HuggingFace returns array of arrays, we need the first one
      let embedding = response.data;
      if (Array.isArray(response.data) && response.data.length > 0) {
        embedding = response.data[0];
      }

      // Validate embedding dimensions
      if (!Array.isArray(embedding) || embedding.length !== this.dimensions) {
        throw new Error(
          `Invalid embedding dimensions: expected ${this.dimensions}, got ${embedding.length}`
        );
      }

      return embedding;
    } catch (error) {
      logger.error('Embedding generation failed', {
        model: this.model,
        error: error.message,
        textLength: text.length,
      });
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('Texts must be a non-empty array');
    }

    try {
      logger.info('Generating embeddings for batch', { count: texts.length });

      const embeddings = await Promise.all(
        texts.map(text => this.generateEmbedding(text))
      );

      logger.info('Batch embedding generation completed', { count: texts.length });
      return embeddings;
    } catch (error) {
      logger.error('Batch embedding generation failed', {
        error: error.message,
        count: texts.length,
      });
      throw error;
    }
  }

  /**
   * Validate embedding vector
   */
  validateEmbedding(embedding) {
    return (
      Array.isArray(embedding) &&
      embedding.length === this.dimensions &&
      embedding.every(x => typeof x === 'number')
    );
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(embedding1, embedding2) {
    if (!this.validateEmbedding(embedding1) || !this.validateEmbedding(embedding2)) {
      throw new Error('Invalid embedding format');
    }

    const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }
}

// Singleton instance
let embeddingService = null;

const getEmbeddingService = () => {
  if (!embeddingService) {
    embeddingService = new EmbeddingService();
  }
  return embeddingService;
};

module.exports = {
  EmbeddingService,
  getEmbeddingService,
};
