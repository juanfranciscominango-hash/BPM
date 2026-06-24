import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredPermission = route.data['permission'];
  
  if (!requiredPermission) return true;
  
  if (authService.hasPermission(requiredPermission)) {
    return true;
  } else {
    console.warn(`Access denied. Missing permission: ${requiredPermission}`);
    router.navigate(['/dashboard']);
    return false;
  }
};
