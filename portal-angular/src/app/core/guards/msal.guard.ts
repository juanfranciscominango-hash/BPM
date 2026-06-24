import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MsalService } from '../services/msal.service';

/**
 * Guard que protege rutas usando únicamente MSAL (Azure AD / Entra ID)
 * 
 * Uso en rutas:
 * {
 *   path: 'azure-protected',
 *   canActivate: [MsalGuard],
 *   component: ProtectedComponent
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class MsalGuard implements CanActivate {
  constructor(
    private msalService: MsalService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isAuthenticated = this.msalService.isAuthenticatedUser();

    if (isAuthenticated) {
      console.log('✅ MsalGuard: Usuario autenticado con MSAL');
      return true;
    } else {
      console.warn('🚫 MsalGuard: Usuario no autenticado con MSAL, iniciando login');
      
      // Intentar login via popup
      this.msalService.loginPopup()
        .then(result => {
          if (result) {
            // Reintentando acceso después de login exitoso
            this.router.navigate([route.url.map(u => u.path).join('/')]);
          }
        })
        .catch(error => {
          console.error('MsalGuard: Error during login:', error);
          // Fallback a redirect login
          this.msalService.loginRedirect();
        });

      return false;
    }
  }
}
