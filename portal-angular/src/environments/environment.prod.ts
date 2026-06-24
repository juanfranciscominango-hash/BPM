export const environment = {
  production: true,
  apiUrl: '/api/v1',
  envName: 'production', 
  msalConfig: {
    auth:{
      clientId: '9a92e83c-15f4-45f9-9cab-3784b9123451',
      tenantId: '5403bb85-6bc3-495d-8a5e-1a61c622dd74',
      redirectUri: '',
      authority: 'https://login.microsoftonline.com/5403bb85-6bc3-495d-8a5e-1a61c622dd74',
      postLogoutRedirectUri: ''
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
    ApiUrl: '',
    ApiKeySistema: '',
    NameAplication: '',
    ApiUrlDCA: '',
    SolicitarAutorizacion: 'api/Autenticacion/SolicitarAutorizacion',
    ObtenerConfiguracionesAplicacion: 'api/Configuraciones/ObtenerConfiguracionesAplicacion'
  },
  ConsumoApiGenerarToken: {
    ApiUrl: '',
    metodo: '',
    ApiKeySistema: '/7WzL6aE2Nbmhqjys6ults5XbFdX8AvEH0+2fXREiz0ixvN/kT5KJ90irXuY6qexMEbrpI7DeFgCvDshA2uXKfHnrIPZTJblGB0qdmwNEL3LUE/Ff/d1d1puMPjjH71zRBa4jSfv+QHrl4dz2DoR5w==',
    NameAplication: 'WzJMS3viVuEYDTHB9NqGT7uAdrqzIsdc37hvxljCrkRPSEhHY5Mbj52hOZvU3Fbf'
  }
};