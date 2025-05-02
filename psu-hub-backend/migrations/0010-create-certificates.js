'use strict';

module.exports = {
  /**
   * Certificates: one row per user *per* event once they have
   * completed the survey (or are manually awarded).
   *
   * Fields marked “nullable” are filled once the PDF is generated.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Certificates', {
      id:          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId:      { type: Sequelize.INTEGER, allowNull: false,
                     references: { model: 'Users',  key: 'id' },
                     onUpdate: 'CASCADE', onDelete: 'CASCADE' },

      eventId:     { type: Sequelize.INTEGER, allowNull: false,
                     references: { model: 'Events', key: 'id' },
                     onUpdate: 'CASCADE', onDelete: 'CASCADE' },

      /** file path or S3/GCS URL of generated PDF */
      fileUrl:     { type: Sequelize.STRING,  allowNull: true },

      /** date on which PDF was generated */
      issuedAt:    { type: Sequelize.DATE,    allowNull: true },

      createdAt:   { type: Sequelize.DATE, allowNull: false,
                     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt:   { type: Sequelize.DATE, allowNull: false,
                     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    /* Optional: composite uniqueness so a user can only have ONE
       certificate per event.  */
    await queryInterface.addConstraint('Certificates', {
      fields: ['userId', 'eventId'],
      type:   'unique',
      name:   'uniq_user_event_certificate'
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('Certificates');
  }
};
