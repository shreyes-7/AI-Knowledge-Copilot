const { MongoClient, ServerApiVersion } = require('mongodb');
const config = require('./env');
const logger = require('../utils/logger');

let dbClient = null;
let db = null;

/**
 * Initialize MongoDB connection with connection pooling
 */
const connectDB = async () => {
  try {
    if (dbClient) {
      logger.info('Using existing database connection');
      return db;
    }

    logger.info('Connecting to MongoDB Atlas...');

    dbClient = new MongoClient(config.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
      maxPoolSize: 50,
      minPoolSize: 10,
      maxConnecting: 10,
    });

    // Connect to the cluster
    await dbClient.connect();
    
    db = dbClient.db(config.MONGODB_DB_NAME);

    // Verify connection
    await db.admin().ping();
    logger.info('MongoDB Atlas connection established successfully');

    return db;
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    throw error;
  }
};

/**
 * Get database instance
 */
const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

/**
 * Get collection
 */
const getCollection = (collectionName) => {
  return getDB().collection(collectionName);
};

/**
 * Disconnect from database
 */
const disconnectDB = async () => {
  if (dbClient) {
    await dbClient.close();
    dbClient = null;
    db = null;
    logger.info('Disconnected from MongoDB');
  }
};

module.exports = {
  connectDB,
  getDB,
  getCollection,
  disconnectDB,
};
