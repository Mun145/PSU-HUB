// psu-hub-backend/middleware/roleCheck.js
const AppError = require('../utils/AppError');

const roleCheck = (requiredRoles) => {
  // Ensure requiredRoles is an array
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Not authorized for this action', 403, 'FORBIDDEN'));
    }
    next();
  };
};

module.exports = roleCheck;
