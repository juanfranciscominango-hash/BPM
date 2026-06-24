import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'innova-apis',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './apis.html',
  styleUrl: './apis.scss'
})
export class ApisComponent {
  private http = inject(HttpClient);

  tokenData: any = null;
  isLoadingToken = false;
  tokenError: string | null = null;

  tokenAPIMData: any = null;
  isLoadingTokenAPIM = false;
  tokenAPIMError: string | null = null;

  catalogosData: any = null;
  isLoadingCatalogos = false;
  catalogosError: string | null = null;

  // Variables para guardar token de catálogos
  tokenSesionCatalogos: string | null = null;
  isLoadingTokenCatalogos = false;

  environment = environment;
  ipCliente = '172.20.70.56';
  identificadorGUID = '4f5f54f54f';
  gatewayUrl = 'http://172.20.70.56:3000';

  constructor() {
    console.log('… IP del cliente (hardcodeada):', this.ipCliente);
  }

  // Código de ejemplo para mostrar en la documentación
  componentExampleCode = `import { Component } from '@angular/core';
import { AuthApiService } from '../../../services/auth-api.service';

@Component({
  selector: 'app-auth-component',
  template: \`
    <div class="alert alert-success" *ngIf="tokenData">
      Token obtenido correctamente
    </div>
    <button class="btn btn-primary"
            (click)="getToken()"
            [disabled]="isLoading">
      {{ isLoading ? 'Cargando...' : 'Obtener Token' }}
    </button>
  \`
})
export class AuthComponent {
  tokenData: any = null;
  isLoading = false;

  constructor(private authApi: AuthApiService) {}

  getToken() {
    this.isLoading = true;
    this.authApi.solicitarAutorizacion().subscribe({
      next: (response) => {
        this.tokenData = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.isLoading = false;
      }
    });
  }
}`;

  // Método para obtener token de la API
  obtenerToken() {
    this.isLoadingToken = true;
    this.tokenError = null;

    // Construir URL completa del backend
    const baseUrl = environment.CentralizadaMs.ApiUrl;
    const endpoint = environment.CentralizadaMs.SolicitarAutorizacion;
    const apiUrl = `${baseUrl}${endpoint}`;

    const body = {
      auditoria: {
        ipCliente: "ObtenerIPCliente",
        aplicacion: "PlantillaAngular"
      },
      datosIniciarSesion: {
        nombreAplicacion: environment.CentralizadaMs.NameAplication,
        apiKeySistema: environment.CentralizadaMs.ApiKeySistema
      }
    };

    console.log(' Consumiendo API a través del Gateway...');
    console.log('URL destino:', apiUrl);
    console.log('Body:', body);

    // Usar el Gateway como proxy
    const gatewayUrl = `${this.gatewayUrl}/proxy/request`;
    const proxyBody = {
      url: apiUrl,
      method: 'POST',
      data: body,
      headers: {}
    };

    this.http.post<any>(gatewayUrl, proxyBody)
      .subscribe({
        next: (response: any) => {
          console.log('… Respuesta exitosa:', response);
          this.tokenData = response.data || response;
          this.isLoadingToken = false;
        },
        error: (error: any) => {
          console.error('Œ Error:', error.message);
          this.tokenError = `Error: ${error.message || 'Error desconocido'}`;
          this.isLoadingToken = false;
        }
      });
  }

  // Método para obtener token APIM
  obtenerTokenAPIM() {
    this.isLoadingTokenAPIM = true;
    this.tokenAPIMError = null;

    const apiUrl = `${(environment as any).ConsumoApiGenerarTokenAPIM.ApiUrl}api/acceso/servicios/solicitar`;

    const body = {
      auditoria: {
        ipCliente: this.ipCliente || 'localhost',
        aplicacion: 'ClientePruebas'
      },
      datosIniciarSesion: {
        nombreAplicacion: (environment as any).ConsumoApiGenerarTokenAPIM.NameAplication,
        apiKeySistema: (environment as any).ConsumoApiGenerarTokenAPIM.ApiKeySistema
      }
    };

    console.log(' Consumiendo APIM a través del Gateway...');
    console.log('URL destino:', apiUrl);
    console.log('Body:', body);

    // Usar el Gateway como proxy
    const gatewayUrl = `${this.gatewayUrl}/proxy/request`;
    const proxyBody = {
      url: apiUrl,
      method: 'POST',
      data: body,
      headers: {}
    };

    this.http.post<any>(gatewayUrl, proxyBody)
      .subscribe({
        next: (response: any) => {
          console.log('… Respuesta APIM:', response);
          this.tokenAPIMData = response.data || response;
          this.isLoadingTokenAPIM = false;
        },
        error: (error: any) => {
          console.error('Œ Error APIM:', error.message);
          this.tokenAPIMError = `Error: ${error.message || 'Error desconocido'}`;
          this.isLoadingTokenAPIM = false;
        }
      });
  }

  // Método para consultar catálogos generales con flujo de token
  consultarCatalogos() {
    console.log('\n' + '='.repeat(80));
    console.log('€ INICIANDO FLUJO: OBTENER TOKEN + CONSUMIR CATLOGOS');
    console.log('='.repeat(80));
    
    this.isLoadingCatalogos = true;
    this.catalogosError = null;

    console.log('‹ Paso 1: Iniciando obtención de token APIM...');

    // Paso 1: Obtener token APIM
    this.obtenerTokenAPIMParaCatalogos();
  }

  // Método privado para obtener token APIM para catálogos
  private obtenerTokenAPIMParaCatalogos() {
    this.isLoadingTokenCatalogos = true;

    const apiUrl = `${(environment as any).ConsumoApiGenerarTokenAPIM.ApiUrl}api/acceso/servicios/solicitar`;

    const body = {
      auditoria: {
        ipCliente: this.ipCliente || 'localhost',
        aplicacion: 'ClientePruebas'
      },
      datosIniciarSesion: {
        nombreAplicacion: (environment as any).ConsumoApiGenerarTokenAPIM.NameAplication,
        apiKeySistema: (environment as any).ConsumoApiGenerarTokenAPIM.ApiKeySistema
      }
    };

    console.log('\n' + '-'.repeat(80));
    console.log(' PASO 1: OBTENER TOKEN APIM');
    console.log('-'.repeat(80));
    console.log(' API URL:', apiUrl);
    console.log('¤ Body enviado:', JSON.stringify(body, null, 2));

    const gatewayUrl = `${this.gatewayUrl}/proxy/request`;
    const proxyBody = {
      url: apiUrl,
      method: 'POST',
      data: body,
      headers: {}
    };

    this.http.post<any>(gatewayUrl, proxyBody)
      .subscribe({
        next: (response: any) => {
          console.log('\n… RESPUESTA DEL TOKEN RECIBIDA');
          console.log('¦ JSON de Respuesta Completa:');
          console.log(JSON.stringify(response, null, 2));
          
          // Extraer token de la respuesta del gateway
          let tokenFound: string | null = null;
          let responseData = response;
          
          console.log('\n Extrayendo token...');
          
          // El gateway puede devolver el token en varios formatos
          if (responseData?.respuestaToken?.tokenSesion) {
            console.log('… Token encontrado en: responseData.respuestaToken.tokenSesion');
            tokenFound = responseData.respuestaToken.tokenSesion;
          } else if (responseData?.tokenSesion) {
            console.log('… Token encontrado en: responseData.tokenSesion');
            tokenFound = responseData.tokenSesion;
          } else if (responseData?.token) {
            console.log('… Token encontrado en: responseData.token');
            tokenFound = responseData.token;
          } else if (responseData?.access_token) {
            console.log('… Token encontrado en: responseData.access_token');
            tokenFound = responseData.access_token;
          } else if (typeof responseData === 'string' && responseData.length > 10) {
            console.log('… Response es un string, usando como token');
            tokenFound = responseData;
          }
          
          this.tokenSesionCatalogos = tokenFound;
          console.log('\n¾ Token final extraído:', this.tokenSesionCatalogos);
          
          if (!this.tokenSesionCatalogos) {
            console.warn('\nš ¸ Œ NO SE ENCONTR“ EL TOKEN EN LA RESPUESTA');
            console.warn('‹ Respuesta completa:', JSON.stringify(response, null, 2));
            
            this.catalogosError = 'No se pudo extraer el token. Revisa la consola.';
            this.isLoadingCatalogos = false;
            this.isLoadingTokenCatalogos = false;
            return;
          }
          
          console.log('\n¨ … Token guardado exitosamente');
          console.log('€ Procediendo al Paso 2: Consultar Catálogos...');
          
          // Paso 2: Consumir catálogos con el token
          this.consultarCatalogosConToken();
          this.isLoadingTokenCatalogos = false;
        },
        error: (error: any) => {
          console.error('\nŒ ERROR OBTENIENDO TOKEN');
          console.error('´ Error:', error.message);
          console.error('Š Status:', error.status);
          console.error('¦ Respuesta de error:');
          console.error(JSON.stringify(error.error, null, 2));
          this.catalogosError = `Error al obtener token: ${error.message}`;
          this.isLoadingCatalogos = false;
          this.isLoadingTokenCatalogos = false;
        }
      });
  }

  // Método privado para consultar catálogos con token
  private consultarCatalogosConToken() {
    if (!this.tokenSesionCatalogos) {
      console.error('Œ No hay token disponible para consultar catálogos');
      this.catalogosError = 'No hay token disponible para consultar catálogos';
      this.isLoadingCatalogos = false;
      return;
    }

    const apiUrl = `${(environment as any).ConsumoApiCatalogosGeneralesAPIM.ApiUrl}${(environment as any).ConsumoApiCatalogosGeneralesAPIM.metodo}`;

    const body = {
      auditoria: {
        usuario: 'PlantillaAngular',
        fecha: new Date().toISOString(),
        ipCliente: this.ipCliente,
        hashMobil: '',
        celular: '',
        identificacion: '',
        codigoCanal: '2',
        codigoTransaccion: '27',
        codigoMedioInvocacion: '34',
        identificadorUnicoOperacional: '',
        identificadorGUID: this.identificadorGUID,
        idAplicacionCliente: '',
        codigoAgencia: '',
        codigoCentro: ''
      },
      datosCanal: {
        parametro: 'PE34CNAE',
        parametroAdicional: '',
        proceso: 'GENERAL',
        codigoRepositorio: '1'
      }
    };

    console.log('\n' + '-'.repeat(80));
    console.log('‹ PASO 2: CONSULTAR CATLOGOS APIM');
    console.log('-'.repeat(80));
    console.log(' API URL:', apiUrl);
    console.log(' Token a usar:', this.tokenSesionCatalogos);
    console.log('¤ Body enviado:', JSON.stringify(body, null, 2));

    const gatewayUrl = `${this.gatewayUrl}/proxy/request`;
    const proxyBody = {
      url: apiUrl,
      method: 'POST',
      data: body,
      headers: {
        'Authorization': `Bearer ${this.tokenSesionCatalogos}`,
        'Content-Type': 'application/json'
      }
    };

    this.http.post<any>(gatewayUrl, proxyBody)
      .subscribe({
        next: (response: any) => {
          console.log('\n… RESPUESTA DEL CATLOGO RECIBIDA');
          console.log('¦ JSON de Respuesta Completa:');
          console.log(JSON.stringify(response, null, 2));
          
          this.catalogosData = response.data || response;
          console.log('\n¾ Catálogos almacenados en componente');
          this.isLoadingCatalogos = false;
        },
        error: (error: any) => {
          console.error('\nŒ ERROR CONSULTANDO CATLOGOS');
          console.error('´ Error:', error.message);
          console.error('Š Status:', error.status);
          console.error('¦ Respuesta de error:', error.error);
          this.catalogosError = `Error: ${error.message || 'Error desconocido'}`;
          this.isLoadingCatalogos = false;
        }
      });
  }
}

