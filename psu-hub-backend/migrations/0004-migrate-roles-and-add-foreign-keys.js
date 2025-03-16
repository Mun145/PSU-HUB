'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('Roles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
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

    await queryInterface.bulkInsert('Roles', [
      { name: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'psu_admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'faculty', createdAt: new Date(), updatedAt: new Date() }
    ]);

    await queryInterface.addColumn('Users', 'role_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET "role_id" = (
        SELECT "Roles"."id"
        FROM "Roles"
        WHERE "Roles"."name" = "Users"."role"
      )
      WHERE "role" IN ('admin','psu_admin','faculty');
    `);

    await queryInterface.removeColumn('Users', 'role');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');

    await queryInterface.addConstraint('Attendances', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'FK_Attendance_User',
      references: {
        table: 'Users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('Attendances', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'FK_Attendance_Event',
      references: {
        table: 'Events',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeConstraint('Attendances', 'FK_Attendance_User');
    await queryInterface.removeConstraint('Attendances', 'FK_Attendance_Event');

    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('faculty','admin','psu_admin'),
      allowNull: false,
      defaultValue: 'faculty'
    });

    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET "role" = (
        SELECT "Roles"."name"
        FROM "Roles"
        WHERE "Roles"."id" = "Users"."role_id"
      )
      WHERE "role_id" IS NOT NULL;
    `);

    await queryInterface.removeColumn('Users', 'role_id');

    await queryInterface.dropTable('Roles');

  }
};
