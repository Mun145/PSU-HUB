// psu-hub-backend/controllers/attendanceController.js

const { Attendance, Event } = require('../models');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');


exports.markAttendance = async (req, res, next) => {
  try {
    const { event_id, scan_time } = req.body;
    const user_id = req.user.id;


    const event = await Event.findByPk(event_id);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }


    const existing = await Attendance.findOne({ where: { user_id, event_id } });
    if (existing) {
      throw new AppError('Attendance already marked', 400, 'DUPLICATE_ATTENDANCE');
    }


    const newAttendance = await Attendance.create({ user_id, event_id, scan_time });
    return sendSuccess(res, newAttendance, 'Attendance marked');
  } catch (error) {
    next(error);
  }
};


exports.getAllAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.findAll({ include: ['User', 'Event'] });
    return sendSuccess(res, records, 'Attendance records fetched');
  } catch (error) {
    next(error);
  }
};


exports.getUserAttendance = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const records = await Attendance.findAll({
      where: { user_id },
      include: ['Event']
    });
    return sendSuccess(res, records, 'User attendance records fetched');
  } catch (error) {
    next(error);
  }
};
