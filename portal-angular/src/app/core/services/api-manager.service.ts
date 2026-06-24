import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiDefinition {
  id?: number;
  name: string;
  url: string;
  method: string;
  headersJson?: string;
  bodyTemplate?: string;
  responseMapping?: string;
}

export interface ExternalProcess {
  id?: number;
  code: string;
  description: string;
  referenceType: string;
  processType: string;
  tramaTypes: string;
  systemName?: string;
}

export interface TramaField {
  id?: number;
  processId: number;
  tramaType: string; // INPUT, OUTPUT
  name: string;
  parentId?: number | null;
  defaultAssignment?: string;
  defaultValue?: string;
  selectQuery?: string;
  maxOccurrenceAction?: string;
  maxOccurrenceNumber?: number;
  minOccurrenceAction?: string;
  minOccurrenceNumber?: number;
  encodeSpecialChars?: boolean;
  includeCdata?: boolean;
  transformBase64?: boolean;
  omitIfNull?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiManagerService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/api-manager';

  getDefinitions(): Observable<ApiDefinition[]> {
    return this.http.get<ApiDefinition[]>(`${this.apiUrl}/definitions`);
  }

  saveDefinition(api: ApiDefinition): Observable<ApiDefinition> {
    return this.http.post<ApiDefinition>(`${this.apiUrl}/definitions`, api);
  }

  testApi(apiName: string, variables: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/test/${apiName}`, variables);
  }

  // Procesos Externos
  getProcesses(): Observable<ExternalProcess[]> {
    return this.http.get<ExternalProcess[]>(`${this.apiUrl}/processes`);
  }

  saveProcess(process: ExternalProcess): Observable<ExternalProcess> {
    return this.http.post<ExternalProcess>(`${this.apiUrl}/processes`, process);
  }

  deleteProcess(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/processes/${id}`);
  }

  // Tramas de Campos
  getTramas(processId: number, type?: string): Observable<TramaField[]> {
    let url = `${this.apiUrl}/processes/${processId}/tramas`;
    if (type) url += `?type=${type}`;
    return this.http.get<TramaField[]>(url);
  }

  saveTramaField(field: TramaField): Observable<TramaField> {
    return this.http.post<TramaField>(`${this.apiUrl}/tramas/fields`, field);
  }

  deleteTramaField(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tramas/fields/${id}`);
  }
}
