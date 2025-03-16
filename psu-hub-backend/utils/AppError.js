// psu-hub-backend/utils/AppError.js
class AppError extends Error {
    constructor(message, status = 500, code = 'INTERNAL_ERROR') {
      super(message);
      this.status = status;
      this.code = code;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = AppError;
  