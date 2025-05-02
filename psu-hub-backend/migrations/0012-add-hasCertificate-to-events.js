//psu-hub-backend/migrations/0012-add-hasCertificate-to-events.js
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Events', 'hasCertificate', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('Events', 'hasCertificate');
  }
};
