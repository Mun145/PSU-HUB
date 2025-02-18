// psu-hub-backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const QRCode = require('qrcode');
const sendEmail = require('../utils/mailer');
const logger = require('../utils/logger');

// Create Event (Protected, Admin Only) with automatic QR code generation
router.post('/create', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      logger.warn('Unauthorized event creation attempt', { user: req.user.id });
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    const { title, description, date, location } = req.body;
    const newEvent = await Event.create({ title, description, date, location });
    // Generate a QR code URL that embeds the eventId (for attendance marking)
    const qrData = `http://localhost:3001/api/attendance/scan?eventId=${newEvent.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    newEvent.qr_code = qrCodeDataUrl;
    await newEvent.save();
    logger.info('Event created successfully', { eventId: newEvent.id, user: req.user.id });
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    logger.error('Error creating event', { error: error.message });
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Get All Events (Public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    logger.error('Error fetching events', { error: error.message });
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Approve an event (PSU_Admin only)
router.patch('/approve/:id', auth, async (req, res) => {
  if (req.user.role !== 'psu_admin') {
    logger.warn('Unauthorized event approval attempt', { user: req.user.id });
    return res.status(403).json({ message: 'Forbidden: Board Members only' });
  }
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);
    if (!event) {
      logger.warn('Event not found for approval', { eventId });
      return res.status(404).json({ message: 'Event not found' });
    }
    event.status = 'approved';
    await event.save();
    logger.info('Event approved successfully', { eventId });
    res.json({ message: 'Event approved successfully', event });
  } catch (error) {
    logger.error('Error approving event', { error: error.message });
    res.status(500).json({ message: 'Error approving event', error: error.message });
  }
});

// Reject an event (PSU_Admin only)
router.patch('/reject/:id', auth, async (req, res) => {
  if (req.user.role !== 'psu_admin') {
    logger.warn('Unauthorized event rejection attempt', { user: req.user.id });
    return res.status(403).json({ message: 'Forbidden: Board Members only' });
  }
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);
    if (!event) {
      logger.warn('Event not found for rejection', { eventId });
      return res.status(404).json({ message: 'Event not found' });
    }
    event.status = 'rejected';
    await event.save();
    logger.info('Event rejected successfully', { eventId });
    res.json({ message: 'Event rejected successfully', event });
  } catch (error) {
    logger.error('Error rejecting event', { error: error.message });
    res.status(500).json({ message: 'Error rejecting event', error: error.message });
  }
});

// Publish an event (Admin only)
// Only approved events can be published.
router.patch('/publish/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    logger.warn('Unauthorized event publish attempt', { user: req.user.id });
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);
    if (!event) {
      logger.warn('Event not found for publishing', { eventId });
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.status !== 'approved') {
      logger.warn('Attempted to publish event that is not approved', { eventId, status: event.status });
      return res.status(400).json({ message: 'Only approved events can be published' });
    }
    event.status = 'published';
    await event.save();
    
    // Send email notification upon publication
    await sendEmail(
      'recipient@example.com', // Replace with actual recipient or dynamic logic
      'Event Published',
      `The event "${event.title}" has been published.`,
      `<p>The event "<strong>${event.title}</strong>" has been published on PSU Hub.</p>`
    );
    
    logger.info('Event published successfully', { eventId });
    res.json({ message: 'Event published successfully', event });
  } catch (error) {
    logger.error('Error publishing event', { error: error.message });
    res.status(500).json({ message: 'Error publishing event', error: error.message });
  }
});

module.exports = router;
