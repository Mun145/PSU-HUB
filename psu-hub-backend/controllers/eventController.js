// psu-hub-backend/controllers/eventController.js
const { Event, Registration } = require('../models');
const ActivityLog = require('../models/ActivityLog');  // Import for logging
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const logger = require('../services/logger');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');

// Helper: Generate and save QR code as PNG file
const generateAndSaveQRCode = async (req, eventId) => {
  const qrDirectory = path.join(__dirname, '../uploads/qrcodes');
  if (!fs.existsSync(qrDirectory)) {
    fs.mkdirSync(qrDirectory, { recursive: true });
  }
  const fileName = `qr_${eventId}_${Date.now()}.png`;
  const filePath = path.join(qrDirectory, fileName);
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  // The QR code points to a dedicated scan page (front-end route)
  const qrData = `${baseUrl}/scan-attendance?eventId=${eventId}`;
  await QRCode.toFile(filePath, qrData, {
    type: 'png',
    errorCorrectionLevel: 'H',
    width: 300
  });
  return `/uploads/qrcodes/${fileName}`;
};

// Create event (admin)
exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      academicYear,
      participationCategory,
      startDate,
      endDate,
      totalHours
    } = req.body;

    const newEvent = await Event.create({
      title,
      description,
      location,
      academicYear,
      participationCategory,
      startDate,
      endDate,
      totalHours
    });

    const qrFilePath = await generateAndSaveQRCode(req, newEvent.id);
    newEvent.qr_code = qrFilePath;
    await newEvent.save();

    logger.info('Event created', { eventId: newEvent.id, user: req.user.id });
    return sendSuccess(res, newEvent, 'Event created successfully');
  } catch (error) {
    next(error);
  }
};

// Create event with image (admin)
exports.createEventWithImage = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      academicYear,
      participationCategory,
      startDate,
      endDate,
      totalHours
    } = req.body;

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const newEvent = await Event.create({
      title,
      description,
      location,
      academicYear,
      participationCategory,
      startDate,
      endDate,
      totalHours,
      imageUrl: imagePath
    });

    const qrFilePath = await generateAndSaveQRCode(req, newEvent.id);
    newEvent.qr_code = qrFilePath;
    await newEvent.save();

    logger.info('Event created with image', { eventId: newEvent.id, user: req.user.id });
    return sendSuccess(res, newEvent, 'Event created successfully (with image)');
  } catch (error) {
    logger.error('Error creating event with image', { error: error.message });
    next(error);
  }
};

// Get all events (public)
exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll();
    return sendSuccess(res, events, 'Events fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Get event by ID (public)
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

// Get all published events for faculty (with registration status)
exports.getAllEventsForFaculty = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const publishedEvents = await Event.findAll({
      where: { status: 'published' },
      include: [{
        model: Registration,
        required: false,
        where: { userId }
      }]
    });

    const mapped = publishedEvents.map(ev => {
      const isRegistered = ev.Registrations && ev.Registrations.length > 0;
      return { ...ev.get({ plain: true }), isRegistered };
    });

    return sendSuccess(res, mapped, 'Faculty events fetched');
  } catch (error) {
    next(error);
  }
};

// Approve event (psu_admin)
exports.approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    event.status = 'approved';
    await event.save();

    // Log the approval action
    await ActivityLog.create({
      type: 'activity',
      message: `Event "${event.title}" was approved and is ready for publishing.`,
      referenceId: event.id,
      targetRoles: 'admin'
    });

    return sendSuccess(res, event, 'Event approved');
  } catch (error) {
    next(error);
  }
};

// Reject event (psu_admin)
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

// Publish event (admin)
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

    // Log the publish action
    await ActivityLog.create({
      type: 'activity',
      message: `Event "${event.title}" was published.`,
      referenceId: event.id,
      targetRoles: 'admin'
    });

    return sendSuccess(res, event, 'Event published');
  } catch (error) {
    next(error);
  }
};

// Update event (admin)
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      academicYear,
      participationCategory,
      startDate,
      endDate,
      totalHours
    } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.location = location || event.location;
    event.academicYear = academicYear || event.academicYear;
    event.participationCategory = participationCategory || event.participationCategory;
    event.startDate = startDate || event.startDate;
    event.endDate = endDate || event.endDate;
    event.totalHours = totalHours || event.totalHours;

    await event.save();
    return sendSuccess(res, event, 'Event updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete event (admin)
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

// Faculty Registration: Register for event
exports.registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }
    if (event.status !== 'published') {
      throw new AppError('You can only register for published events', 400, 'INVALID_EVENT_STATUS');
    }

    const existingRegistration = await Registration.findOne({ where: { eventId, userId } });
    if (existingRegistration) {
      throw new AppError('You have already registered for this event', 400, 'DUPLICATE_REGISTRATION');
    }

    const registration = await Registration.create({ eventId, userId });
    return sendSuccess(res, registration, 'Registered successfully');
  } catch (error) {
    next(error);
  }
};

// Faculty Registration: Unregister for event
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
