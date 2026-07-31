import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CONSTANTES } from '../../constantes';

/**
 * Interceptor de autenticación que agrega las cabeceras de sesión a todas las peticiones HTTP
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener datos del usuario logueado
    const storedUser = localStorage.getItem(CONSTANTES.STORAGE.USER);
    let username = '';
    let sessionId = '';

    console.log('[AuthInterceptor] Stored user in localStorage:', storedUser);

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        username = user.username;
        sessionId = user.sessionId;
      } catch (e) {
        console.error('[AuthInterceptor] Error parsing stored user:', e);
      }
    }

    console.log('[AuthInterceptor] Sending headers - Username:', username, 'SessionId:', sessionId, 'for URL:', req.url);

    // Agregar cabeceras si el usuario tiene sesión activa
    if (username && sessionId) {
      req = req.clone({
        setHeaders: {
          'X-Username': username,
          'X-Session-Id': sessionId,
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json'
        }
      });
    } else {
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });
    }

    return next.handle(req);
  }
}
