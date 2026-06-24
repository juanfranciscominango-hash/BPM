import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RuleDefinition {
  id?: number;
  key: string;
  name: string;
  category?: string;
  version?: number;
  dmnXml: string;
  status?: string;
  deploymentId?: string;
  metaEntityId?: number;
  lastUpdated?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RuleService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/rules';

  getRules(): Observable<RuleDefinition[]> {
    return this.http.get<RuleDefinition[]>(this.apiUrl);
  }

  saveRule(rule: RuleDefinition): Observable<RuleDefinition> {
    return this.http.post<RuleDefinition>(this.apiUrl, rule);
  }

  getRuleById(id: number): Observable<RuleDefinition> {
    return this.http.get<RuleDefinition>(`${this.apiUrl}/${id}`);
  }

  deployRule(id: number): Observable<RuleDefinition> {
    return this.http.post<RuleDefinition>(`${this.apiUrl}/${id}/deploy`, {});
  }

  executeRule(key: string, variables: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${key}/execute`, variables);
  }
}
