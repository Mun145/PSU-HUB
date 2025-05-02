const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const roleCheck  = require('../middleware/roleCheck');

const adminDashboard = require('../controllers/adminDashboardController');
const adminCtrl      = require('../controllers/adminController');
const certCtrl       = require('../controllers/certificateController');

/* ───────── dashboard widgets ───────── */
router.get('/recent-activity', auth, roleCheck('admin'), adminDashboard.getRecentActivity);
router.get('/daily-tasks',     auth, roleCheck('admin'), adminDashboard.getDailyTasks);
router.get('/announcements',   auth, roleCheck('admin'), adminDashboard.getAnnouncements);

/* ───────── attendance toggle ───────── */
router.patch( '/registrations/:id/mark-attended', auth, roleCheck('admin'), adminCtrl.markAsAttended );

/* ───────── certificates ───────── */
router.post( '/certificates/:eventId/reissue/:userId', auth, roleCheck('admin'), certCtrl.reIssue);
router.delete( '/certificates/:eventId/:userId', auth, roleCheck('admin'), certCtrl.revoke);

module.exports = router;
