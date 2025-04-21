//psu-hub-backend/controllers/adminDashboardController.js
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess } = require('../utils/responseHelper');

// GET /admin/recent-activity
exports.getRecentActivity = async (req, res, next) => {
  try {
    // Fetch the latest 10 activity entries of type 'activity'
    const activities = await ActivityLog.findAll({
      where: { type: 'activity' },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    return sendSuccess(res, activities, 'Recent activity fetched');
  } catch (error) {
    next(error);
  }
};

// GET /admin/daily-tasks
exports.getDailyTasks = async (req, res, next) => {
  try {
    // Fetch tasks (type 'task')
    const tasks = await ActivityLog.findAll({
      where: { type: 'task' },
      order: [['createdAt', 'DESC']],
    });
    return sendSuccess(res, tasks, 'Daily tasks fetched');
  } catch (error) {
    next(error);
  }
};

// GET /admin/announcements
exports.getAnnouncements = async (req, res, next) => {
  try {
    // Fetch announcements (type 'announcement')
    const announcements = await ActivityLog.findAll({
      where: { type: 'announcement' },
      order: [['createdAt', 'DESC']],
    });
    return sendSuccess(res, announcements, 'Announcements fetched');
  } catch (error) {
    next(error);
  }
};
