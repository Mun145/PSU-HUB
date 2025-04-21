//psu-hub-backend/migrations/0003-create-events.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      qr_code: {
        type: Sequelize.TEXT
      },
      status: {
        // final set includes 'draft'
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'published', 'draft'),
        defaultValue: 'pending',
        allowNull: false
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      academicYear: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      participationCategory: {
        type: Sequelize.ENUM('P', 'PAE'),
        allowNull: true
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      totalHours: {
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
    // drop the table
    await queryInterface.dropTable('Events');
    // Also drop the ENUMS if you want to be thorough, but note MySQL doesn't store them as separate types.
    // e.g.: await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Events_status";');
    //       await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Events_participationCategory";');
  }
};
