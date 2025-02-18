// psu-hub-backend/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const logger = require('../utils/logger');

// Get aggregated analytics (Accessible only to Admins)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    logger.warn('Unauthorized analytics access attempt', { user: req.user.id });
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  try {
    const totalEvents = await Event.count();
    const approvedEvents = await Event.count({ where: { status: 'approved' } });
    const totalAttendance = await Attendance.count();
    const totalUsers = await User.count();
    
    const analyticsData = {
      totalEvents,
      approvedEvents,
      totalAttendance,
      totalUsers
    };
    
    logger.info('Analytics data fetched', analyticsData);
    res.json(analyticsData);
  } catch (error) {
    logger.error('Error fetching analytics', { error: error.message });
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

module.exports = router;
