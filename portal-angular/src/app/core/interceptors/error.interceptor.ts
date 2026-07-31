import { Injectable, inject, Injector } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor de errores HTTP que captura y maneja errores de forma centralizada
 * - 401: No autenticado → redirige a login
 * - 403: No autorizado → muestra error
 * - 500: Error del servidor → muestra error
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private injector = inject(Injector);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error desconocido';

        if (error.error instanceof ErrorEvent) {
          // Error del cliente
          errorMessage = `Error: ${error.error.message}`;
          console.error('Client-side error:', error.error);
        } else {
          // Error del servidor
          errorMessage = `Error ${error.status}: ${error.message}`;

          switch (error.status) {
            case 401:
              if (!req.url.includes('/auth/login') && !req.url.includes('/parametric/tables') && !req.url.includes('/public/brand')) {
                console.warn('Sesión expirada o invalidada. Limpiando almacenamiento y redirigiendo...');
                try {
                  const authService = this.injector.get(AuthService);
                  authService.logout();
                } catch (e) {
                  localStorage.removeItem('user_data');
                }
                this.router.navigate(['/login'], { queryParams: { reason: 'session_expired' } });
                errorMessage = 'Tu sesión ha sido cerrada porque has iniciado sesión en otro dispositivo o navegador.';
              } else if (req.url.includes('/auth/login')) {
                errorMessage = 'Credenciales incorrectas. Por favor verifica tu correo y contraseña.';
              } else {
                errorMessage = 'No autorizado para este recurso parametric/public.';
              }
              break;
            case 403:
              errorMessage = 'No tienes permisos para acceder a este recurso.';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado (404).';
              break;
            case 500:
              errorMessage = 'Error interno del servidor.';
              break;
            case 503:
              errorMessage = 'Servicio no disponible.';
              break;
          }
        }

        console.error('[HTTP Error]', {
          url: req.url,
          method: req.method,
          status: error.status,
          message: errorMessage
        });

        return throwError(() => ({
          status: error.status,
          message: errorMessage
        }));
      })
    );
  }
}
