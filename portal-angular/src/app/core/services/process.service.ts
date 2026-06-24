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

export interface TimelineItem {
  id: string;
  name: string;
  assignee: string;
  startTime: string;
  endTime: string;
  state: string; // 'ACTIVE' | 'COMPLETED'
}

export interface TrackingItem {
  id: string;
  name: string;
  assignee: string;
  startTime: string;
  endTime: string;
  claimTime: string;
  state: string;
  respuesta: string;
  observaciones: string;
  situacion: string;
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

  deleteInstance(instanceId: string, reason: string = 'Cancelled by user'): Observable<void> {
    return this.http.delete<void>(`/api/v1/instances/${instanceId}?reason=${encodeURIComponent(reason)}`);
  }

  getActiveActivities(instanceId: string): Observable<string[]> {
    return this.http.get<string[]>(`/api/v1/instances/${instanceId}/active-activities`);
  }

  getHistoryActivities(instanceId: string): Observable<string[]> {
    return this.http.get<string[]>(`/api/v1/instances/${instanceId}/history-activities`);
  }

  getTimeline(instanceId: string): Observable<TimelineItem[]> {
    return this.http.get<TimelineItem[]>(`/api/v1/instances/${instanceId}/timeline`);
  }

  getTracking(instanceId: string): Observable<TrackingItem[]> {
    return this.http.get<TrackingItem[]>(`/api/v1/instances/${instanceId}/tracking`);
  }
}
