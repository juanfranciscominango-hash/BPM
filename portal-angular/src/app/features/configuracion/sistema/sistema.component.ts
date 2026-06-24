import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'innova-sistema',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sistema.html',
  styleUrl: './sistema.scss'
})
export class SistemaComponent {
  tokenData: any = null;
  isLoadingToken = false;
  tokenError: string | null = null;

  // Información para mostrar cómo se construye la petición
  apiUrl = (environment as any).CentralizadaMs.configApiUrl + (environment as any).CentralizadaMs.SolicitarAutorizacion;
  requestBody = {
    auditoria: {
      ipCliente: 'ObtenerIPCliente',
      aplicacion: 'PlantillaAngular'
    },
    datosIniciarSesion: {
      nombreAplicacion: (environment as any).CentralizadaMs.NameAplication,
      apiKeySistema: (environment as any).CentralizadaMs.ApiKeySistema
    }
  };

  constructor(private http: HttpClient) {}

  solicitarToken() {
    this.isLoadingToken = true;
    this.tokenError = null;

    const url = this.apiUrl;
    const body = this.requestBody;

    this.http.post(url, body)
      .pipe(
        timeout(30000) // 30 segundos de timeout
      )
      .subscribe({
        next: (response: any) => {
          this.tokenData = response;
          this.isLoadingToken = false;
        },
        error: (error: any) => {
          let errorMessage = 'Error al obtener el token';

          if (error.message && error.message.includes('Timeout')) {
            errorMessage = 'La petición tardó demasiado tiempo (timeout de 30 segundos)';
          } else if (error.status === 0) {
            errorMessage = 'No se pudo conectar al servidor. Verifique la conexión de red.';
          } else if (error.status >= 400 && error.status < 500) {
            errorMessage = `Error del cliente (${error.status}): ${error.error?.message || error.message}`;
          } else if (error.status >= 500) {
            errorMessage = `Error del servidor (${error.status}): ${error.error?.message || error.message}`;
          } else {
            errorMessage = error.error?.message || error.message || errorMessage;
          }

          this.tokenError = errorMessage;
          this.isLoadingToken = false;
        }
      });
  }
}
