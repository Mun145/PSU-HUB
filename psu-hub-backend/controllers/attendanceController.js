/* controllers/attendanceController.js */
const {
  Attendance, Event, Registration, Certificate, SurveyResponse, User
} = require('../models');
const AppError          = require('../utils/AppError');
const { sendSuccess }   = require('../utils/responseHelper');
const certificateSvc    = require('../services/certificateService');

/* ───────────────────────── markAttendance ───────────────────────── */
exports.markAttendance = async (req, res, next) => {
  try {
    const { event_id, scan_time } = req.body;
    const user_id = req.user.id;

    const event = await Event.findByPk(event_id);
    if (!event) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');

    if (await Attendance.findOne({ where: { user_id, event_id } }))
      throw new AppError('Attendance already marked', 400, 'DUPLICATE_ATTENDANCE');

    await Attendance.create({ user_id, event_id, scan_time });

    await Registration.update(
      { attended: true },
      { where: { userId: user_id, eventId: event_id } }
    );

    /* certificate (if enabled) */
    await certificateSvc.issueCertificateIfNeeded(event, user_id);

    const fresh = await fetchEventSnapshot(event_id);
    return sendSuccess(res, fresh, 'Attendance marked');
  } catch (err) { next(err); }
};

/* ──────────────────────────── READ API ─────────────────────────── */
exports.getAllAttendance = async (_req, res, next) => {
  try {
    const rows = await Attendance.findAll({ include: ['User', 'Event'] });
    return sendSuccess(res, rows, 'Attendance records fetched');
  } catch (err) { next(err); }
};

exports.getUserAttendance = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    /* pull attendance rows */
    const rows = await Attendance.findAll({
      where   : { user_id },
      include : ['Event']
    });

    /* preload survey + certificate tables once instead of N queries */
    const [surveyRows, certRows] = await Promise.all([
      SurveyResponse.findAll({ where: { userId: user_id } }),
      Certificate.findAll({     where: { userId: user_id } })
    ]);

    const surveyMap = new Set(surveyRows.map(r => r.surveyId));
    const certMap   = new Map(certRows.map(c => [`${c.eventId}`, c.fileUrl]));

    const output = rows.map(r => ({
      id: r.id,
      attended: true,
      surveyCompleted: surveyMap.has(r.event_id),
      certificateUrl : certMap.get(String(r.event_id)) || null,
      Event: r.Event
    }));

    return sendSuccess(res, output, 'User attendance records fetched');
  } catch (err) { next(err); }
};

exports.getEventAttendance = async (req, res, next) => {
  try {
    const rows = await Attendance.findAll({
      where   : { event_id: req.params.id },
      include : ['User']               // certificates now fetched separately
    });
    return sendSuccess(res, rows, 'Event attendance records fetched');
  } catch (err) { next(err); }
};

exports.deleteAttendance = async (req, res, next) => {
  try {
    const row = await Attendance.findByPk(req.params.id);
    if (!row) throw new AppError('Attendance record not found', 404, 'ATTENDANCE_NOT_FOUND');

    await row.destroy();
    await Registration.update(
      { attended: false },
      { where: { userId: row.user_id, eventId: row.event_id } }
    );

    const fresh = await fetchEventSnapshot(row.event_id);
    return sendSuccess(res, fresh, 'Attendance reverted');
  } catch (err) { next(err); }
};

/* ───────────────────── helper: mini event snapshot ─────────────── */
async function fetchEventSnapshot (eventId) {
  return Event.findByPk(eventId, {
    include: [
      { model: Registration, include: [{ model: User, attributes: ['id','name','email'] }] },
      { model: Attendance,   include: [{ model: User, attributes: ['id','name','email'] }] }
    ]
  });
}
