export const environment = {
  apiUrl: '/api/v1',
  production: false,
  envName: 'development',    
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
    ApiUrl: 'https://172.20.41.169:8043/InnovaConsultingAccesoServiciosApi/',
    ApiKeySistema: '/7WzL6aE2Nbmhqjys6ults5XbFdX8AvEH0+2fXREiz0ixvN/kT5KJ90irXuY6qexMEbrpI7DeFgCvDshA2uXKfHnrIPZTJblGB0qdmwNEL3LUE/Ff/d1d1puMPjjH71zRBa4jSfv+QHrl4dz2DoR5w==',
    NameAplication: 'WzJMS3viVuEYDTHB9NqGT7uAdrqzIsdc37hvxljCrkRPSEhHY5Mbj52hOZvU3Fbf',
    ApiUrlDCA: 'https://172.20.41.169:8043/InnovaConsultingAccesoServiciosApi/',
    SolicitarAutorizacion: 'api/Autenticacion/SolicitarAutorizacion',
    ObtenerConfiguracionesAplicacion: 'api/Configuraciones/ObtenerConfiguracionesAplicacion'
  },
  ConsumoApiGenerarToken: {
    ApiUrl: 'https://ECBRDSW12.InnovaConsulting.COM:8043/InnovaConsultingAccesoServiciosApi/',
    metodo: 'api/Autenticacion/SolicitarAutorizacion',
    ApiKeySistema: '/7WzL6aE2Nbmhqjys6ults5XbFdX8AvEH0+2fXREiz0ixvN/kT5KJ90irXuY6qexMEbrpI7DeFgCvDshA2uXKfHnrIPZTJblGB0qdmwNEL3LUE/Ff/d1d1puMPjjH71zRBa4jSfv+QHrl4dz2DoR5w==',
    NameAplication: 'WzJMS3viVuEYDTHB9NqGT7uAdrqzIsdc37hvxljCrkRPSEhHY5Mbj52hOZvU3Fbf'
  },
  ConsumoApiGenerarTokenAPIM: {
    ApiUrl: 'https://apis-test.bgr.com.ec/',
    metodo: 'api/acceso/servicios/solicitar',
    ApiKeySistema: 'ROjDOu3Bx2jz3B2Z1YrotCC09ncsxmFM7EkWxuKStVDMsKKhYU5nKpwkwXwNo733yhvm1e8gkXRY2qZ80+KgxXe14l67E243LCnOnZko6cZZwXiqnn0im05M4LjS1SyBNkwhEYtDUXu0kDPJa2PbYg==',
    NameAplication: '8srvf1vW0q8B1zOBbUqfgM9I83pMowyRf6UKqCUIGyzh/WkPcMtdf4BWprBZcZgV'
  },
  ConsumoApiCatalogosGenerales: {
    ApiUrl: 'https://ECBRDSW12.InnovaConsulting.COM:8043/MSApiCatalogosGenerales/',
    metodo: 'api/CatalogosGenerales/Consultar'
  },
  ConsumoApiCatalogosGeneralesAPIM: {
    ApiUrl: 'https://apis-test.bgr.com.ec/',
    metodo: 'api/instituciones/catalogo/v1/consultar'
  }
};