// models/Survey.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
module.exports = sequelize.define('Survey', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  eventId:   { type: DataTypes.INTEGER, allowNull: false },
  title:     { type: DataTypes.STRING, allowNull: false }
});
