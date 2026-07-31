import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProcessErrorLog {
  id?: number;
  processInstanceId: string;
  processDefinitionKey?: string;
  taskId?: string;
  taskName?: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  status: string;
  retryCount: number;
  maxRetries: number;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProcessErrorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.back_url}/api/v1/process-errors`;

  getByInstance(instanceId: string): Observable<ProcessErrorLog[]> {
    return this.http.get<ProcessErrorLog[]>(`${this.apiUrl}/instance/${instanceId}`);
  }

  getPending(): Observable<ProcessErrorLog[]> {
    return this.http.get<ProcessErrorLog[]>(`${this.apiUrl}/pending`);
  }

  retryError(id: number, username: string): Observable<ProcessErrorLog> {
    return this.http.post<ProcessErrorLog>(`${this.apiUrl}/${id}/retry`, { username });
  }

  resolveError(id: number, username: string, notes: string): Observable<ProcessErrorLog> {
    return this.http.post<ProcessErrorLog>(`${this.apiUrl}/${id}/resolve`, { username, notes });
  }
  
  ignoreError(id: number, username: string, notes: string): Observable<ProcessErrorLog> {
    return this.http.post<ProcessErrorLog>(`${this.apiUrl}/${id}/ignore`, { username, notes });
  }
}
