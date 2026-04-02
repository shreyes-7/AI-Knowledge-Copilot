const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const logger = require('./utils/logger');
const { errorHandler } = require('./utils/errorHandler');
const { connectDB } = require('./config/db');
const { initializeDatabase } = require('./config/dbInit');

// Validate environment variables
config.checkEnvVariables();

const app = express();

/**
 * Middleware setup
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json({
  limit: '50mb',
}));

app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
}));

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'AI Knowledge Copilot RAG System',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      upload: 'POST /api/upload',
      chat: 'POST /api/chat',
      documents: 'GET /api/documents',
    },
  });
});

/**
 * Mount routes (will be added in next phases)
 */
// TODO: Add routes

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.path,
      method: req.method,
    },
  });
});

/**
 * Global error handler
 */
app.use(errorHandler);

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Connect to database and initialize
    await connectDB();
    await initializeDatabase();

    // Start listening
    app.listen(config.PORT, () => {
      logger.info(`Server started successfully`, {
        port: config.PORT,
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  const { disconnectDB } = require('./config/db');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  const { disconnectDB } = require('./config/db');
  await disconnectDB();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
