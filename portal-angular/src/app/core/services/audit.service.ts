import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLog {
  id: number;
  fechaHora: string;
  usuario: string;
  accion: string;
  nombreEntidad?: string;
  idEntidad?: string;
  direccionIp: string;
  detalles?: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/audit';

  getLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl);
  }
}
