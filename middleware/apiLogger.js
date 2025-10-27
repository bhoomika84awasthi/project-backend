// middleware/apiLogger.js
const logger = require('../utils/logger.js');

const apiLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    logger.info(logMessage);
  });

  next();
};

module.exports = apiLogger;
