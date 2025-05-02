// psu-hub-backend/controllers/adminController.js
const { Registration, Attendance } = require('../models');
const AppError   = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');

// PATCH /admin/registrations/:id/mark-attended
exports.markAsAttended = async (req, res, next) => {
  try {
    const regId     = req.params.id;
    const { attended } = req.body;

    const registration = await Registration.findByPk(regId);
    if (!registration) throw new AppError('Registration not found', 404, 'NOT_FOUND');

    registration.attended = attended;
    await registration.save();

    if (attended) {
      /* create Attendance row if missing */
      await Attendance.findOrCreate({
        where: { user_id: registration.userId, event_id: registration.eventId },
        defaults: { scan_time: new Date() }
      });
    } else {
      /* admin unticked → remove accidental Attendance row */
      await Attendance.destroy({
        where: { user_id: registration.userId, event_id: registration.eventId }
      });
    }

    /* ── RETURN the fresh event with both lists so the UI can just replace state ── */
    const { Event, User } = require('../models');
    const freshEvent = await Event.findByPk(registration.eventId, {
      include: [
        { model: Registration, include: [{ model: User, attributes: ['id', 'name', 'email'] }] },
        { model: Attendance,   include: [{ model: User, attributes: ['id', 'name', 'email'] }] }
      ]
    });

    return sendSuccess(res, freshEvent, 'Attendance updated');
  } catch (err) {
    next(err);
  }
};
