import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, UrlSerializer } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InjectionToken, Provider } from '@angular/core';
import { routes } from './app.routes';
import { EncryptedUrlSerializer } from './core/serializers/encrypted-url.serializer';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { msalConfig, msalScopes, msalEndpoints, msalBehavior } from './core/config/msal.config';

/**
 * Token de inyección para configuración de MSAL
 */
export const MSAL_CONFIG = new InjectionToken('msal.config');
export const MSAL_SCOPES = new InjectionToken('msal.scopes');
export const MSAL_ENDPOINTS = new InjectionToken('msal.endpoints');
export const MSAL_BEHAVIOR = new InjectionToken('msal.behavior');

/**
 * Providers MSAL
 */
const msalProviders: Provider[] = [
  {
    provide: MSAL_CONFIG,
    useValue: msalConfig
  },
  {
    provide: MSAL_SCOPES,
    useValue: msalScopes
  },
  {
    provide: MSAL_ENDPOINTS,
    useValue: msalEndpoints
  },
  {
    provide: MSAL_BEHAVIOR,
    useValue: msalBehavior
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideCharts(withDefaultRegisterables()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: UrlSerializer,
      useClass: EncryptedUrlSerializer
    },
    // MSAL Configuration
    ...msalProviders
  ]
};
