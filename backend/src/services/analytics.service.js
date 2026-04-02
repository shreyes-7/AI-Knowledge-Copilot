const { getCollection } = require('../config/db');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Analytics Service
 * Tracks and analyzes system usage and performance metrics
 */
class AnalyticsService {
  constructor() {
    this.logCollection = config.MONGODB_LOG_COLLECTION;
  }

  /**
   * Log a query event
   */
  async logQueryEvent(eventData) {
    try {
      const logsCollection = getCollection(this.logCollection);

      const logEntry = {
        type: 'query',
        timestamp: new Date(),
        query: eventData.query?.substring(0, 500), // Limit stored query length
        queryLength: eventData.query?.length || 0,
        answer: eventData.answer?.substring(0, 500),
        answerLength: eventData.answer?.length || 0,
        retrievedDocuments: eventData.retrievedDocuments || 0,
        sources: eventData.sources?.length || 0,
        queryTime: eventData.queryTime || 0,
        tokens: eventData.tokens,
        model: eventData.model,
        status: eventData.status || 'success',
        error: eventData.error,
        useHybridSearch: eventData.useHybridSearch || false,
        temperature: eventData.temperature,
        userId: eventData.userId || 'anonymous',
        sessionId: eventData.sessionId,
      };

      await logsCollection.insertOne(logEntry);
    } catch (error) {
      logger.error('Failed to log query event', { error: error.message });
      // Don't throw - logging failure shouldn't crash the system
    }
  }

  /**
   * Log a document upload event
   */
  async logUploadEvent(eventData) {
    try {
      const logsCollection = getCollection(this.logCollection);

      const logEntry = {
        type: 'upload',
        timestamp: new Date(),
        fileName: eventData.fileName,
        fileSize: eventData.fileSize,
        fileType: eventData.fileType,
        chunksCreated: eventData.chunksCreated || 0,
        status: eventData.status || 'success',
        error: eventData.error,
        uploadTime: eventData.uploadTime || 0,
        userId: eventData.userId || 'anonymous',
      };

      await logsCollection.insertOne(logEntry);
    } catch (error) {
      logger.error('Failed to log upload event', { error: error.message });
    }
  }

  /**
   * Get query statistics
   */
  async getQueryStats(days = 7) {
    try {
      const logsCollection = getCollection(this.logCollection);

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const stats = await logsCollection
        .aggregate([
          {
            $match: {
              type: 'query',
              timestamp: { $gte: startDate },
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
              totalQueryTime: { $sum: '$queryTime' },
              avgTokens: { $avg: '$tokens' },
              totalTokens: { $sum: '$tokens' },
              avgRetrievedDocs: { $avg: '$retrievedDocuments' },
            },
          },
        ])
        .toArray();

      return stats[0] || {
        totalQueries: 0,
        successfulQueries: 0,
        failedQueries: 0,
        avgQueryTime: 0,
        totalQueryTime: 0,
        avgTokens: 0,
        totalTokens: 0,
        avgRetrievedDocs: 0,
      };
    } catch (error) {
      logger.error('Failed to get query stats', { error: error.message });
      throw error;
    }
  }

  /**
   * Get upload statistics
   */
  async getUploadStats(days = 7) {
    try {
      const logsCollection = getCollection(this.logCollection);

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const stats = await logsCollection
        .aggregate([
          {
            $match: {
              type: 'upload',
              timestamp: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: null,
              totalUploads: { $sum: 1 },
              successfulUploads: {
                $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
              },
              failedUploads: {
                $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
              },
              totalChunks: { $sum: '$chunksCreated' },
              avgUploadTime: { $avg: '$uploadTime' },
              totalSize: { $sum: '$fileSize' },
            },
          },
        ])
        .toArray();

      return stats[0] || {
        totalUploads: 0,
        successfulUploads: 0,
        failedUploads: 0,
        totalChunks: 0,
        avgUploadTime: 0,
        totalSize: 0,
      };
    } catch (error) {
      logger.error('Failed to get upload stats', { error: error.message });
      throw error;
    }
  }

  /**
   * Get system performance metrics
   */
  async getPerformanceMetrics(days = 7) {
    try {
      const logsCollection = getCollection(this.logCollection);

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const metrics = await logsCollection
        .aggregate([
          {
            $match: {
              type: 'query',
              timestamp: { $gte: startDate },
            },
          },
          {
            $bucket: {
              groupBy: '$queryTime',
              boundaries: [0, 100, 500, 1000, 2000, 5000, 10000],
              default: 'above-10000',
              output: {
                count: { $sum: 1 },
                avg: { $avg: '$queryTime' },
              },
            },
          },
        ])
        .toArray();

      return metrics;
    } catch (error) {
      logger.error('Failed to get performance metrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Get top queries
   */
  async getTopQueries(limit = 10, days = 7) {
    try {
      const logsCollection = getCollection(this.logCollection);

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const topQueries = await logsCollection
        .aggregate([
          {
            $match: {
              type: 'query',
              timestamp: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: '$query',
              count: { $sum: 1 },
              avgTime: { $avg: '$queryTime' },
              successRate: {
                $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
              },
            },
          },
          { $sort: { count: -1 } },
          { $limit: limit },
        ])
        .toArray();

      return topQueries;
    } catch (error) {
      logger.error('Failed to get top queries', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user activity
   */
  async getUserActivity(days = 7) {
    try {
      const logsCollection = getCollection(this.logCollection);

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const activity = await logsCollection
        .aggregate([
          {
            $match: {
              timestamp: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: '$userId',
              queries: {
                $sum: { $cond: [{ $eq: ['$type', 'query'] }, 1, 0] },
              },
              uploads: {
                $sum: { $cond: [{ $eq: ['$type', 'upload'] }, 1, 0] },
              },
              totalTime: { $sum: '$queryTime' },
              firstSeen: { $min: '$timestamp' },
              lastSeen: { $max: '$timestamp' },
            },
          },
          { $sort: { queries: -1 } },
          { $limit: 20 },
        ])
        .toArray();

      return activity;
    } catch (error) {
      logger.error('Failed to get user activity', { error: error.message });
      throw error;
    }
  }

  /**
   * Get model usage statistics
   */
  async getModelUsage(days = 7) {
    try {
      const logsCollection = getCollection(this.logCollection);

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const modelUsage = await logsCollection
        .aggregate([
          {
            $match: {
              type: 'query',
              timestamp: { $gte: startDate },
              model: { $exists: true },
            },
          },
          {
            $group: {
              _id: '$model',
              usageCount: { $sum: 1 },
              totalTokens: { $sum: '$tokens' },
              avgTokens: { $avg: '$tokens' },
              avgTime: { $avg: '$queryTime' },
            },
          },
          { $sort: { usageCount: -1 } },
        ])
        .toArray();

      return modelUsage;
    } catch (error) {
      logger.error('Failed to get model usage', { error: error.message });
      throw error;
    }
  }

  /**
   * Clear old logs
   */
  async clearOldLogs(daysToKeep = 90) {
    try {
      const logsCollection = getCollection(this.logCollection);

      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const result = await logsCollection.deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      logger.info('Old logs cleared', {
        deletedCount: result.deletedCount,
        cutoffDate,
      });

      return result.deletedCount;
    } catch (error) {
      logger.error('Failed to clear old logs', { error: error.message });
      throw error;
    }
  }
}

module.exports = AnalyticsService;
