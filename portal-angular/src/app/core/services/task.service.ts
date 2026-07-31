import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserTask {
  id: string;
  name: string;
  assignee: string;
  createTime: string;
  processInstanceId: string;
  processDefinitionId: string;
  taskDefinitionKey: string;
  processName?: string;
  identificacion?: string;
  nombreCompleto?: string;
  numeroCaso?: string;
  monto?: number;
  plazo?: number;
  producto?: string;
  asesor?: string;
  additionalVariables?: { [key: string]: any };
  slaInfo?: {
    hasSla: boolean;
    slaStatus: 'NONE' | 'OK' | 'WARNING' | 'EXPIRED';
    slaDueDateIso?: string;
    timeRemainingMs?: number;
    timeElapsedMs?: number;
    totalDurationMs?: number;
    percentUsed?: number;
    maxDuration?: number;
    timeUnit?: string;
    expiryAction?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.back_url}/api/v1/tasks`;

  getDynamicColumns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/columns`);
  }

  addColumn(col: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/columns`, col);
  }

  deleteColumn(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/columns/${id}`);
  }

  getDbConfig(): Observable<any> {
    return this.http.get<any>('/api/v1/db-config');
  }

  updateDbConfig(config: any): Observable<any> {
    return this.http.post<any>('/api/v1/db-config', config);
  }

  getTasks(assignee?: string): Observable<UserTask[]> {
    const url = assignee ? `${this.apiUrl}?assignee=${assignee}` : this.apiUrl;
    return this.http.get<UserTask[]>(url);
  }

  completeTask(taskId: string, variables: any = {}): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${taskId}/complete`, variables);
  }

  getTaskVariables(taskId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${taskId}/variables`);
  }

  saveTaskVariables(taskId: string, variables: any = {}): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${taskId}/variables`, variables);
  }

  reassignTask(taskId: string, newAssignee: string, requestedBy: string, reason: string): Observable<any> {
    return this.http.post<any>(`${environment.back_url}/api/v1/sla/tasks/${taskId}/reassign`, {
      newAssignee, requestedBy, reason
    });
  }

  delegateTask(taskId: string, delegateTo: string, requestedBy: string, reason: string): Observable<any> {
    return this.http.post<any>(`${environment.back_url}/api/v1/sla/tasks/${taskId}/delegate`, {
      delegateTo, requestedBy, reason
    });
  }
}
