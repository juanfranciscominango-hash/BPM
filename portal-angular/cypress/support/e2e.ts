// ============================================
// Cypress E2E Support Configuration
// ============================================

// Import commands.ts
import './commands';

// Disable uncaught exception handling during E2E tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar ciertos errores conocidos
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  if (err.message.includes('Cannot read property')) {
    return false;
  }

  // Let other errors fail the test
  return true;
});

// Global test configuration
beforeEach(() => {
  // Clear localStorage between tests
  cy.window().then((window) => {
    window.localStorage.clear();
  });

  // Set test cookies if needed
  cy.clearCookies();
});

// Log test metrics
afterEach(() => {
  // Could log performance metrics here
  cy.window().then((window) => {
    const performance = window.performance.timing;
    const pageLoadTime = performance.loadEventEnd - performance.navigationStart;
    cy.log(`Page load time: ${pageLoadTime}ms`);
  });
});
