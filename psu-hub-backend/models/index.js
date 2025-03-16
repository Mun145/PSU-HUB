// models/index.js

const sequelize = require('../config/db');
const User = require('./User');
const Role = require('./Role');
const Event = require('./Event');
const Attendance = require('./Attendance');
const Registration = require('./Registration');

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

module.exports = {
  sequelize,
  User,
  Role,
  Event,
  Attendance,
  Registration
};
