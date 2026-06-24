import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProcessDefinition {
  id?: number;
  key: string;
  name: string;
  category?: string;
  version?: number;
  bpmnXml: string;
  status?: string;
  deploymentId?: string;
  procDefId?: string;
  metaEntityId?: number;
  lastUpdated?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/processes';

  getProcesses(): Observable<ProcessDefinition[]> {
    return this.http.get<ProcessDefinition[]>(this.apiUrl);
  }

  saveProcess(process: ProcessDefinition): Observable<ProcessDefinition> {
    return this.http.post<ProcessDefinition>(this.apiUrl, process);
  }

  getProcessById(id: number): Observable<ProcessDefinition> {
    return this.http.get<ProcessDefinition>(`${this.apiUrl}/${id}`);
  }

  getProcessByProcDefId(procDefId: string): Observable<ProcessDefinition> {
    return this.http.get<ProcessDefinition>(`${this.apiUrl}/definition/${procDefId}`);
  }

  deployProcess(id: number): Observable<ProcessDefinition> {
    return this.http.post<ProcessDefinition>(`${this.apiUrl}/${id}/deploy`, {});
  }

  startInstance(key: string, variables: any = {}): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${key}/start`, variables);
  }
}
