import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, CanActivateChild } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MsalService } from '../services/msal.service';

/**
 * Guard para proteger rutas que requieren autenticación
 * Verifica si el usuario está autenticado (MSAL o AuthService)
 * Si no está autenticado, redirige a /login
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private msalService: MsalService,
    private router: Router
  ) {}

  canActivate(): boolean {
    return this.checkAuth();
  }

  canActivateChild(): boolean {
    return this.checkAuth();
  }

  private checkAuth(): boolean {
    const isAuthenticated = this.authService.isAuthenticated() || this.msalService.isAuthenticatedUser();
    
    if (isAuthenticated) {
      return true;
    } else {
      console.warn('🚫 AuthGuard: Usuario no autenticado, redirigiendo a /login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}