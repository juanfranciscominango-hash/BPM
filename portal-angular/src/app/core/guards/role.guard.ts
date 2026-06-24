import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rutas basado en roles de usuario
 * Verifica si el usuario tiene el rol requerido en la ruta
 * 
 * Uso en rutas:
 * {
 *   path: 'admin',
 *   canActivate: [AuthGuard, RoleGuard],
 *   data: { roles: ['admin'] }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Obtener los roles requeridos de la ruta
    const requiredRoles: string[] = route.data['roles'] || [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const user = this.authService.getCurrentUser();

    if (!user) {
      console.warn('🚫 RoleGuard: Usuario no encontrado');
      this.router.navigate(['/login']);
      return false;
    }

    const hasRole = user.roles.some(r => requiredRoles.includes(r));

    if (hasRole) {
      console.log(`✅ RoleGuard: Usuario tiene rol requerido`);
      return true;
    } else {
      console.error(`🚫 RoleGuard: Usuario no tiene rol requerido. Roles usuario: ${user.roles.join(', ')}, Roles requeridos: ${requiredRoles.join(', ')}`);
      // Redirigir a página de acceso denegado o dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}
