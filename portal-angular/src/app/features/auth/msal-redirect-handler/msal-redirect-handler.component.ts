import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '../../../core/services/msal.service';
import { CommonModule } from '@angular/common';

/**
 * Componente para manejar el callback de MSAL
 * Se usa como destino del redirectUri en la configuración de MSAL
 * Ruta: /auth/callback
 * 
 * Angular completará automáticamente el flujo de redirección
 * y este componente mostará un mensaje de carga
 */
@Component({
  selector: 'app-msal-redirect-handler',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="msal-redirect-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3 text-muted">Completando autenticación...</p>
      <small class="text-secondary">Por favor espera mientras se procesa tu autenticación con Entra ID</small>
    </div>
  `,
  styles: [`
    .msal-redirect-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
    }
    
    .spinner-border {
      width: 3rem;
      height: 3rem;
      border-width: 0.25em;
    }
    
    p, small {
      color: white;
    }
  `]
})
export class MsalRedirectHandlerComponent implements OnInit {
  private msalService = inject(MsalService);
  private router = inject(Router);

  ngOnInit(): void {
    // El flujo de autenticación ya fue manejado por MsalService.handleRedirectCallback()
    // Este componente solo muestra un mensaje de carga
    
    // Esperar a que MSAL complete la redirección
    setTimeout(() => {
      // Verificar si el usuario ya fue autenticado
      if (this.msalService.isAuthenticatedUser()) {
        console.log('✅ MSAL Redirect: Autenticación completada, navegando al dashboard');
        this.router.navigate(['/dashboard']);
      } else {
        console.warn('⚠️ MSAL Redirect: Autenticación no completada, volviendo a login');
        this.router.navigate(['/login']);
      }
    }, 1000);
  }
}
