const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,     // e.g. 'psu_hub'
  process.env.DB_USER,     // e.g. 'root'
  process.env.DB_PASS,     // e.g. 'Alghamdi12'
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // set to true if you want SQL logs
  }
);

module.exports = sequelize;
