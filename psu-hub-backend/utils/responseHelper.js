// psu-hub-backend/utils/responseHelper.js
/**
 * Sends a standardized success response.
 * @param {Object} res - Express response object.
 * @param {Object} data - Data to send.
 * @param {String} [message] - Optional message.
 */
function sendSuccess(res, data, message = 'Success') {
    return res.json({ message, data });
  }
  
  /**
   * Sends a standardized error response.
   * Note: In our centralized error handler, we are handling errors.
   * This function can be used if you want to send error responses directly.
   * @param {Object} res - Express response object.
   * @param {Number} statusCode - HTTP status code.
   * @param {String} message - Error message.
   */
  function sendError(res, statusCode, message) {
    return res.status(statusCode).json({ error: { message } });
  }
  
  module.exports = { sendSuccess, sendError };
  