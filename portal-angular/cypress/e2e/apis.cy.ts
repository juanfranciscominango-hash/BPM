describe('APIs/Catalogs E2E Tests', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Navigate to APIs documentation
    cy.url({ timeout: 5000 }).should('include', '/dashboard');
    cy.visit('/documentacion/apis');
  });

  describe('APIs Page Rendering', () => {
    it('should display APIs documentation page', () => {
      cy.url().should('include', '/documentacion/apis');
      cy.get('h1').should('contain', 'APIs');
    });

    it('should have token request button', () => {
      cy.get('[data-testid="obtener-token-btn"]').should('be.visible');
      cy.get('[data-testid="obtener-token-btn"]').should('contain', 'Obtener Token');
    });

    it('should have APIM token button', () => {
      cy.get('[data-testid="obtener-token-apim-btn"]').should('be.visible');
    });

    it('should have catalogs request button', () => {
      cy.get('[data-testid="consultar-catalogos-btn"]').should('be.visible');
    });
  });

  describe('Token Request Flow', () => {
    it('should request token and display result', () => {
      // Mock HTTP request
      cy.intercept('POST', '**/proxy/request', {
        statusCode: 200,
        body: { data: { token: 'test-token-123', expiresIn: 3600 } },
      }).as('tokenRequest');

      cy.get('[data-testid="obtener-token-btn"]').click();
      
      // Verify loading state
      cy.get('[data-testid="loading-token"]').should('be.visible');
      
      // Wait for response
      cy.wait('@tokenRequest');
      
      // Verify result is displayed
      cy.get('[data-testid="token-result"]').should('contain', 'test-token-123');
    });

    it('should display error when token request fails', () => {
      cy.intercept('POST', '**/proxy/request', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('failedRequest');

      cy.get('[data-testid="obtener-token-btn"]').click();
      cy.wait('@failedRequest');
      
      cy.get('[data-testid="token-error"]').should('be.visible');
      cy.get('[data-testid="token-error"]').should('contain', 'Error');
    });

    it('should clear previous errors on new request', () => {
      // First request fails
      cy.intercept('POST', '**/proxy/request', {
        statusCode: 500,
        body: { error: 'Error' },
      }).as('failedRequest');

      cy.get('[data-testid="obtener-token-btn"]').click();
      cy.wait('@failedRequest');
      cy.get('[data-testid="token-error"]').should('exist');

      // Change mock to success
      cy.intercept('POST', '**/proxy/request', {
        statusCode: 200,
        body: { data: { token: 'new-token' } },
      }).as('successRequest');

      // Make new request
      cy.get('[data-testid="obtener-token-btn"]').click();
      cy.wait('@successRequest');
      
      // Error should be gone
      cy.get('[data-testid="token-error"]').should('not.exist');
    });
  });

  describe('Catalogs Request Flow', () => {
    it('should request catalogs with authentication header', () => {
      cy.intercept('POST', '**/proxy/request', (req) => {
        // First request - get token
        if (req.body?.data?.datosIniciarSesion) {
          req.reply({
            statusCode: 200,
            body: { respuestaToken: { tokenSesion: 'catalog-token-123' } },
          });
        }
        // Second request - get catalogs
        else if (req.body?.headers?.Authorization) {
          expect(req.body.headers.Authorization).to.include('Bearer');
          req.reply({
            statusCode: 200,
            body: { data: { catalogos: [{ id: 1, name: 'Catalog 1' }] } },
          });
        }
      }).as('catalogRequest');

      cy.get('[data-testid="consultar-catalogos-btn"]').click();
      cy.wait('@catalogRequest');
      
      cy.get('[data-testid="catalogs-result"]').should('be.visible');
      cy.get('[data-testid="catalogs-result"]').should('contain', 'Catalog 1');
    });

    it('should display loading state during catalog request', () => {
      cy.intercept('POST', '**/proxy/request', { delay: 1000 }).as('delayedRequest');

      cy.get('[data-testid="consultar-catalogos-btn"]').click();
      cy.get('[data-testid="loading-catalogs"]').should('be.visible');
      
      cy.wait('@delayedRequest');
      cy.get('[data-testid="loading-catalogs"]').should('not.exist');
    });

    it('should show error if token extraction fails', () => {
      cy.intercept('POST', '**/proxy/request', {
        statusCode: 200,
        body: { invalidResponse: 'no token here' },
      }).as('noTokenRequest');

      cy.get('[data-testid="consultar-catalogos-btn"]').click();
      cy.wait('@noTokenRequest');
      
      cy.get('[data-testid="catalogs-error"]').should('be.visible');
      cy.get('[data-testid="catalogs-error"]').should('contain', 'No se pudo extraer el token');
    });
  });

  describe('Code Examples', () => {
    it('should display code examples for API usage', () => {
      cy.get('[data-testid="code-example"]').should('exist');
      cy.get('[data-testid="code-example"]').should('contain', 'import');
    });

    it('should have syntax highlighting in code blocks', () => {
      cy.get('[data-testid="code-example"]').should('have.class', /hljs|highlight|prism/);
    });
  });

  describe('Documentation Navigation', () => {
    it('should have link back to main documentation', () => {
      cy.get('[data-testid="back-to-docs"]').should('be.visible');
      cy.get('[data-testid="back-to-docs"]').click();
      cy.url().should('include', '/documentacion');
    });
  });
});
