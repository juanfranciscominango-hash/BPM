import { Configuration } from '@azure/msal-browser';
import { environment } from '../../../environments/environment';

/**
 * MSAL Configuration Factory
 * Proporciona configuración completa de MSAL para Azure AD / Entra ID
 * 
 * Características:
 * - Configuración por entorno (desarrollo, staging, producción)
 * - Manejo de caché en localStorage/sessionStorage
 * - Configuración de scopes y permisos
 * - Manejo de redirección y callbacks
 */

export const msalConfig: Configuration = {
  auth: {
    clientId: environment.msalConfig?.auth?.clientId || '',
    authority: environment.msalConfig?.auth?.authority || '',
    redirectUri: environment.msalConfig?.auth?.redirectUri || window.location.origin,
    postLogoutRedirectUri: environment.msalConfig?.auth?.postLogoutRedirectUri || window.location.origin + '/login',
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: (environment.msalConfig?.cache?.cacheLocation as 'localStorage' | 'sessionStorage') || 'sessionStorage',
    storeAuthStateInCookie: environment.msalConfig?.cache?.storeAuthStateInCookie ?? false,
    secureCookies: true
  }
};

/**
 * Scopes de autorización para diferentes operaciones
 */
export const msalScopes = {
  loginRequest: {
    scopes: (environment.msalScopes as any)?.loginRequest?.scopes || ['user.read']
  },
  silentRequest: {
    scopes: (environment.msalScopes as any)?.silentRequest?.scopes || ['user.read'],
    forceRefresh: false
  },
  graphRequest: {
    scopes: (environment.msalScopes as any)?.graphRequest?.scopes || ['https://graph.microsoft.com/.default']
  }
};

/**
 * Endpoints de MSAL
 */
export const msalEndpoints = {
  login: {
    redirect: '/auth/callback',
    popup: null
  },
  logout: {
    redirect: '/login',
    popup: null
  },
  graphApi: 'https://graph.microsoft.com/v1.0/me'
};

/**
 * Configuración de comportamiento MSAL
 */
export const msalBehavior = {
  // Reintentos en caso de error silencioso
  silentTokenAcquisitionRetries: 3,
  silentTokenAcquisitionRetryDelay: 1000,

  // Timeout para operaciones de login
  loginTimeout: 30000,

  // Comportamiento de popup
  popupWindowFeatures: 'width=500,height=600,left=500,top=300',

  // Manejo de errores
  errorHandlingStrategy: 'redirect' as const
};
