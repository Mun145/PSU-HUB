const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import the sequelize instance

const User = sequelize.define('User', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: { 
    type: DataTypes.ENUM('faculty', 'admin', 'psu_admin'), 
    allowNull: false 
  }
}, {
  timestamps: true, // createdAt, updatedAt
});

module.exports = User;
