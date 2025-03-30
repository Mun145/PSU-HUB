// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS
    ? parseInt(process.env.RATE_LIMIT_WINDOW_MS)
    : 30000, // 30 seconds
  max: process.env.RATE_LIMIT_MAX
    ? parseInt(process.env.RATE_LIMIT_MAX)
    : 1000, // 1000 requests per window
  message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests, please try again later'
});

module.exports = limiter;
