//psu-hub-backend/migrations/0006-create-users.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ActivityLogs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      type: {
        // 'activity' for recent event updates, 'task' for tasks, 'announcement' for system messages
        type: Sequelize.ENUM('activity', 'task', 'announcement'),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      targetRoles: {
        // Optional: a comma-separated list of roles for which this log is relevant (e.g., "admin,faculty")
        type: Sequelize.STRING,
        allowNull: true
      },
      referenceId: {
        // Optional: link to an event or user (e.g., eventId)
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ActivityLogs');
  }
};
