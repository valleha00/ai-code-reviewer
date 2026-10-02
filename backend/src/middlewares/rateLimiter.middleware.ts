import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // e.g. 1 minute
  max: env.RATE_LIMIT_MAX_REQUESTS, // e.g. 30 requests per minute
  standardHeaders: true, // Return standard `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many analysis requests from this IP. Please wait before submitting another review.',
    retryAfterSeconds: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
  },
  handler: (_req, res, _next, options) => {
    res.status(429).json(options.message);
  },
});
