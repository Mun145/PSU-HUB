// psu-hub-backend/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Get aggregated analytics (Accessible only to Admins)
router.get('/', auth, async (req, res) => {
  // Only admins should access analytics (adjust roles if needed)
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  try {
    // Count total events
    const totalEvents = await Event.count();
    // Count approved events
    const approvedEvents = await Event.count({ where: { status: 'approved' } });
    // Count total attendance records
    const totalAttendance = await Attendance.count();
    // Count total registered users
    const totalUsers = await User.count();
    
    res.json({
      totalEvents,
      approvedEvents,
      totalAttendance,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

module.exports = router;
