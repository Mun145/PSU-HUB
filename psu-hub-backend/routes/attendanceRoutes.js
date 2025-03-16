// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

router.post('/mark', auth, attendanceController.markAttendance);
router.get('/', auth, attendanceController.getAllAttendance);
router.get('/user', auth, attendanceController.getUserAttendance);

module.exports = router;

