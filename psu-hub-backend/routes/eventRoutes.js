// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../services/upload');

router.post('/create', auth, roleCheck('admin'), eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.patch('/approve/:id', auth, roleCheck('psu_admin'), eventController.approveEvent);
router.patch('/reject/:id', auth, roleCheck('psu_admin'), eventController.rejectEvent);
router.patch('/publish/:id', auth, roleCheck('admin'), eventController.publishEvent);
router.put('/:id', auth, roleCheck('admin'), eventController.updateEvent);
router.delete('/:id', auth, roleCheck('admin'), eventController.deleteEvent);
router.get('/:id', eventController.getEventById);
router.post(
    '/create-with-image',
    auth,
    roleCheck('admin'), 
    upload.single('image'),  
    eventController.createEventWithImage
  );
router.post('/events/:id/register', auth, roleCheck('faculty'), eventController.registerForEvent);
router.delete('/events/:id/unregister', auth, roleCheck('faculty'), eventController.unregisterFromEvent);


module.exports = router;
