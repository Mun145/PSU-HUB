//psu-hub-backend/migrations/create-surveys.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Surveys', {
      id:           { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      eventId:      { type: Sequelize.INTEGER, allowNull: false,
                      references: { model: 'Events', key: 'id' },
                      onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      title:        { type: Sequelize.STRING, allowNull: false, defaultValue: 'Event Feedback' },
      createdAt:    { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt:    { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('Surveys'); }
};
