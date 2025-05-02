/* controllers/eventController.js */

const {
  Event,
  Registration,
  Attendance,
  Certificate,
  User
} = require('../models');

const ActivityLog  = require('../models/ActivityLog');
const QRCode       = require('qrcode');
const fs           = require('fs');
const path         = require('path');
const logger       = require('../services/logger');
const AppError     = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');

/* helper ────────────────────────────────────────────────────────── */
const bool = (v) => v === true || v === 'true' || v === 1 || v === '1';

/* generate PNG QR code & return public URL */
const generateAndSaveQRCode = async (req, eventId) => {
  const dir = path.join(__dirname, '../uploads/qrcodes');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const file     = `qr_${eventId}_${Date.now()}.png`;
  const filePath = path.join(dir, file);

  const front = process.env.FRONTEND_BASE_URL
            || process.env.DEV_ORIGIN
            || `${req.protocol}://${req.get('host').replace(':3001', ':3000')}`;

  await QRCode.toFile(
    filePath,
    `${front}/attendance-login?eventId=${eventId}`,
    { type: 'png', errorCorrectionLevel: 'H', width: 300 }
  );

  return `${req.protocol}://${req.get('host')}/uploads/qrcodes/${file}`;
};

/* ─────────────────────────── CREATE ───────────────────────────── */
exports.createEvent = async (req, res, next) => {
  try {
    const {
      title, description, location,
      academicYear, participationCategory,
      startDate, endDate, totalHours,
      hasCertificate = false
    } = req.body;

    const ev = await Event.create({
      title, description, location,
      academicYear, participationCategory,
      startDate, endDate, totalHours,
      hasCertificate: bool(hasCertificate)
    });

    ev.qr_code = await generateAndSaveQRCode(req, ev.id);
    await ev.save();

    logger.info('Event created', { eventId: ev.id, user: req.user.id });
    return sendSuccess(res, ev, 'Event created successfully');
  } catch (err) { next(err); }
};

exports.createEventWithImage = async (req, res, next) => {
  try {
    const {
      title, description, location,
      academicYear, participationCategory,
      startDate, endDate, totalHours,
      hasCertificate = false
    } = req.body;

    const ev = await Event.create({
      title, description, location,
      academicYear, participationCategory,
      startDate, endDate, totalHours,
      hasCertificate: bool(hasCertificate),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    ev.qr_code = await generateAndSaveQRCode(req, ev.id);
    await ev.save();

    logger.info('Event created with image', { eventId: ev.id, user: req.user.id });
    return sendSuccess(res, ev, 'Event created successfully (with image)');
  } catch (err) {
    logger.error('Error creating event with image', { error: err.message });
    next(err);
  }
};

/* ─────────────────────────── READ ─────────────────────────────── */
exports.getAllEvents          = async (_req, res, next) => {
  try { return sendSuccess(res, await Event.findAll(), 'Events fetched'); }
  catch (err) { next(err); }
};

exports.getEventById          = async (req, res, next) => {
  try {
    const ev = await Event.findByPk(req.params.id);
    if (!ev) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    return sendSuccess(res, ev, 'Event fetched');
  } catch (err) { next(err); }
};

/* extra endpoint used by Analytics details modal */
exports.getEventAttendance = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    const rows = await Attendance.findAll({
      where   : { event_id: eventId },
      include : [{ model: User, attributes: ['id','name','email'] }]
    });

    const certs = await Certificate.findAll({ where: { eventId } });
    const certMap = new Map(certs.map(c => [`${c.userId}`, c.fileUrl]));

    const withCert = rows.map(r => ({
      ...r.get({ plain: true }),
      certificateUrl: certMap.get(String(r.user_id)) || null
    }));

    return sendSuccess(res, withCert, 'Attendance list');
  } catch (err) { next(err); }
};

/* list for faculty with “isRegistered” flag */
exports.getAllEventsForFaculty = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const published = await Event.findAll({
      where   : { status: 'published' },
      include : [{ model: Registration, required: false, where: { userId } }]
    });

    const out = published.map(ev => ({
      ...ev.get({ plain: true }),
      isRegistered: !!(ev.Registrations && ev.Registrations.length)
    }));

    return sendSuccess(res, out, 'Faculty events fetched');
  } catch (err) { next(err); }
};

/* ─────────────────────── STATUS MUTATIONS ────────────────────── */
exports.approveEvent = async (req, res, next) => mutateStatus(req, res, next, 'approved', 'approved and is ready for publishing');
exports.rejectEvent  = async (req, res, next) => mutateStatus(req, res, next, 'rejected',  'was rejected');
exports.publishEvent = async (req, res, next) => {
  try {
    const ev = await Event.findByPk(req.params.id);
    if (!ev) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    if (ev.status !== 'approved')
      throw new AppError('Only approved events can be published', 400, 'INVALID_EVENT_STATUS');

    ev.status = 'published';
    await ev.save();
    await logActivity(ev, 'was published.');
    return sendSuccess(res, ev, 'Event published');
  } catch (err) { next(err); }
};

async function mutateStatus (req, res, next, status, message) {
  try {
    const ev = await Event.findByPk(req.params.id);
    if (!ev) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    ev.status = status;
    await ev.save();
    await logActivity(ev, message);
    return sendSuccess(res, ev, `Event ${status}`);
  } catch (err) { next(err); }
}

function logActivity (event, msg) {
  return ActivityLog.create({
    type        : 'activity',
    message     : `Event “${event.title}” ${msg}`,
    referenceId : event.id,
    targetRoles : 'admin'
  });
}

/* ─────────────────────────── UPDATE / DEL ─────────────────────── */
exports.updateEvent = async (req, res, next) => {
  try {
    const ev = await Event.findByPk(req.params.id);
    if (!ev) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');

    const {
      title, description, location,
      academicYear, participationCategory,
      startDate, endDate, totalHours,
      hasCertificate
    } = req.body;

    Object.assign(ev, {
      title: title ?? ev.title,
      description: description ?? ev.description,
      location: location ?? ev.location,
      academicYear: academicYear ?? ev.academicYear,
      participationCategory: participationCategory ?? ev.participationCategory,
      startDate: startDate ?? ev.startDate,
      endDate: endDate ?? ev.endDate,
      totalHours: totalHours ?? ev.totalHours,
      ...(hasCertificate !== undefined && { hasCertificate: bool(hasCertificate) })
    });

    await ev.save();
    return sendSuccess(res, ev, 'Event updated successfully');
  } catch (err) { next(err); }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const ev = await Event.findByPk(req.params.id);
    if (!ev) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    await ev.destroy();
    return sendSuccess(res, null, 'Event deleted');
  } catch (err) { next(err); }
};

/* ─────────────────────── REGISTRATION APIs ───────────────────── */
exports.registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId  = req.user.id;

    const ev = await Event.findByPk(eventId);
    if (!ev) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    if (ev.status !== 'published')
      throw new AppError('You can only register for published events', 400, 'INVALID_EVENT_STATUS');

    if (await Registration.findOne({ where: { eventId, userId } }))
      throw new AppError('Already registered', 400, 'DUPLICATE_REGISTRATION');

    const reg = await Registration.create({ eventId, userId });
    return sendSuccess(res, reg, 'Registered');
  } catch (err) { next(err); }
};

exports.unregisterFromEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId  = req.user.id;
    await Registration.destroy({ where: { eventId, userId } });
    return sendSuccess(res, null, 'Unregistered');
  } catch (err) { next(err); }
};
