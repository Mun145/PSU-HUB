'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Add academicYear (string)
    await queryInterface.addColumn('Events', 'academicYear', {
      type: Sequelize.STRING(10), // e.g. "2024-2025"
      allowNull: true
    });

    // 2) Add participationCategory (PAE or P)
    await queryInterface.addColumn('Events', 'participationCategory', {
      type: Sequelize.ENUM('P', 'PAE'),
      allowNull: true
      // or set defaultValue: 'P' if you want a default
    });

    // 3) Add startDate & endDate
    await queryInterface.addColumn('Events', 'startDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('Events', 'endDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // 4) Add totalHours
    await queryInterface.addColumn('Events', 'totalHours', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert columns

    // remove totalHours
    await queryInterface.removeColumn('Events', 'totalHours');

    // remove startDate & endDate
    await queryInterface.removeColumn('Events', 'startDate');
    await queryInterface.removeColumn('Events', 'endDate');

    // remove participationCategory
    await queryInterface.removeColumn('Events', 'participationCategory');
    // also drop the ENUM type for participationCategory
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Events_participationCategory";');

    // remove academicYear
    await queryInterface.removeColumn('Events', 'academicYear');
  }
};
