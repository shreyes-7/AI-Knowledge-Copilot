const path = require('path');
const { pipeline, env } = require('@xenova/transformers');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Local Embedding Service
 * Generates embeddings locally using transformers.js.
 * The model is downloaded on first use and then reused from cache.
 */
class EmbeddingService {
  constructor() {
    this.provider = config.EMBEDDING_PROVIDER;
    this.model = config.EMBEDDING_MODEL;
    this.dimensions = config.EMBEDDING_DIMENSIONS;
    this.extractorPromise = null;

    env.allowLocalModels = true;
    env.cacheDir = path.join(process.cwd(), '.cache', 'transformers');
  }

  async getExtractor() {
    if (!this.extractorPromise) {
      logger.info('Loading local embedding model', {
        provider: this.provider,
        model: this.model,
        cacheDir: env.cacheDir,
      });

      this.extractorPromise = pipeline('feature-extraction', this.model);
    }

    return this.extractorPromise;
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

      const extractor = await this.getExtractor();
      const output = await extractor(text.substring(0, 2048), {
        pooling: 'mean',
        normalize: true,
      });
      const embedding = Array.from(output.data);

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

      // Run sequentially to keep local inference memory and CPU usage stable.
      const embeddings = [];
      for (const text of texts) {
        embeddings.push(await this.generateEmbedding(text));
      }

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
