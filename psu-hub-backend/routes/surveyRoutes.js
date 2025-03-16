// routes/surveyRoutes.js
const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const auth = require('../middleware/auth');

router.post('/submit', auth, surveyController.submitSurvey);

module.exports = router;
