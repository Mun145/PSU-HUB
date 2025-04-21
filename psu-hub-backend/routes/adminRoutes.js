// psu-hub-backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const adminDashboardController = require('../controllers/adminDashboardController');

// All endpoints here are protected and accessible only to admin users.
router.get('/recent-activity', auth, roleCheck('admin'), adminDashboardController.getRecentActivity);
router.get('/daily-tasks', auth, roleCheck('admin'), adminDashboardController.getDailyTasks);
router.get('/announcements', auth, roleCheck('admin'), adminDashboardController.getAnnouncements);

module.exports = router;
