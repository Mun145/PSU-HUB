// Directory: psu-hub-backend/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/overview', auth, roleCheck('admin'), analyticsController.getOverviewAnalytics);
router.get('/events', auth, roleCheck('admin'), analyticsController.getAllEventAnalytics);
router.get('/events/:id', auth, roleCheck('admin'), analyticsController.getEventDetailedAnalytics);
router.get('/advanced', auth, roleCheck('admin'), analyticsController.getAdvancedAnalytics);

module.exports = router;
