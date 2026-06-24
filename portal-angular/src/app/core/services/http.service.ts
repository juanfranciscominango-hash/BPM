import { Injectable, signal, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface ApiOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  // ✨ Angular Signals - Estado reactivo
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private lastRequestSignal = signal<{ url: string; method: string; timestamp: Date } | null>(null);

  // 📖 Read-only signals expuestos al público
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly lastRequest = this.lastRequestSignal.asReadonly();

  constructor(private http: HttpClient) {
    // 🔗 Effect - Reacciona a cambios en el estado de error
    effect(() => {
      const error = this.errorSignal();
      if (error) {
        console.error('🔴 HTTP Error:', error);
      }
    });
  }

  /**
   * Método GET simple
   */
  get<T = any>(url: string, options: ApiOptions = {}): Observable<ApiResponse<T>> {
    const requestOptions = this.buildOptions(options);
    this.loadingSignal.set(true);
    this.lastRequestSignal.set({ url, method: 'GET', timestamp: new Date() });

    return this.http.get(url, requestOptions).pipe(
      map((data: any) => this.createSuccessResponse<T>(data)),
      catchError((error: HttpErrorResponse) => this.handleError<T>(error)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Método POST simple
   */
  post<T = any>(url: string, body: any = null, options: ApiOptions = {}): Observable<ApiResponse<T>> {
    const requestOptions = this.buildOptions(options);
    this.loadingSignal.set(true);
    this.lastRequestSignal.set({ url, method: 'POST', timestamp: new Date() });

    return this.http.post(url, body, requestOptions).pipe(
      map((data: any) => this.createSuccessResponse<T>(data)),
      catchError((error: HttpErrorResponse) => this.handleError<T>(error)),
      finalize(() => this.loadingSignal.set(false))
    );
  }  

  /**
   * Crea respuesta de éxito
   */
  private createSuccessResponse<T>(data: T): ApiResponse<T> {
    this.errorSignal.set(null);
    return {
      success: true,
      data: data,
      statusCode: 200
    };
  }

  /**
   * Construye las opciones de la petición
   */
  private buildOptions(options: ApiOptions): any {
    const requestOptions: any = {
      headers: this.defaultHeaders
    };

    if (options.headers) {
      requestOptions.headers = options.headers;
    }

    if (options.params) {
      requestOptions.params = options.params;
    }

    return requestOptions;
  }

  /**
   * Maneja errores de las peticiones
   */
  private handleError<T>(error: HttpErrorResponse): Observable<ApiResponse<T>> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = this.getErrorMessage(error);
    }

    console.error('❌ HttpService Error:', errorMessage);
    this.errorSignal.set(errorMessage);

    return throwError(() => ({
      success: false,
      error: errorMessage,
      statusCode: error.status
    }));
  }

  /**
   * Obtiene mensaje de error específico
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return 'Datos incorrectos';
      case 401:
        return 'No autorizado';
      case 403:
        return 'Acceso denegado';
      case 404:
        return 'No encontrado';
      case 500:
        return 'Error del servidor';
      default:
        return error.error?.message || `Error ${error.status}`;
    }
  }
}