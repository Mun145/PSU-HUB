// psu-hub-backend/migrations/0007-add-draft-status.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Events', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'published', 'draft'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Events', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'published'),
      allowNull: false,
      defaultValue: 'pending'
    });
  }
};
