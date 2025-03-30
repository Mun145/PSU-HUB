// psu-hub-backend/middleware/roleCheck.js
const AppError = require('../utils/AppError');
const logger = require('../services/logger');

const roleCheck = (requiredRoles) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn('User not authorized for action', { user: req.user ? req.user.id : 'Guest', requiredRoles });
      return next(new AppError('Not authorized for this action', 403, 'FORBIDDEN'));
    }
    next();
  };
};

module.exports = roleCheck;
