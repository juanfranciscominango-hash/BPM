import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProcessInstance {
  id: string;
  processDefinitionId: string;
  processDefinitionKey: string;
  processDefinitionName: string;
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  startTime: string;
  endTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InstanceService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/instances';

  getActiveInstances(): Observable<ProcessInstance[]> {
    return this.http.get<ProcessInstance[]>(`${this.apiUrl}/active`);
  }

  getHistoryInstances(): Observable<ProcessInstance[]> {
    return this.http.get<ProcessInstance[]>(`${this.apiUrl}/history`);
  }

  getActiveActivities(instanceId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${instanceId}/active-activities`);
  }

  getInstance(instanceId: string): Observable<ProcessInstance> {
    return this.http.get<ProcessInstance>(`${this.apiUrl}/${instanceId}`);
  }
}
