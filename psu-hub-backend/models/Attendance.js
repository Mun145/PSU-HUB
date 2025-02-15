// models/Attendance.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // The same sequelize instance from db.js

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  scan_time: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Attendance;
