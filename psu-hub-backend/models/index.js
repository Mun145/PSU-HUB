// models/index.js

const sequelize = require('../config/db');
const User = require('./User');
const Role = require('./Role');
const Event = require('./Event');
const Attendance = require('./Attendance');
const Registration = require('./Registration');
const ActivityLog = require('./ActivityLog');
const Survey        = require('./Survey');
const SurveyQuestion= require('./SurveyQuestion');
const SurveyResponse= require('./SurveyResponse');
const Certificate    = require('./Certificate');

// Role associations
Role.hasMany(User, {
  foreignKey: 'role_id',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
User.belongsTo(Role, {
  foreignKey: 'role_id'
});

// Attendance associations
User.hasMany(Attendance, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Attendance.belongsTo(User, {
  foreignKey: 'user_id'
});

Event.hasMany(Attendance, {
  foreignKey: 'event_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Attendance.belongsTo(Event, {
  foreignKey: 'event_id'
});

// Registration associations
User.hasMany(Registration, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Registration.belongsTo(User, {
  foreignKey: 'userId'
});

Event.hasMany(Registration, {
  foreignKey: 'eventId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Registration.belongsTo(Event, {
  foreignKey: 'eventId'
});

// ── Survey & Certificate relations ────────────────────────────────
Event.hasOne( Survey,          { foreignKey: 'eventId', onDelete: 'CASCADE' });
Survey.belongsTo( Event,       { foreignKey: 'eventId' });

Survey.hasMany(  SurveyQuestion, { as: 'questions',  foreignKey: 'surveyId', onDelete: 'CASCADE' });
SurveyQuestion.belongsTo( Survey, { foreignKey: 'surveyId' });

Survey.hasMany(  SurveyResponse, { foreignKey: 'surveyId', onDelete: 'CASCADE' });
SurveyResponse.belongsTo( Survey, { foreignKey: 'surveyId' });

User.hasMany(    SurveyResponse, { foreignKey: 'userId',   onDelete: 'CASCADE' });
SurveyResponse.belongsTo( User,   { foreignKey: 'userId' });

/*  NEW: certificate table  */
User.hasMany(    Certificate,    { foreignKey: 'userId',  onDelete: 'CASCADE' });
Certificate.belongsTo( User,      { foreignKey: 'userId' });

Event.hasMany(   Certificate,    { foreignKey: 'eventId', onDelete: 'CASCADE' });
Certificate.belongsTo( Event,     { foreignKey: 'eventId' });

Attendance.hasOne(Certificate, {
    foreignKey : 'userId',          
    sourceKey  : 'user_id',
    as         : 'Certificate',     
    constraints: false              
  });
  Certificate.belongsTo(Attendance, {
    foreignKey : 'userId',
    targetKey  : 'user_id',
    constraints: false
  });
  

module.exports = {
  sequelize,
  User,
  Role,
  Event,
  Attendance,
  Registration,
  ActivityLog,
  Survey,
  SurveyQuestion,
  SurveyResponse,
  Certificate
};
