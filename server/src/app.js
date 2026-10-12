import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Trust proxy for rate limiting behind reverse proxies (Render, Vercel, Nginx)
app.set('trust proxy', 1);

// 1. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// 2. CORS Whitelist Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        config.clientUrl,
        'http://localhost:5173',
        'http://localhost:3000',
        'https://astravani.in',
        'https://www.astravani.in'
      ];

      if (allowedOrigins.includes(origin) || !config.isProd) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true, // Crucial for sending and receiving httpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
  })
);

// 3. Body parsers with safe payload limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Cookie parser for reading httpOnly cookies
app.use(cookieParser());

// 5. CSRF Defense for cookie-based authentication:
// Ensures state-changing requests carry standard header or same-origin header
app.use((req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Exempt local dev or check for X-Requested-With / Origin match
  const origin = req.headers.origin || req.headers.referer;
  const customHeader = req.headers['x-requested-with'];

  if (customHeader || !config.isProd || (origin && origin.includes(new URL(config.clientUrl).host))) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Cross-Site Request Forgery (CSRF) verification failed.'
  });
});

// 6. Global Rate Limiter
app.use(globalLimiter);

// 7. Health Check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// 8. Auth API Routes
app.use('/auth', authRoutes);

// 9. Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
