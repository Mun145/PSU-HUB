// models/SurveyResponse.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('SurveyResponse', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  surveyId: { type: DataTypes.INTEGER, allowNull: false },
  userId:   { type: DataTypes.INTEGER, allowNull: false },

  /* Array of { questionId, answer } */
  answers:  { type: DataTypes.JSON, allowNull: false }
});
