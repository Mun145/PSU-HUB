const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // JWT authentication middleware
const Attendance = require('../models/Attendance');
const Event = require('../models/Event'); // Used to validate event existence

// Mark Attendance (Protected Route)
// This route automatically uses req.user.id (from the token) so users cannot mark attendance for others.
router.post('/mark', auth, async (req, res) => {
  try {
    const { event_id, scan_time } = req.body;
    // Set user_id from authenticated user's token
    const user_id = req.user.id;

    // 1) Validate that the event exists
    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 2) Check if the user has already marked attendance for this event
    const existingAttendance = await Attendance.findOne({ where: { user_id, event_id } });
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this event' });
    }

    // 3) Create the attendance record
    const newAttendance = await Attendance.create({ user_id, event_id, scan_time });
    return res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: newAttendance
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
});

// (Optional) Get All Attendance Records (Protected)
router.get('/', auth, async (req, res) => {
  try {
    const records = await Attendance.findAll({
      include: [
        { model: require('../models/User') },
        { model: require('../models/Event') }
      ]
    });
    return res.json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return res.status(500).json({ message: 'Error fetching attendance records', error: error.message });
  }
});

module.exports = router;
