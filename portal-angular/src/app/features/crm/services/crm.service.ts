import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Asesor {
  id?: number;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  activo?: boolean;
}

export interface OrigenLead {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface Campana {
  id?: number;
  codigoCampana?: string;
  nombre: string;
  estado: string;
  fechaInicio?: string;
  fechaFin?: string;
  presupuestoAsignado?: number;
  presupuestoEjecutado?: number;
  leadsGenerados?: number;
  conversiones?: number;
  tasaApertura?: string;
  roi?: string;
}

export interface DeudaExterna {
  id?: number;
  entidad: string;
  saldo: number;
  producto?: string;
}

export interface TarjetaCredito {
  id?: number;
  entidad: string;
  saldoActual: number;
  cupoTotal: number;
}

export interface PerfilFinanciero {
  id?: number;
  ingresosMensuales?: number;
  valorMaximoPrestamo?: number;
  valorMaximoEndeudamiento?: number;
  cuotaEstimadaMensual?: number;
  deudasOtrasEntidades?: DeudaExterna[];
  tarjetasCredito?: TarjetaCredito[];
}

export interface Lead {
  id?: number;
  nombresCompletos: string;
  identificacion?: string;
  empresa?: string;
  telefono?: string;
  email?: string;
  estado: string; // FRIO, TIBIO, CALIENTE, CONVERTIDO, DESCARTADO
  montoEstimado?: number;
  AsesorAsignado?: Asesor;
  origen?: OrigenLead;
  campana?: Campana;
  referencia?: string;
  perfilFinanciero?: PerfilFinanciero;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadInteraction {
  id?: number;
  tipo: string;
  resumen: string;
  fecha?: string;
}

export interface LeadTask {
  id?: number;
  descripcion: string;
  fechaVencimiento: string;
  completada?: boolean;
  externalCalendarEventId?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CrmService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/crm`;

  getLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.apiUrl}/leads`);
  }

  getLeadById(id: number): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/leads/${id}`);
  }

  createLead(lead: any): Observable<Lead> {
    return this.http.post<Lead>(`${this.apiUrl}/leads`, lead);
  }

  updateLead(id: number, lead: any): Observable<Lead> {
    return this.http.put<Lead>(`${this.apiUrl}/leads/${id}`, lead);
  }

  getCampanas(): Observable<Campana[]> {
    return this.http.get<Campana[]>(`${this.apiUrl}/campanas`);
  }

  syncPerfilFinanciero(leadId: number): Observable<PerfilFinanciero> {
    return this.http.post<PerfilFinanciero>(`${this.apiUrl}/leads/${leadId}/sync-perfil`, {});
  }

  enviarEmail(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/prospectos/${id}/email`, {});
  }

  getInteractions(leadId: number): Observable<LeadInteraction[]> {
    return this.http.get<LeadInteraction[]>(`${this.apiUrl}/leads/${leadId}/interactions`);
  }

  addInteraction(leadId: number, interaction: any): Observable<LeadInteraction> {
    return this.http.post<LeadInteraction>(`${this.apiUrl}/leads/${leadId}/interactions`, interaction);
  }

  getTasks(leadId: number): Observable<LeadTask[]> {
    return this.http.get<LeadTask[]>(`${this.apiUrl}/leads/${leadId}/tasks`);
  }

  addTask(leadId: number, task: any): Observable<LeadTask> {
    return this.http.post<LeadTask>(`${this.apiUrl}/leads/${leadId}/tasks`, task);
  }

  completeTask(taskId: number): Observable<LeadTask> {
    return this.http.put<LeadTask>(`${this.apiUrl}/tasks/${taskId}/complete`, {});
  }

  getAsesores(): Observable<Asesor[]> {
    return this.http.get<Asesor[]>(`${this.apiUrl}/Asesores`);
  }

  getOrigenes(): Observable<OrigenLead[]> {
    return this.http.get<OrigenLead[]>(`${this.apiUrl}/origenes`);
  }

  getAnalyticsLeadsByStatus(): Observable<{name: string, value: number}[]> {
    return this.http.get<{name: string, value: number}[]>(`${this.apiUrl}/analytics/leads-by-status`);
  }

  getAnalyticsLeadsByOrigin(): Observable<{name: string, value: number}[]> {
    return this.http.get<{name: string, value: number}[]>(`${this.apiUrl}/analytics/leads-by-origin`);
  }
}

