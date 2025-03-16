// psu-hub-backend/migrations/0007-add-draft-status.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Add 'draft' to the enum for the "status" column on the "Events" table
    //    We'll drop the existing enum, then recreate it with 'draft' included.

    // PostgreSQL approach: may differ for MySQL. If you're using MySQL, use the approach that redefines the column.
    // E.g. if you're on MySQL, do:
    // await queryInterface.sequelize.query(`
    //   ALTER TABLE Events MODIFY COLUMN status ENUM('pending','approved','rejected','published','draft') NOT NULL DEFAULT 'pending'
    // `);

    // For a universal approach in Sequelize (works for MySQL), do:
    await queryInterface.changeColumn('Events', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'published', 'draft'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    // remove 'draft' from the enum by dropping the column & re-adding or revert to old definition
    await queryInterface.changeColumn('Events', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'published'),
      allowNull: false,
      defaultValue: 'pending'
    });
  }
};
