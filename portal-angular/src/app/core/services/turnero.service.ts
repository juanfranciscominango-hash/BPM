import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TuServicio {
  id: number;
  codigo: string;
  nombre: string;
  prefijo: string;
  prioridad: number;
  slaEsperaMinutos: number;
  activo: boolean;
}

export interface TuVentanilla {
  id: number;
  numero: number;
  nombre: string;
  activa: boolean;
}

export interface TuTurno {
  id: number;
  codigoTurno: string;
  secuencia: number;
  identificacionCliente?: string;
  nombreCliente?: string;
  servicio: TuServicio;
  ventanilla?: TuVentanilla;
  usuarioAsesor?: string;
  estado: 'EN_ESPERA' | 'LLAMADO' | 'EN_ATENCION' | 'FINALIZADO' | 'AUSENTE' | 'DERIVADO';
  fechaEmision: string;
  fechaLlamado?: string;
  fechaInicioAtencion?: string;
  fechaFinAtencion?: string;
  observaciones?: string;
}

export interface DisplayTvData {
  llamadoActual: TuTurno | null;
  ultimosLlamados: TuTurno[];
  colaPendiente: TuTurno[];
}

@Injectable({
  providedIn: 'root'
})
export class TurneroService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.back_url}/api/v1/turnero`;

  getServicios(): Observable<TuServicio[]> {
    return this.http.get<TuServicio[]>(`${this.apiUrl}/servicios`);
  }

  getVentanillas(): Observable<TuVentanilla[]> {
    return this.http.get<TuVentanilla[]>(`${this.apiUrl}/ventanillas`);
  }

  emitirTurno(codigoServicio: string, identificacionCliente?: string, nombreCliente?: string): Observable<TuTurno> {
    return this.http.post<TuTurno>(`${this.apiUrl}/emitir`, {
      codigoServicio,
      identificacionCliente: identificacionCliente || '',
      nombreCliente: nombreCliente || ''
    });
  }

  llamarSiguiente(numeroVentanilla: number, usuarioAsesor: string): Observable<TuTurno> {
    return this.http.post<TuTurno>(`${this.apiUrl}/llamar-siguiente`, {
      numeroVentanilla,
      usuarioAsesor
    });
  }

  rellamar(turnoId: number): Observable<TuTurno> {
    return this.http.post<TuTurno>(`${this.apiUrl}/rellamar/${turnoId}`, {});
  }

  iniciarAtencion(turnoId: number): Observable<TuTurno> {
    return this.http.post<TuTurno>(`${this.apiUrl}/iniciar-atencion/${turnoId}`, {});
  }

  finalizarAtencion(turnoId: number, observaciones?: string): Observable<TuTurno> {
    return this.http.post<TuTurno>(`${this.apiUrl}/finalizar/${turnoId}`, { observaciones });
  }

  marcarAusente(turnoId: number): Observable<TuTurno> {
    return this.http.post<TuTurno>(`${this.apiUrl}/ausente/${turnoId}`, {});
  }

  derivarTurno(turnoId: number, nuevoCodigoServicio: string): Observable<TuTurno> {
    return this.http.post<TuTurno>(`${this.apiUrl}/derivar/${turnoId}`, { nuevoCodigoServicio });
  }

  getDisplayTvData(): Observable<DisplayTvData> {
    return this.http.get<DisplayTvData>(`${this.apiUrl}/display-tv`);
  }

  getColaPendiente(): Observable<TuTurno[]> {
    return this.http.get<TuTurno[]>(`${this.apiUrl}/cola`);
  }
}
