describe('Redis E2E Tests', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Navigate to Redis documentation
    cy.url({ timeout: 5000 }).should('include', '/dashboard');
    cy.visit('/documentacion/redis');
  });

  describe('Redis Page Rendering', () => {
    it('should display Redis documentation page', () => {
      cy.url().should('include', '/documentacion/redis');
      cy.get('h1').should('contain', 'Redis');
    });

    it('should display connection status indicator', () => {
      cy.get('[data-testid="redis-status"]').should('be.visible');
    });

    it('should have Redis operation buttons', () => {
      cy.get('[data-testid="set-btn"]').should('be.visible');
      cy.get('[data-testid="get-btn"]').should('be.visible');
      cy.get('[data-testid="delete-btn"]').should('be.visible');
      cy.get('[data-testid="flush-btn"]').should('be.visible');
    });
  });

  describe('Redis Connection', () => {
    it('should check Redis connection on page load', () => {
      cy.intercept('GET', '**/health', {
        statusCode: 200,
        body: { redis: 'connected' },
      }).as('healthCheck');

      cy.get('[data-testid="redis-status"]').should('contain', 'Conectado');
      cy.wait('@healthCheck').then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
      });
    });

    it('should show error when Redis is not connected', () => {
      cy.intercept('GET', '**/health', {
        statusCode: 500,
        body: { error: 'Connection failed' },
      }).as('connectionFailed');

      // Reload to trigger health check
      cy.reload();
      cy.wait('@connectionFailed');
      
      cy.get('[data-testid="redis-status"]').should('contain', 'Desconectado');
    });
  });

  describe('SET Operation', () => {
    it('should set a value in Redis', () => {
      cy.intercept('POST', '**/api/cache/**', {
        statusCode: 200,
        body: { success: true, message: 'Key set successfully' },
      }).as('setOperation');

      cy.get('[data-testid="set-btn"]').click();
      cy.wait('@setOperation');
      
      cy.get('[data-testid="set-result"]').should('contain', 'success');
    });

    it('should show loading state during SET operation', () => {
      cy.intercept('POST', '**/api/cache/**', { delay: 1000 }).as('delayedSet');

      cy.get('[data-testid="set-btn"]').click();
      cy.get('[data-testid="loading-set"]').should('be.visible');
      
      cy.wait('@delayedSet');
      cy.get('[data-testid="loading-set"]').should('not.exist');
    });

    it('should display error if SET operation fails', () => {
      cy.intercept('POST', '**/api/cache/**', {
        statusCode: 500,
        body: { error: 'Failed to set key' },
      }).as('setFailed');

      cy.get('[data-testid="set-btn"]').click();
      cy.wait('@setFailed');
      
      cy.get('[data-testid="set-error"]').should('be.visible');
      cy.get('[data-testid="set-error"]').should('contain', 'Error');
    });

    it('should show alert when Redis is not connected', () => {
      cy.get('[data-testid="redis-status"]').then(($status) => {
        if ($status.text().includes('Desconectado')) {
          cy.on('window:alert', (str) => {
            expect(str).to.include('Redis no está conectado');
          });
          cy.get('[data-testid="set-btn"]').click();
        }
      });
    });
  });

  describe('GET Operation', () => {
    it('should retrieve a value from Redis', () => {
      cy.intercept('GET', '**/api/cache/**', {
        statusCode: 200,
        body: { 
          success: true, 
          data: { 
            key: 'test-key', 
            value: { nombre: 'Test User', email: 'test@example.com' } 
          } 
        },
      }).as('getOperation');

      cy.get('[data-testid="get-btn"]').click();
      cy.wait('@getOperation');
      
      cy.get('[data-testid="get-result"]').should('contain', 'Test User');
    });

    it('should handle key not found error', () => {
      cy.intercept('GET', '**/api/cache/**', {
        statusCode: 404,
        body: { error: 'Key not found' },
      }).as('keyNotFound');

      cy.get('[data-testid="get-btn"]').click();
      cy.wait('@keyNotFound');
      
      cy.get('[data-testid="get-error"]').should('contain', 'not found');
    });
  });

  describe('DELETE Operation', () => {
    it('should delete a key from Redis', () => {
      cy.intercept('DELETE', '**/api/cache/**', {
        statusCode: 200,
        body: { success: true, message: 'Key deleted' },
      }).as('deleteOperation');

      cy.get('[data-testid="delete-btn"]').click();
      cy.wait('@deleteOperation');
      
      cy.get('[data-testid="delete-result"]').should('contain', 'success');
    });

    it('should show confirmation dialog before delete', () => {
      cy.on('window:confirm', () => true);
      
      cy.intercept('DELETE', '**/api/cache/**', {
        statusCode: 200,
        body: { success: true },
      }).as('deleteConfirmed');

      cy.get('[data-testid="delete-btn"]').click();
      cy.wait('@deleteConfirmed');
    });
  });

  describe('FLUSH Operation', () => {
    it('should clear all Redis cache', () => {
      cy.intercept('POST', '**/api/cache/flush', {
        statusCode: 200,
        body: { success: true, message: 'Cache flushed' },
      }).as('flushOperation');

      cy.get('[data-testid="flush-btn"]').click();
      cy.wait('@flushOperation');
      
      cy.get('[data-testid="flush-result"]').should('contain', 'success');
    });

    it('should require confirmation before flush', () => {
      cy.on('window:confirm', () => true);
      
      cy.intercept('POST', '**/api/cache/flush', {
        statusCode: 200,
        body: { success: true },
      }).as('flushConfirmed');

      cy.get('[data-testid="flush-btn"]').click();
      cy.wait('@flushConfirmed');
    });

    it('should cancel flush operation', () => {
      cy.on('window:confirm', () => false);

      cy.intercept('POST', '**/api/cache/flush').as('flushAttempt');

      cy.get('[data-testid="flush-btn"]').click();
      
      // Should not make HTTP request
      cy.wait(500);
      cy.get('@flushAttempt.all').should('have.length', 0);
    });
  });

  describe('Error Handling', () => {
    it('should display network errors gracefully', () => {
      cy.intercept('POST', '**/api/cache/**', { forceNetworkError: true }).as('networkError');

      cy.get('[data-testid="set-btn"]').click();
      cy.wait('@networkError');
      
      cy.get('[data-testid="set-error"]').should('contain', 'Error');
    });

    it('should display timeout errors', () => {
      cy.intercept('POST', '**/api/cache/**', { delay: 15000 }).as('timeout');

      cy.get('[data-testid="set-btn"]').click({ timeout: 5000 });
      
      cy.get('[data-testid="set-error"]').should('exist');
    });
  });

  describe('Test Data Display', () => {
    it('should display test key and value', () => {
      cy.get('[data-testid="test-key"]').should('contain', 'usuario:123');
      cy.get('[data-testid="test-value"]').should('contain', 'Juan Pérez');
    });

    it('should have audit information displayed', () => {
      cy.get('[data-testid="audit-user"]').should('contain', 'PlantillaAngular');
      cy.get('[data-testid="audit-ip"]').should('be.visible');
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
