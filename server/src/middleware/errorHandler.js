import { config } from '../config/env.js';

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error('[Error caught by globalErrorHandler]:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.isOperational || !config.isProd ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.nodeEnv !== 'production' ? { stack: err.stack } : {})
  });
};
