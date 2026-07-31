import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { CONSTANTES } from '../../constantes';
import { environment } from '../../../environments/environment';
import { ThemeService } from './theme.service';

export interface User {
  id: number;
  username: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  sessionId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.back_url}/api/v1/auth`;

  private currentUserSignal = signal<User | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly isAuthenticatedComputed = computed(() => this.currentUserSignal() !== null);

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    const storedUser = localStorage.getItem(CONSTANTES.STORAGE.USER);
    if (storedUser) {
      try {
        this.currentUserSignal.set(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem(CONSTANTES.STORAGE.USER);
      }
    }
  }

  private themeService = inject(ThemeService);

  login(credentials: LoginCredentials): Observable<User | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
      map(user => {
        if (user) {
          this.currentUserSignal.set(user);
          localStorage.setItem(CONSTANTES.STORAGE.USER, JSON.stringify(user));
          this.errorSignal.set(null);
          // Cargar colores y logotipo desde la base de datos tras loguearse
          this.themeService.loadColorsFromDatabase();
        }
        this.loadingSignal.set(false);
        return user;
      }),
      catchError(error => {
        this.errorSignal.set('Credenciales inválidas');
        this.loadingSignal.set(false);
        return of(null);
      })
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.errorSignal.set(null);
    localStorage.removeItem(CONSTANTES.STORAGE.USER);
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedComputed();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSignal();
    return user ? user.roles.some(r => r.toUpperCase() === role.toUpperCase()) : false;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSignal();
    if (user?.roles.some(r => r.toUpperCase() === 'ADMINISTRADOR')) return true;
    return user ? user.permissions.includes(permission) : false;
  }
}