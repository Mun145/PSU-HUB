// models/SurveyQuestion.js
const { DataTypes } = require('sequelize');
const sequelize     = require('../config/db');

const SurveyQuestion = sequelize.define(
  'SurveyQuestion',
  {
    id       : { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    surveyId : { type: DataTypes.INTEGER, allowNull: false },
    question : { type: DataTypes.TEXT,    allowNull: false },
    qType    : { type: DataTypes.ENUM('short', 'mcq', 'checkbox', 'rating'), allowNull: false },
    options  : { type: DataTypes.JSON }        // only for mcq / checkbox
  },
  {
    tableName : 'SurveyQuestions',
    timestamps: false                          // ← NO createdAt / updatedAt columns
  }
);

module.exports = SurveyQuestion;
