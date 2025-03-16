// psu-hub-backend/controllers/analyticsController.js
const { Event, Attendance, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');

exports.getOverviewAnalytics = async (req, res, next) => {
  try {
    const totalEvents = await Event.count();
    const totalAttendances = await Attendance.count();
    const totalUsers = await User.count();
    const approvedEvents = await Event.count({ where: { status: 'approved' } });

    return sendSuccess(
      res,
      {
        totalEvents,
        approvedEvents,
        totalAttendance: totalAttendances,
        totalUsers
      },
      'Overview analytics fetched'
    );
  } catch (error) {
    next(error);
  }
};

exports.getAllEventAnalytics = async (req, res, next) => {
  try {
    // For MySQL, use backticks and column references carefully:
    const events = await Event.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM `Attendances` AS `Attendance` WHERE `Attendance`.`event_id` = `Event`.`id`)'
            ),
            'attendeeCount'
          ]
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    return sendSuccess(res, events, 'Event analytics fetched');
  } catch (error) {
    next(error);
  }
};

exports.getEventDetailedAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id, {
      include: [
        {
          model: Attendance,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    return sendSuccess(res, event, 'Detailed event analytics fetched');
  } catch (error) {
    next(error);
  }
};

// NEW: getAdvancedAnalytics
exports.getAdvancedAnalytics = async (req, res, next) => {
  try {
    // Example: top 5 events by attendance
    const topEvents = await Event.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM `Attendances` AS `A` WHERE `A`.`event_id` = `Event`.`id`)'
            ),
            'attendanceCount'
          ]
        ]
      },
      order: [[sequelize.literal('attendanceCount'), 'DESC']],
      limit: 5
    });

    // Optional: date range attendance
    const { startDate, endDate } = req.query;
    let rangeCondition = {};
    if (startDate && endDate) {
      rangeCondition = {
        scan_time: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }
    const totalRangeAttendance = await Attendance.count({ where: rangeCondition });

    return sendSuccess(res, { topEvents, totalRangeAttendance }, 'Advanced analytics fetched');
  } catch (error) {
    next(error);
  }
};
