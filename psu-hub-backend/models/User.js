// psu-hub-backend/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role_id: { type: DataTypes.INTEGER, allowNull: true },
  bio: { type: DataTypes.TEXT },
  profilePicture: { type: DataTypes.STRING },
  contact: { type: DataTypes.STRING }
}, {
  timestamps: true
});

module.exports = User;
