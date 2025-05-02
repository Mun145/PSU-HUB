'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SurveyQuestions', {
      id:         { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      surveyId:   { type: Sequelize.INTEGER, allowNull: false,
                    references: { model: 'Surveys', key: 'id' },
                    onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      question:   { type: Sequelize.TEXT, allowNull: false },
      qType:      { type: Sequelize.ENUM('short', 'mcq', 'checkbox', 'rating'), allowNull: false },
      options:    { type: Sequelize.JSON, allowNull: true }          // only for mcq / checkbox
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('SurveyQuestions'); }
};
