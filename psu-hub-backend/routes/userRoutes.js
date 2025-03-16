const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const uploadProfile = require('../services/profileUpload');

// Registration with validation
router.post(
  '/register',
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  userController.register
);

//profile image
router.put(
  '/profile-with-image',
  auth,
  uploadProfile.single('profileImage'), // field name in the form
  userController.updateProfileWithImage
);

// Login
router.post('/login', userController.login);

// Profile routes (protected with auth middleware)
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

module.exports = router;
