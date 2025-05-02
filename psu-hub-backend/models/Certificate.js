// psu-hub-backend/models/Certificate.js
const { DataTypes } = require('sequelize');
const sequelize     = require('../config/db');

const Certificate = sequelize.define(
  'Certificate',
  {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId:    { type: DataTypes.INTEGER, allowNull: false },
    eventId:   { type: DataTypes.INTEGER, allowNull: false },
    fileUrl:   { type: DataTypes.STRING },
    issuedAt:  { type: DataTypes.DATE,    defaultValue: DataTypes.NOW }
  },
  { timestamps: false }
);

module.exports = Certificate;
