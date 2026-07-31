import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TaskActionRule {
  id?: number;
  processDefinitionKey: string;
  taskDefinitionKey: string;
  taskName?: string;
  eventTrigger: 'ON_ENTER' | 'ON_SAVE' | 'ON_EXIT';
  actionType: 'EXPRESSION' | 'VALIDATION' | 'ASSIGNMENT' | 'NOTIFICATION' | 'API_CALL';
  ruleName: string;
  conditionExpression?: string;
  actionExpression: string;
  errorMessage?: string;
  targetUser?: string;
  targetVariable?: string;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskActionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.back_url}/api/v1/task-actions`;

  getByProcess(processKey: string): Observable<TaskActionRule[]> {
    return this.http.get<TaskActionRule[]>(`${this.apiUrl}/process/${processKey}`);
  }

  getByTask(processKey: string, taskKey: string): Observable<TaskActionRule[]> {
    return this.http.get<TaskActionRule[]>(`${this.apiUrl}/process/${processKey}/task/${taskKey}`);
  }

  getById(id: number): Observable<TaskActionRule> {
    return this.http.get<TaskActionRule>(`${this.apiUrl}/${id}`);
  }

  create(rule: TaskActionRule): Observable<TaskActionRule> {
    return this.http.post<TaskActionRule>(this.apiUrl, rule);
  }

  update(id: number, rule: TaskActionRule): Observable<TaskActionRule> {
    return this.http.put<TaskActionRule>(`${this.apiUrl}/${id}`, rule);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  evaluateEvent(eventTrigger: string, processDefKey: string, taskDefKey: string, taskId: string, variables: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/evaluate/${eventTrigger}/${processDefKey}/${taskDefKey}/${taskId}`, variables);
  }
}

