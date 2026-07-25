const { createResponse } = require('../utils/responseHandler');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔥 Global Error Caught:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json(createResponse(false, message));
};

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json(createResponse(false, `Route not found - ${req.originalUrl}`));
};

module.exports = {
  errorHandler,
  notFoundHandler
};
