import { Injectable, inject } from '@angular/core';
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

/**
 * Interceptor de errores HTTP que captura y maneja errores de forma centralizada
 * - 401: No autenticado → redirige a login
 * - 403: No autorizado → muestra error
 * - 500: Error del servidor → muestra error
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);

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
              console.warn('Token expirado. Redirigiendo a login...');
              this.router.navigate(['/login']);
              errorMessage = 'Sesión expirada. Por favor, inicia sesión.';
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
