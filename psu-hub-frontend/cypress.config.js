// psu-hub-frontend/cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Node event listeners here if needed
    },
    specPattern: 'cypress/e2e/**/*.cy.js'
  }
});
