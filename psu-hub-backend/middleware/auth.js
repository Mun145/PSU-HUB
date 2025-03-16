// psu-hub-backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError('Authorization header missing', 401, 'AUTH_HEADER_MISSING');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Token missing', 401, 'TOKEN_MISSING');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded token (user id and role)
    next();
  } catch (error) {
    next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
};
