import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MsalService } from '../services/msal.service';

/**
 * Guard para proteger módulos lazy-loaded
 * Verifica autenticación antes de cargar módulos
 * Previene la carga de código JavaScript de módulos no autorizados
 * 
 * Uso en rutas:
 * {
 *   path: 'admin',
 *   canLoad: [CanLoadGuard],
 *   loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class CanLoadGuard implements CanLoad {
  constructor(
    private authService: AuthService,
    private msalService: MsalService,
    private router: Router
  ) {}

  canLoad(route: Route): boolean {
    const isAuthenticated = this.authService.isAuthenticated() || this.msalService.isAuthenticatedUser();

    if (isAuthenticated) {
      console.log(`✅ CanLoadGuard: Permitiendo carga de módulo: ${route.path}`);
      return true;
    } else {
      console.warn(`🚫 CanLoadGuard: Acceso denegado al módulo: ${route.path}`);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
