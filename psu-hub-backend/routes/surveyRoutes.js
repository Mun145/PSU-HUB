// psu-hub-backend/routes/surveyRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const SurveyCtrl = require('../controllers/surveyController');

const r = express.Router();

// Admin endpoints
r.post('/',           auth, SurveyCtrl.createSurvey);             
r.post('/:id/questions', auth, SurveyCtrl.addQuestions);          

// Public / faculty
r.get('/event/:eventId', auth, SurveyCtrl.getByEvent);
r.post('/:id/response',  auth, SurveyCtrl.submitResponse);

module.exports = r;
