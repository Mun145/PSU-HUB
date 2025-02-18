// psu-hub-frontend/cypress/e2e/basic_spec.cy.js
describe('Basic E2E Test', () => {
    it('Visits the homepage', () => {
      cy.visit('/');
      cy.contains('Welcome to PSU Hub'); 
    });
  });
  