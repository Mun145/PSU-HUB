// psu-hub-backend/controllers/eventController.js
const { Event, Registration } = require('../models'); // Ensure Registration model exists
const QRCode = require('qrcode');
const logger = require('../services/logger');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location } = req.body;
    const newEvent = await Event.create({ title, description, date, location });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const qrData = `${baseUrl}/api/attendance/scan?eventId=${newEvent.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    newEvent.qr_code = qrCodeDataUrl;
    await newEvent.save();
    logger.info('Event created', { eventId: newEvent.id, user: req.user.id });
    return sendSuccess(res, newEvent, 'Event created successfully');
  } catch (error) {
    next(error);
  }
};

exports.createEventWithImage = async (req, res, next) => {
  try {
    const { title, description, date, location } = req.body;

    // If Multer uploaded a file, it's available in req.file
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Create the event in the DB
    const newEvent = await Event.create({
      title,
      description,
      date,
      location,
      imageUrl: imagePath
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const qrData = `${baseUrl}/api/attendance/scan?eventId=${newEvent.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    newEvent.qr_code = qrCodeDataUrl;
    await newEvent.save();

    logger.info('Event created with image', { eventId: newEvent.id, user: req.user.id });
    return sendSuccess(res, newEvent, 'Event created successfully (with image)');
  } catch (error) {
    logger.error('Error creating event with image', { error: error.message });
    next(error);
  }
};

exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll();
    return sendSuccess(res, events, 'Events fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    event.status = 'approved';
    await event.save();
    return sendSuccess(res, event, 'Event approved');
  } catch (error) {
    next(error);
  }
};

exports.rejectEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    event.status = 'rejected';
    await event.save();
    return sendSuccess(res, event, 'Event rejected');
  } catch (error) {
    next(error);
  }
};

exports.publishEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    if (event.status !== 'approved') {
      throw new AppError('Only approved events can be published', 400, 'INVALID_EVENT_STATUS');
    }
    event.status = 'published';
    await event.save();
    return sendSuccess(res, event, 'Event published');
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, date, location } = req.body;
    const event = await Event.findByPk(id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;
    await event.save();
    return sendSuccess(res, event, 'Event updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    await event.destroy();
    return sendSuccess(res, null, 'Event deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    return sendSuccess(res, event, 'Event fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Registration endpoints for faculty
exports.registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    // Create a new registration record (ensure Registration model exists)
    const registration = await Registration.create({ eventId, userId });
    return sendSuccess(res, registration, 'Registered successfully');
  } catch (error) {
    next(error);
  }
};

exports.unregisterFromEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    await Registration.destroy({ where: { eventId, userId } });
    return sendSuccess(res, null, 'Unregistered successfully');
  } catch (error) {
    next(error);
  }
};
