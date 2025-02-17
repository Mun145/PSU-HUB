// psu-hub-backend/routes/surveyRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// POST /api/surveys/submit
// Simulate saving survey responses and generating a certificate.
router.post('/submit', auth, async (req, res) => {
  try {
    // Expect survey data: eventId and responses (object or array)
    const { eventId, responses } = req.body;
    
    // Here you would normally save the survey responses to your database.
    // For this simulation, we assume it's saved successfully.
    
    // Simulate certificate generation:
    const certificate = {
      certificateId: Math.floor(Math.random() * 1000000), // Dummy certificate ID
      eventId,
      userId: req.user.id,
      issuedAt: new Date(),
      message: "Certificate of Participation"
    };
    
    res.status(201).json({ 
      message: 'Survey submitted and certificate generated', 
      certificate 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error submitting survey', 
      error: error.message 
    });
  }
});

module.exports = router;
