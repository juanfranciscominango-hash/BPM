describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for dashboard navigation
    cy.url({ timeout: 5000 }).should('include', '/dashboard');
  });

  describe('Dashboard Page Rendering', () => {
    it('should display dashboard after successful login', () => {
      cy.url().should('include', '/dashboard');
      cy.get('h1').should('contain', 'Dashboard');
    });

    it('should display main layout components', () => {
      cy.get('[data-testid="header"]').should('be.visible');
      cy.get('[data-testid="sidebar"]').should('be.visible');
      cy.get('[data-testid="main-content"]').should('be.visible');
    });

    it('should display user profile menu', () => {
      cy.get('[data-testid="profile-menu"]').should('be.visible');
    });

    it('should display theme toggle in header', () => {
      cy.get('[data-testid="header-theme-toggle"]').should('be.visible');
    });
  });

  describe('Navigation Menu', () => {
    it('should have navigation links', () => {
      cy.get('[data-testid="nav-dashboard"]').should('be.visible');
      cy.get('[data-testid="nav-analytics"]').should('be.visible');
      cy.get('[data-testid="nav-documentation"]').should('be.visible');
    });

    it('should navigate to analytics page', () => {
      cy.get('[data-testid="nav-analytics"]').click();
      cy.url().should('include', '/analytics');
    });

    it('should navigate to documentation page', () => {
      cy.get('[data-testid="nav-documentation"]').click();
      cy.url().should('include', '/documentacion');
    });

    it('should navigate to configuration page', () => {
      cy.get('[data-testid="nav-config"]').click();
      cy.url().should('include', '/configuracion');
    });
  });

  describe('User Profile Menu', () => {
    it('should display user name in profile menu', () => {
      cy.get('[data-testid="profile-menu"]').click();
      cy.get('[data-testid="user-name"]').should('contain', 'Admin User');
    });

    it('should display user email in profile menu', () => {
      cy.get('[data-testid="profile-menu"]').click();
      cy.get('[data-testid="user-email"]').should('contain', 'admin@example.com');
    });

    it('should have logout button', () => {
      cy.get('[data-testid="profile-menu"]').click();
      cy.get('[data-testid="logout-btn"]').should('be.visible');
    });

    it('should have profile settings option', () => {
      cy.get('[data-testid="profile-menu"]').click();
      cy.get('[data-testid="profile-settings"]').should('be.visible');
    });
  });

  describe('Logout Flow', () => {
    it('should logout user and redirect to login', () => {
      cy.get('[data-testid="profile-menu"]').click();
      cy.get('[data-testid="logout-btn"]').click();
      
      // Should redirect to login
      cy.url({ timeout: 5000 }).should('include', '/login');
      
      // Should clear auth data
      cy.window().then((win) => {
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });

    it('should not allow accessing dashboard after logout', () => {
      // Logout
      cy.get('[data-testid="profile-menu"]').click();
      cy.get('[data-testid="logout-btn"]').click();
      cy.url({ timeout: 5000 }).should('include', '/login');
      
      // Try to access dashboard directly
      cy.visit('/dashboard');
      
      // Should redirect back to login
      cy.url().should('include', '/login');
    });
  });

  describe('Sidebar Toggle', () => {
    it('should toggle sidebar on mobile', () => {
      cy.viewport('iphone-x');
      
      cy.get('[data-testid="sidebar"]').should('have.class', /collapsed|hidden/);
      
      cy.get('[data-testid="toggle-sidebar"]').click();
      cy.get('[data-testid="sidebar"]').should('not.have.class', /collapsed|hidden/);
    });

    it('should keep sidebar open on desktop', () => {
      cy.viewport('macbook-15');
      cy.get('[data-testid="sidebar"]').should('be.visible');
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme selection', () => {
      // Set dark theme
      cy.get('[data-testid="header-theme-toggle"]').click();
      cy.window().then((win) => {
        expect(win.localStorage.getItem('app-theme')).to.equal('dark');
      });
      
      // Reload page
      cy.reload();
      
      // Theme should be dark
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="main-content"]').should('be.visible');
      cy.get('[data-testid="header"]').should('be.visible');
    });

    it('should be responsive on tablet', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="main-content"]').should('be.visible');
      cy.get('[data-testid="sidebar"]').should('be.visible');
    });

    it('should be responsive on desktop', () => {
      cy.viewport('macbook-15');
      cy.get('[data-testid="main-content"]').should('be.visible');
      cy.get('[data-testid="sidebar"]').should('be.visible');
    });
  });

  describe('Page Load Performance', () => {
    it('should load dashboard within reasonable time', () => {
      cy.visit('/dashboard', { onBeforeLoad: (win) => {
        win.performance.mark('dashboard-start');
      }, onLoad: (win) => {
        win.performance.mark('dashboard-end');
        win.performance.measure('dashboard-load', 'dashboard-start', 'dashboard-end');
        const measure = win.performance.getEntriesByName('dashboard-load')[0];
        expect(measure.duration).to.be.lessThan(3000);
      }});
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '**/api/**', { statusCode: 500 }).as('apiError');
      
      cy.visit('/dashboard');
      cy.wait('@apiError');
      
      cy.get('[data-testid="error-message"]').should('exist');
    });

    it('should display loading state during page transition', () => {
      cy.intercept('GET', '**/api/**', { delay: 1000 }).as('slowApi');
      
      cy.get('[data-testid="nav-analytics"]').click();
      
      // Loading indicator should appear
      cy.get('[data-testid="page-loading"]', { timeout: 100 }).should('exist');
    });
  });
});
