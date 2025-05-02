// migrations/XXXX-add-attended-to-registrations.js
'use strict';
module.exports = {
  async up(q, Sequelize) {
    await q.addColumn('Registrations', 'attended', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },
  async down(q) {
    await q.removeColumn('Registrations', 'attended');
  }
};
