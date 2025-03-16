// psu-hub-backend/controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User, Role } = require('../models');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation errors', 400, 'VALIDATION_ERROR');
    }

    // The frontend sends: name, email, password, role
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User already exists', 400, 'USER_EXISTS');
    }

    // "foundRole" references the DB record; "role" is the string from the request
    let foundRole = null;
    if (role) {
      foundRole = await Role.findOne({ where: { name: role } });
      if (!foundRole) {
        throw new AppError(`Invalid role name: ${role}`, 400, 'INVALID_ROLE');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role_id: foundRole ? foundRole.id : null
    });

    return sendSuccess(
      res,
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        // Return the chosen role's name or null
        role: foundRole ? foundRole.name : null
      },
      'User registered successfully'
    );
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role }]
    });
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 400, 'INVALID_CREDENTIALS');
    }

    const userRole = user.Role ? user.Role.name : null;
    const token = jwt.sign(
      { id: user.id, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: userRole
        }
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, { include: [{ model: Role }] });
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return sendSuccess(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role ? user.Role.name : null,
        bio: user.bio,
        profilePicture: user.profilePicture,
        contact: user.contact,
        createdAt: user.createdAt
      },
      'Profile fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Normal updateProfile if your route calls PUT /users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, bio, profilePicture, contact } = req.body;
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    user.name = name || user.name;
    user.bio = bio !== undefined ? bio : user.bio;
    user.profilePicture = profilePicture !== undefined ? profilePicture : user.profilePicture;
    user.contact = contact !== undefined ? contact : user.contact;
    await user.save();

    return sendSuccess(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // or user.Role?.name if you want the role name
        bio: user.bio,
        profilePicture: user.profilePicture,
        contact: user.contact
      },
      'Profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

// For PUT /users/profile-with-image (file upload w/ Multer)
exports.updateProfileWithImage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // If form data includes text fields
    const { name, bio, contact } = req.body;

    // If a file was uploaded
    let imagePath = user.profilePicture;
    if (req.file) {
      // e.g. "/uploads/profiles/somefile.jpg"
      imagePath = `/uploads/profiles/${req.file.filename}`;
    }

    // Update user
    user.name = name || user.name;
    user.bio = bio !== undefined ? bio : user.bio;
    user.contact = contact !== undefined ? contact : user.contact;
    user.profilePicture = imagePath;

    await user.save();
    return sendSuccess(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        contact: user.contact,
        profilePicture: user.profilePicture
      },
      'Profile updated successfully (with image)'
    );
  } catch (error) {
    next(error);
  }
};
