import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/monitoring';

  getActiveNodes(instanceId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/instance/${instanceId}/active-nodes`);
  }

  getAuditTrail(instanceId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/instance/${instanceId}/audit`);
  }

  getXml(instanceId: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/instance/${instanceId}/xml`, { responseType: 'text' });
  }
}
