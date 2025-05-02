// psu-hub-backend/controllers/analyticsController.js
const { Event, Registration, Attendance, User, Certificate, sequelize } = require('../models');
const { Op }         = require('sequelize');
const AppError       = require('../utils/AppError');
const { sendSuccess }= require('../utils/responseHelper');

/* ───────────────────────── OVERVIEW ───────────────────────── */
exports.getOverviewAnalytics = async (req, res, next) => {
  try {
    const [ totalEvents, totalAttendances, totalUsers, approvedEvents ] = await Promise.all([
      Event.count(),
      Attendance.count(),
      User.count(),
      Event.count({ where: { status: 'approved' } })
    ]);

    return sendSuccess(
      res,
      { totalEvents, approvedEvents, totalAttendance: totalAttendances, totalUsers },
      'Overview analytics fetched'
    );
  } catch (err) { next(err); }
};

/* ──────────────────────── PER-EVENT LIST ───────────────────── */
exports.getAllEventAnalytics = async (req, res, next) => {
  try {
    const events = await Event.findAll({
      attributes : {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM `Attendances` AS A WHERE A.event_id = Event.id)'
            ),
            'attendeeCount'
          ]
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    return sendSuccess(res, events, 'Event analytics fetched');
  } catch (err) { next(err); }
};

/* ────────────────── SINGLE EVENT – FULL DETAILS ────────────── */
exports.getEventDetailedAnalytics = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        /* all sign-ups */
        {
          model   : Registration,
          include : [{ model: User, attributes: ['id','name','email'] }]
        },
        /* attended list (+ certificate, if any) */
        {
          model   : Attendance,
          include : [
            { model: User,        attributes: ['id','name','email'] },
            { model: Certificate, as: 'Certificate', attributes: ['fileUrl'] }   
          ]
        }
      ]
    });

    if (!event) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');

    return sendSuccess(res, event, 'Detailed event analytics fetched');
  } catch (err) { next(err); }
};

/* ────────────────────── ADVANCED ANALYTICS ─────────────────── */
exports.getAdvancedAnalytics = async (req, res, next) => {
  try {
    /* top N events by attendance */
    const topEvents = await Event.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM `Attendances` AS A WHERE A.event_id = Event.id)'
            ),
            'attendanceCount'
          ]
        ]
      },
      order : [[sequelize.literal('attendanceCount'), 'DESC']],
      limit : 5
    });

    /* range-filtered attendance count */
    const { startDate, endDate } = req.query;
    const whereScan = startDate && endDate
      ? { scan_time: { [Op.between]: [new Date(startDate), new Date(endDate)] } }
      : {};

    const totalRangeAttendance = await Attendance.count({ where: whereScan });

    return sendSuccess(
      res,
      { topEvents, totalRangeAttendance },
      'Advanced analytics fetched'
    );
  } catch (err) { next(err); }
};
