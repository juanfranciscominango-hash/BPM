import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CaseQueryRequest {
  processDefinitionKey?: string;
  status?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  startedBy?: string;
  currentAssignee?: string;
  variables?: { [key: string]: any };
  start?: number;
  size?: number;
}

export interface CaseQueryResult {
  processInstanceId: string;
  processDefinitionKey: string;
  processDefinitionName: string;
  startedBy: string;
  startTime: Date;
  endTime?: Date;
  currentAssignee?: string;
  variables: { [key: string]: any };
}

export interface QueryFormField {
  id: string;
  label: string;
  type: string;
  default: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DynamicQueryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.back_url}/api/queries/cases`;
  private formsApiUrl = `${environment.back_url}/api/queries/forms`;

  executeCaseQuery(request: CaseQueryRequest): Observable<CaseQueryResult[]> {
    return this.http.post<CaseQueryResult[]>(this.apiUrl, request);
  }

  getDefaultForm(): Observable<{schemaJson: string}> {
    return this.http.get<{schemaJson: string}>(`${this.formsApiUrl}/default`);
  }

  saveForm(fields: QueryFormField[]): Observable<any> {
    const payload = { schemaJson: JSON.stringify(fields) };
    return this.http.post(this.formsApiUrl, payload);
  }
}
