// psu-hub-backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../services/upload');

/* ================== Faculty-Specific GET (with isRegistered) ================== */
router.get(
  '/faculty',
  auth,
  roleCheck('faculty'),
  eventController.getAllEventsForFaculty
);

/* ================== Faculty Registration Endpoints ================== */
router.post('/:id/register', auth, roleCheck('faculty'), eventController.registerForEvent);
router.delete('/:id/unregister', auth, roleCheck('faculty'), eventController.unregisterFromEvent);

/* ================== Admin Endpoints ================== */
router.post('/create', auth, roleCheck('admin'), eventController.createEvent);
router.post('/create-with-image', auth, roleCheck('admin'), upload.single('image'), eventController.createEventWithImage);
router.patch('/approve/:id', auth, roleCheck('psu_admin'), eventController.approveEvent);
router.patch('/reject/:id', auth, roleCheck('psu_admin'), eventController.rejectEvent);
router.patch('/publish/:id', auth, roleCheck('admin'), eventController.publishEvent);
router.put('/:id', auth, roleCheck('admin'), eventController.updateEvent);
router.delete('/:id', auth, roleCheck('admin'), eventController.deleteEvent);

/* ================== Public / Shared Endpoints ================== */
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

module.exports = router;
