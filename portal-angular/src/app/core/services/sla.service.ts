import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TaskSlaConfig {
  id?: number;
  processDefinitionKey: string;
  taskDefinitionKey: string;
  taskName?: string;
  maxDuration: number;
  timeUnit: 'MINUTES' | 'HOURS' | 'DAYS';
  warningThresholdPct: number;
  expiryAction: 'NOTIFY_SUPERVISOR' | 'REASSIGN' | 'ESCALATE';
  escalationTarget?: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SlaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.back_url}/api/v1/sla`;

  getConfigs(): Observable<TaskSlaConfig[]> {
    return this.http.get<TaskSlaConfig[]>(`${this.apiUrl}/configs`);
  }

  getConfigsByProcess(processKey: string): Observable<TaskSlaConfig[]> {
    return this.http.get<TaskSlaConfig[]>(`${this.apiUrl}/configs/process/${processKey}`);
  }

  saveConfig(config: TaskSlaConfig): Observable<TaskSlaConfig> {
    if (config.id) {
      return this.http.put<TaskSlaConfig>(`${this.apiUrl}/configs/${config.id}`, config);
    }
    return this.http.post<TaskSlaConfig>(`${this.apiUrl}/configs`, config);
  }

  deleteConfig(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/configs/${id}`);
  }

  forceCheck(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/check-expired`, {});
  }
}
