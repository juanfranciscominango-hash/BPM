export const environment = {
  production: true,
  apiUrl: '/api/v1',
  back_url: '',
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
  }
};