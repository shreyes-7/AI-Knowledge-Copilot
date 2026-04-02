require('dotenv').config();

/**
 * Load and validate environment variables
 * Ensures all required config is present before app starts
 */
const requiredEnvs = [
  'PORT',
  'NODE_ENV',
  'MONGODB_URI',
  'MONGODB_DB_NAME',
  'MONGODB_COLLECTION_NAME',
  'GROQ_API_KEY',
  'GROQ_MODEL',
  'EMBEDDING_MODEL',
];

const checkEnvVariables = () => {
  const missing = requiredEnvs.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

module.exports = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'rag_db',
  MONGODB_COLLECTION_NAME: process.env.MONGODB_COLLECTION_NAME || 'documents',
  MONGODB_LOG_COLLECTION: process.env.MONGODB_LOG_COLLECTION || 'logs',

  // Vector Search
  MONGODB_VECTOR_INDEX: process.env.MONGODB_VECTOR_INDEX || 'vector_index',
  VECTOR_SEARCH_TOP_K: parseInt(process.env.VECTOR_SEARCH_TOP_K) || 5,
  VECTOR_SEARCH_CANDIDATES: parseInt(process.env.VECTOR_SEARCH_CANDIDATES) || 100,

  // Hybrid Search
  ENABLE_HYBRID_SEARCH: process.env.ENABLE_HYBRID_SEARCH === 'true',
  KEYWORD_INDEX_NAME: process.env.KEYWORD_INDEX_NAME || 'keyword_index',
  RRF_K: parseInt(process.env.RRF_K) || 60,

  // Groq
  MODEL_PROVIDER: process.env.MODEL_PROVIDER || 'groq',
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  GROQ_TEMPERATURE: parseFloat(process.env.GROQ_TEMPERATURE) || 0.3,
  GROQ_MAX_TOKENS: parseInt(process.env.GROQ_MAX_TOKENS) || 2048,

  // Embeddings
  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || 'huggingface',
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
  EMBEDDING_DIMENSIONS: parseInt(process.env.EMBEDDING_DIMENSIONS) || 384,

  // File Upload
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB) || 10,
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,txt,md').split(','),

  // Performance
  ENABLE_CACHE: process.env.ENABLE_CACHE === 'true',
  CACHE_TTL: parseInt(process.env.CACHE_TTL) || 300,
  REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS) || 10000,

  // Validation
  checkEnvVariables,
};
