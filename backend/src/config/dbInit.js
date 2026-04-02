const { connectDB, getCollection } = require('./config/db');
const config = require('./config/env');
const logger = require('./utils/logger');

/**
 * Initialize MongoDB collections and indexes
 * Runs on application startup
 */
const initializeDatabase = async () => {
  try {
    const db = await connectDB();
    logger.info('Initializing database collections and indexes...');

    // Get collection
    const collection = await getCollection(config.MONGODB_COLLECTION_NAME);

    // Create vector search index
    logger.info('Creating vector search index...');
    try {
      await db.command({
        createSearchIndex: {
          collection: config.MONGODB_COLLECTION_NAME,
          definition: {
            mappings: {
              dynamic: true,
              fields: {
                embedding: {
                  type: 'vector',
                  dimensions: config.EMBEDDING_DIMENSIONS,
                  similarity: 'cosine',
                },
                text: {
                  type: 'string',
                },
                'metadata.source': {
                  type: 'string',
                },
              },
            },
          },
          name: config.MONGODB_VECTOR_INDEX,
        },
      });
      logger.info('Vector search index created successfully');
    } catch (error) {
      if (error.message.includes('index already exists')) {
        logger.info('Vector search index already exists');
      } else {
        throw error;
      }
    }

    // Create keyword index for hybrid search
    if (config.ENABLE_HYBRID_SEARCH) {
      logger.info('Creating keyword search index...');
      try {
        await db.command({
          createSearchIndex: {
            collection: config.MONGODB_COLLECTION_NAME,
            definition: {
              mappings: {
                dynamic: true,
                fields: {
                  text: {
                    type: 'string',
                    analyzer: 'lucene.standard',
                  },
                },
              },
            },
            name: config.KEYWORD_INDEX_NAME,
          },
        });
        logger.info('Keyword search index created successfully');
      } catch (error) {
        if (error.message.includes('index already exists')) {
          logger.info('Keyword search index already exists');
        } else {
          throw error;
        }
      }
    }

    // Create regular indexes
    logger.info('Creating regular database indexes...');
    await collection.createIndex({ 'metadata.source': 1 });
    await collection.createIndex({ 'metadata.doc_id': 1 });
    await collection.createIndex({ createdAt: 1 });
    await collection.createIndex({ createdAt: -1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

    logger.info('Database indexes created successfully');

    // Initialize logs collection
    const logsCollection = getCollection(config.MONGODB_LOG_COLLECTION);
    await logsCollection.createIndex({ timestamp: -1 });
    await logsCollection.createIndex({ query: 1 });

    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Database initialization failed', { error: error.message, stack: error.stack });
    throw error;
  }
};

module.exports = {
  initializeDatabase,
};
