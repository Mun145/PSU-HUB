'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SurveyResponses', {
      id:        { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      surveyId:  { type: Sequelize.INTEGER, allowNull: false,
                   references: { model: 'Surveys', key: 'id' },
                   onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      userId:    { type: Sequelize.INTEGER, allowNull: false,
                   references: { model: 'Users', key: 'id' },
                   onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      answers:   { type: Sequelize.JSON, allowNull: false },          // { questionId: value }
      photos:    { type: Sequelize.JSON, allowNull: true },           // optional array of filenames
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('SurveyResponses'); }
};
