const { getCollection } = require('../config/db');
const config = require('../config/env');
const { ObjectId } = require('mongodb');
const logger = require('./logger');

/**
 * Document Repository
 * Handles all database operations for documents
 */
class DocumentRepository {
  constructor() {
    this.collectionName = config.MONGODB_COLLECTION_NAME;
  }

  /**
   * Get collection instance
   */
  getCollection() {
    return getCollection(this.collectionName);
  }

  /**
   * Insert a single document
   */
  async insertOne(document) {
    try {
      const collection = getCollection(this.collectionName);
      const result = await collection.insertOne({
        ...document,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return result;
    } catch (error) {
      logger.error('Insert document failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Insert multiple documents
   */
  async insertMany(documents) {
    try {
      const collection = getCollection(this.collectionName);
      const docsWithTimestamp = documents.map(doc => ({
        ...doc,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const result = await collection.insertMany(docsWithTimestamp);
      return result;
    } catch (error) {
      logger.error('Insert multiple documents failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Find by ID
   */
  async findById(id) {
    try {
      const collection = getCollection(this.collectionName);
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      logger.error('Find by ID failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Find all documents
   */
  async findAll(filter = {}, options = {}) {
    try {
      const collection = getCollection(this.collectionName);
      const skip = options.skip || 0;
      const limit = options.limit || 10;
      const sort = options.sort || { createdAt: -1 };

      const cursor = collection.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort);

      return await cursor.toArray();
    } catch (error) {
      logger.error('Find all failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Count documents
   */
  async count(filter = {}) {
    try {
      const collection = getCollection(this.collectionName);
      return await collection.countDocuments(filter);
    } catch (error) {
      logger.error('Count failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Update document
   */
  async updateOne(id, update) {
    try {
      const collection = getCollection(this.collectionName);
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: {
            ...update,
            updatedAt: new Date(),
          },
        }
      );
      return result;
    } catch (error) {
      logger.error('Update failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete document
   */
  async deleteOne(id) {
    try {
      const collection = getCollection(this.collectionName);
      return await collection.deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      logger.error('Delete failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete many documents
   */
  async deleteMany(filter) {
    try {
      const collection = getCollection(this.collectionName);
      return await collection.deleteMany(filter);
    } catch (error) {
      logger.error('Delete many failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = DocumentRepository;
