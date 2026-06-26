import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/tasks';

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
}
