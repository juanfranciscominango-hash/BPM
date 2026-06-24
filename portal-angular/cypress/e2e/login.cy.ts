describe('Login E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.url().should('include', '/login');
  });

  describe('Login Page Rendering', () => {
    it('should display login form with email and password fields', () => {
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should display theme toggle button', () => {
      cy.get('[data-testid="theme-toggle"]').should('be.visible');
    });

    it('should have empty email and password fields initially', () => {
      cy.get('input[name="email"]').should('have.value', '');
      cy.get('input[name="password"]').should('have.value', '');
    });
  });

  describe('Email/Password Login', () => {
    it('should show error when email is empty', () => {
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'Por favor ingresa tu correo y contraseña');
    });

    it('should show error when password is empty', () => {
      cy.get('input[name="email"]').type('admin@example.com');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'Por favor ingresa tu correo y contraseña');
    });

    it('should show error with invalid credentials', () => {
      cy.get('input[name="email"]').type('invalid@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'Credenciales inválidas');
    });

    it('should successfully login with valid credentials', () => {
      // Mock successful login
      cy.get('input[name="email"]').type('admin@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url({ timeout: 5000 }).should('include', '/dashboard');
      cy.get('h1').should('contain', 'Dashboard');
    });

    it('should display loading state during login', () => {
      cy.get('input[name="email"]').type('admin@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Check loading indicator appears
      cy.get('[data-testid="loading-spinner"]', { timeout: 1000 }).should('exist');
    });

    it('should toggle password visibility', () => {
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      
      // Click toggle button
      cy.get('[data-testid="toggle-password"]').click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');
      
      // Toggle back
      cy.get('[data-testid="toggle-password"]').click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });
  });

  describe('Entra ID / MSAL Login', () => {
    it('should display Entra ID login button when feature enabled', () => {
      cy.get('[data-testid="entra-id-button"]').should('be.visible');
    });

    it('should display Entra ID button text', () => {
      cy.get('[data-testid="entra-id-button"]')
        .should('contain', 'Iniciar sesión con Entra ID');
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle between light and dark theme', () => {
      // Get initial theme
      cy.get('html').then(($html) => {
        const initialTheme = $html.attr('data-theme') || 'light';
        
        // Click theme toggle
        cy.get('[data-testid="theme-toggle"]').click();
        
        // Verify theme changed
        const newTheme = initialTheme === 'light' ? 'dark' : 'light';
        cy.get('html').should('have.attr', 'data-theme', newTheme);
      });
    });

    it('should persist theme preference in localStorage', () => {
      cy.get('[data-testid="theme-toggle"]').click();
      cy.window().then((win) => {
        expect(win.localStorage.getItem('app-theme')).to.exist;
      });
    });
  });
});
