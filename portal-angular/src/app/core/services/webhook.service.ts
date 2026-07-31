import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WebhookConfig {
  id?: number;
  processDefinitionKey?: string;
  url: string;
  secretKey?: string;
  events: string;
  active: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebhookService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.back_url}/api/v1/webhooks`;

  getAll(): Observable<WebhookConfig[]> {
    return this.http.get<WebhookConfig[]>(this.apiUrl);
  }

  create(config: WebhookConfig): Observable<WebhookConfig> {
    return this.http.post<WebhookConfig>(this.apiUrl, config);
  }

  update(id: number, config: WebhookConfig): Observable<WebhookConfig> {
    return this.http.put<WebhookConfig>(`${this.apiUrl}/${id}`, config);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
