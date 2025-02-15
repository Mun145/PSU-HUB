// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Create Event (Protected Route, Admin Only)
router.post('/create', auth, async (req, res) => {
  try {
    // Role-based check: Only admins are allowed to create events
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    
    const { title, description, date, location, qr_code } = req.body;
    const newEvent = await Event.create({ title, description, date, location, qr_code });
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Get All Events (Public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

module.exports = router;
