import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { PublicClientApplication, Configuration, AuthenticationResult, RedirectRequest, SilentRequest } from '@azure/msal-browser';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MsalService {
  private router = inject(Router);
  private msalInstance: PublicClientApplication | null = null;

  // ✨ Angular Signals - Estado reactivo
  private isAuthenticatedSignal = signal<boolean>(false);
  private userSignal = signal<any>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // 📖 Read-only signals expuestos al público
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // 🔄 Computed signals - Derivados automáticamente
  readonly authState = computed(() => ({
    isAuthenticated: this.isAuthenticatedSignal(),
    user: this.userSignal(),
    loading: this.loadingSignal(),
    error: this.errorSignal()
  }));

  // Configuración usando environment
  private defaultConfig = {
    clientId: environment.msalConfig.auth.clientId,
    authority: environment.msalConfig.auth.authority,
    redirectUri: environment.msalConfig.auth.redirectUri
  };

  constructor() {
    this.initializeMSAL();

    // 🔗 Effect - Reacciona a cambios en isAuthenticated
    effect(() => {
      const isAuth = this.isAuthenticatedSignal();
      console.log('🔄 Auth state changed:', isAuth);
    });
  }

  private async initializeMSAL(): Promise<void> {
    const msalConfig: Configuration = {
      auth: {
        clientId: this.defaultConfig.clientId,
        authority: this.defaultConfig.authority,
        redirectUri: this.defaultConfig.redirectUri,
        postLogoutRedirectUri: environment.msalConfig.auth.postLogoutRedirectUri
      },
      cache: {
        cacheLocation: environment.msalConfig.cache.cacheLocation as 'localStorage' | 'sessionStorage',
        storeAuthStateInCookie: environment.msalConfig.cache.storeAuthStateInCookie
      }
    };

    this.msalInstance = new PublicClientApplication(msalConfig);

    try {
      await this.msalInstance.initialize();

      // Manejar el callback de redirección
      await this.handleRedirectCallback();

      // Verificar estado de autenticación
      this.checkAuthenticationStatus();
    } catch (error) {
      console.error('Error initializing MSAL:', error);
    }
  }

  private async handleRedirectCallback(): Promise<void> {
    if (!this.msalInstance) return;

    try {
      const response = await this.msalInstance.handleRedirectPromise();
      if (response && response.account) {
        console.log('✅ Redirect login successful:', response.account);
        this.msalInstance.setActiveAccount(response.account);
        this.isAuthenticatedSignal.set(true);
        this.userSignal.set(response.account);
        this.errorSignal.set(null);

        // Redirigir al dashboard después de autenticación exitosa
        // Solo redirigir si estamos en la página de callback o en la raíz
        if (window.location.pathname.includes('/auth/callback') ||
            window.location.pathname === '/' ||
            window.location.pathname === '/login') {
          // Pequeño delay para asegurar que el routing esté listo
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 100);
        }
      }
    } catch (error) {
      console.error('❌ Error handling redirect callback:', error);
      this.errorSignal.set('Error durante el callback de redirección');
    }
  }

  private async checkAuthenticationStatus(): Promise<void> {
    if (!this.msalInstance) return;

    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      this.msalInstance.setActiveAccount(accounts[0]);
      this.isAuthenticatedSignal.set(true);
      this.userSignal.set(accounts[0]);
    } else {
      this.isAuthenticatedSignal.set(false);
      this.userSignal.set(null);
    }
  }

  async loginRedirect(): Promise<void> {
    if (!this.msalInstance) {
      console.error('MSAL instance not initialized');
      this.errorSignal.set('MSAL no está inicializado');
      return;
    }

    const loginRequest: RedirectRequest = {
      scopes: environment.msalScopes.loginRequest.scopes,
      prompt: 'select_account'
    };

    this.loadingSignal.set(true);
    try {
      await this.msalInstance.loginRedirect(loginRequest);
      this.errorSignal.set(null);
    } catch (error) {
      console.error('❌ Login failed:', error);
      this.errorSignal.set('Error durante el login: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      this.loadingSignal.set(false);
      throw error;
    }
  }

  async loginPopup(): Promise<AuthenticationResult | null> {
    if (!this.msalInstance) {
      console.error('MSAL instance not initialized');
      this.errorSignal.set('MSAL no está inicializado');
      return null;
    }

    const loginRequest: RedirectRequest = {
      scopes: environment.msalScopes.loginRequest.scopes,
      prompt: 'select_account'
    };

    this.loadingSignal.set(true);
    try {
      const response = await this.msalInstance.loginPopup(loginRequest);
      this.msalInstance.setActiveAccount(response.account);
      this.isAuthenticatedSignal.set(true);
      this.userSignal.set(response.account);
      this.errorSignal.set(null);
      return response;
    } catch (error) {
      console.error('❌ Login popup failed:', error);
      this.errorSignal.set('Error durante el login: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async logout(): Promise<void> {
    if (!this.msalInstance) {
      console.log('MSAL instance not available, clearing local state only');
      this.clearLocalState();
      return;
    }

    try {
      // Limpiar estado local primero
      this.clearLocalState();

      const logoutRequest = {
        postLogoutRedirectUri: environment.msalConfig.auth.postLogoutRedirectUri,
        mainWindowRedirectUri: environment.msalConfig.auth.postLogoutRedirectUri
      };

      console.log('🚪 Initiating MSAL logout with redirect to:', logoutRequest.postLogoutRedirectUri);
      await this.msalInstance.logoutRedirect(logoutRequest);
    } catch (error) {
      console.error('❌ Error during MSAL logout:', error);
      this.errorSignal.set('Error durante el logout');
      // En caso de error, forzar limpieza del estado local
      this.clearLocalState();
      throw error;
    }
  }

  private clearLocalState(): void {
    this.isAuthenticatedSignal.set(false);
    this.userSignal.set(null);
    this.errorSignal.set(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    console.log('✅ Local authentication state cleared');
  }

  async getAccessToken(scopes: string[] = ['User.Read']): Promise<string | null> {
    if (!this.msalInstance) {
      console.warn('⚠️ MSAL instance not initialized');
      return null;
    }

    const account = this.msalInstance.getActiveAccount();
    if (!account) {
      console.warn('⚠️ No active account');
      this.errorSignal.set('No hay cuenta activa');
      return null;
    }

    const silentRequest: SilentRequest = {
      scopes: scopes,
      account: account
    };

    this.loadingSignal.set(true);
    try {
      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      this.errorSignal.set(null);
      return response.accessToken;
    } catch (error) {
      console.warn('⚠️ Silent token acquisition failed, attempting interactive:', error);
      try {
        const interactiveRequest: RedirectRequest = {
          scopes: scopes,
          prompt: 'select_account'
        };
        const response = await this.msalInstance.acquireTokenPopup(interactiveRequest);
        this.errorSignal.set(null);
        return response.accessToken;
      } catch (popupError) {
        console.error('❌ Token acquisition failed:', popupError);
        this.errorSignal.set('Error adquiriendo token');
        return null;
      }
    } finally {
      this.loadingSignal.set(false);
    }
  }

  getCurrentUser(): any {
    return this.msalInstance?.getActiveAccount() || this.userSignal();
  }

  isAuthenticatedUser(): boolean {
    return this.isAuthenticatedSignal();
  }

  getUser$(): any {
    return this.userSignal();
  }

  getAllUsers(): any[] {
    // Implementación para obtener todos los usuarios
    // En una aplicación real, esto vendría de una API
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  // Método para configurar el clientId en tiempo de ejecución
  updateClientId(clientId: string): void {
    this.defaultConfig.clientId = clientId;
    this.initializeMSAL();
  }
}