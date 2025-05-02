// psu-hub-backend/models/Event.js
const { DataTypes } = require('sequelize');
const sequelize     = require('../config/db');

const Event = sequelize.define(
  'Event',
  {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title:        { type: DataTypes.STRING,  allowNull: false },
    description:  { type: DataTypes.TEXT,    allowNull: false },
    location:     { type: DataTypes.STRING,  allowNull: false },
    qr_code:      { type: DataTypes.TEXT },

    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'published', 'draft'), defaultValue: 'pending' },

    imageUrl:            { type: DataTypes.STRING },

    /* ---------- NEW / existing extended fields ---------- */
    academicYear:        { type: DataTypes.STRING(10) },
    participationCategory:{ type: DataTypes.ENUM('P', 'PAE') },
    startDate:           { type: DataTypes.DATE },
    endDate:             { type: DataTypes.DATE },
    totalHours:          { type: DataTypes.INTEGER },

    /*  Toggle that controls automatic certificate generation  */
    hasCertificate:      { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { timestamps: true }
);

module.exports = Event;
