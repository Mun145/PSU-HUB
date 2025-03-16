// services/notificationService.js
const logger = require('./logger');

/**
 * Sends a notification to all connected clients.
 * @param {object} app - Your Express app instance (which has the Socket.io instance in app.locals.io)
 * @param {object} notification - An object containing notification details (e.g., { message, timestamp })
 */
function sendNotification(app, notification) {
  const io = app.locals.io;
  if (io) {
    // Emit the notification to all connected clients
    io.emit('newNotification', notification);
    logger.info('Notification sent', notification);
  } else {
    logger.error('Socket.io not initialized. Notification not sent.');
  }
}

module.exports = { sendNotification };
