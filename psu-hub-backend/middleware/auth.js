// psu-hub-backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const logger = require('../services/logger');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.error('Authorization header missing');
      throw new AppError('Authorization header missing', 401, 'AUTH_HEADER_MISSING');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      logger.error('Token missing in authorization header');
      throw new AppError('Token missing', 401, 'TOKEN_MISSING');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded token (user id and role)
    next();
  } catch (error) {
    logger.error('Unauthorized access attempt: %s', error.message);
    next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
};
