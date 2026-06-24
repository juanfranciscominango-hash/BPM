export const environment = {
  apiUrl: '/api/v1',
  production: false,
  envName: 'staging',
  msalConfig: {
    auth:{
      clientId: '9a92e83c-15f4-45f9-9cab-3784b9123451',
      tenantId: '5403bb85-6bc3-495d-8a5e-1a61c622dd74',
      redirectUri: 'http://localhost:4201/auth/callback',
      authority: 'https://login.microsoftonline.com/5403bb85-6bc3-495d-8a5e-1a61c622dd74',
      postLogoutRedirectUri: 'http://localhost:4201/login'
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
      secureCookies: false
    },
    system: {
      allowNativeBroker: false,
      allowRedirectInIframe: false,
      preventCorsPreflight: true,
      loggerOptions: {
        loggerCallback: (level: any, message: string, containsPii: boolean) => {
          if (!containsPii) {
            console.log(`MSAL: ${message}`);
          }
        },
        piiLoggingEnabled: false,
        logLevel: 3 // Info level
      },
      windowHashTimeout: 15000,
      iframeHashTimeout: 15000,
      loadFrameTimeout: 15000,
      navigateFrameWait: 2000,
      redirectNavigationTimeout: 30000,
      asyncPopups: false
    }
  }, 
  // Scopes para la aplicación
  msalScopes: {
    loginRequest: {
      scopes: ['User.Read', 'openid', 'profile', 'email']
    }
  }, 
  CentralizadaMs: {
    ApiUrl: 'https://ecbrtsncapi.bgr.com:8043/InnovaConsultingSeguridadCentralApi/',
    ApiKeySistema: 'XrVWllvgVF2mK0F+gj+ECS6B3GZVMVSdd962SnOVISskN5Y48TC3xkQVdEbAaYon6nbIMn4EK/MTukiLmlbvxqt7gaXwG54uWTNo2CJjozHgD2TX4eZeia0Fsxqu/g3ZSJli/oJmRX5cHPg1DPTdFQ==',
    NameAplication: 'TaMnzp5wnKhNy7t1LwWS7UIFtFAi0WfLzArj6vwJkGfdsptVPH06y141jHfs/GNV',
    ApiUrlDCA: 'https://ecbrtsncapi.bgr.com:8043/InnovaConsultingSeguridadCentralApi/',
    SolicitarAutorizacion: 'api/Autenticacion/SolicitarAutorizacion',
    ObtenerConfiguracionesAplicacion: 'api/Configuraciones/ObtenerConfiguracionesAplicacion'
  },
  ConsumoApiGenerarToken: {
    ApiUrl: 'https://ecbrtsncapi.bgr.com:8043/InnovaConsultingSeguridadCentralApi/',
    metodo: 'api/acceso/servicios/solicitar',
    ApiKeySistema: 'XrVWllvgVF2mK0F+gj+ECS6B3GZVMVSdd962SnOVISskN5Y48TC3xkQVdEbAaYon6nbIMn4EK/MTukiLmlbvxqt7gaXwG54uWTNo2CJjozHgD2TX4eZeia0Fsxqu/g3ZSJli/oJmRX5cHPg1DPTdFQ==',
    NameAplication: 'TaMnzp5wnKhNy7t1LwWS7UIFtFAi0WfLzArj6vwJkGfdsptVPH06y141jHfs/GNV'
  },
  ConsumoApiCatalogosGenerales: {
    ApiUrl: 'https://apis-staging.bgr.com.ec/',
    metodo: 'api/instituciones/catalogo/v1/consultar'
  }
};