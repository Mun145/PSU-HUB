// psu-hub-backend/models/Registration.js
const { DataTypes } = require('sequelize');
const sequelize     = require('../config/db');

const Registration = sequelize.define('Registration', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  eventId:   { type: DataTypes.INTEGER, allowNull: false },
  userId:    { type: DataTypes.INTEGER, allowNull: false },
  attended:  { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['eventId', 'userId']   
    }
  ]
});

module.exports = Registration;
