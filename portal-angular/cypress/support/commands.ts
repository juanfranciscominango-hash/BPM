// ============================================
// Custom Cypress Commands
// ============================================

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

// Login with Entra ID
Cypress.Commands.add('loginWithEntraID', () => {
  cy.visit('/');
  cy.get('[data-testid="entra-id-button"]').click();
  // Wait for redirect to Entra ID and back
  cy.url().should('include', '/dashboard', { timeout: 10000 });
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-option"]').click();
  cy.url().should('include', '/login');
});

// Navigate to page
Cypress.Commands.add('navigateTo', (path: string) => {
  cy.get('[data-testid="nav-menu"]').within(() => {
    cy.contains('a', path).click();
  });
});

// Wait for API response
Cypress.Commands.add('waitForAPI', (method: string, url: string, alias: string) => {
  cy.intercept(method, url).as(alias);
  cy.wait(`@${alias}`);
});

// Set theme
Cypress.Commands.add('setTheme', (theme: 'light' | 'dark') => {
  cy.get('[data-testid="theme-toggle"]').then(($toggle) => {
    const currentTheme = $toggle.attr('aria-label')?.toLowerCase();
    if (currentTheme !== theme) {
      cy.wrap($toggle).click();
    }
  });
});

// Check authentication state
Cypress.Commands.add('checkAuthState', (isAuthenticated: boolean) => {
  cy.window().then((window) => {
    const authService = (window as any).authService;
    if (isAuthenticated) {
      expect(authService?.isAuthenticated()).to.be.true;
    } else {
      expect(authService?.isAuthenticated()).to.be.false;
    }
  });
});

// Declare module types for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginWithEntraID(): Chainable<void>;
      logout(): Chainable<void>;
      navigateTo(path: string): Chainable<void>;
      waitForAPI(method: string, url: string, alias: string): Chainable<void>;
      setTheme(theme: 'light' | 'dark'): Chainable<void>;
      checkAuthState(isAuthenticated: boolean): Chainable<void>;
    }
  }
}
