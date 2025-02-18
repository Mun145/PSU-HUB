// psu-hub-backend/routes/surveyRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// POST /api/surveys/submit
// Simulate saving survey responses and generating a certificate.
router.post('/submit', auth, async (req, res) => {
  try {
    // Expecting survey data: eventId and responses (object or array)
    const { eventId, responses } = req.body;
    
    // Simulate saving survey responses...
    // For this example, we assume it is successful.
    
    // Simulate certificate generation:
    const certificate = {
      certificateId: Math.floor(Math.random() * 1000000), // Dummy certificate ID
      eventId,
      userId: req.user.id,
      issuedAt: new Date(),
      message: "Certificate of Participation"
    };
    
    logger.info('Survey submitted and certificate generated', { user: req.user.id, eventId });
    res.status(201).json({ message: 'Survey submitted and certificate generated', certificate });
  } catch (error) {
    logger.error('Error submitting survey', { error: error.message });
    res.status(500).json({ message: 'Error submitting survey', error: error.message });
  }
});

module.exports = router;
