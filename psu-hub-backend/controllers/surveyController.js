//psu-hub-backend/controllers/surveyController.js
const logger = require('../services/logger');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');

exports.submitSurvey = async (req, res, next) => {
  try {
    const { eventId, responses } = req.body;
    // Generate a dummy certificate; replace with actual certificate generation logic as needed.
    const certificate = {
      certificateId: Math.floor(Math.random() * 1000000),
      eventId,
      userId: req.user.id,
      issuedAt: new Date(),
      message: 'Certificate of Participation'
    };
    logger.info('Survey submitted', { user: req.user.id, eventId });
    return sendSuccess(res, certificate, 'Survey submitted, certificate generated');
  } catch (error) {
    next(error);
  }
};
