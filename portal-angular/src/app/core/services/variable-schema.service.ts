import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProcessVariableSchema {
  id?: number;
  processDefinitionKey: string;
  variableName: string;
  label?: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'OBJECT';
  required: boolean;
  defaultValue?: string;
  description?: string;
  validationExpression?: string;
  validationMessage?: string;
  sortOrder: number;
  active: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  enrichedVariables?: { [key: string]: any };
}

@Injectable({
  providedIn: 'root'
})
export class VariableSchemaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.back_url}/api/v1/variable-schema`;

  getByProcess(processKey: string): Observable<ProcessVariableSchema[]> {
    return this.http.get<ProcessVariableSchema[]>(`${this.apiUrl}/process/${processKey}`);
  }

  getActiveByProcess(processKey: string): Observable<ProcessVariableSchema[]> {
    return this.http.get<ProcessVariableSchema[]>(`${this.apiUrl}/process/${processKey}/active`);
  }

  save(schema: ProcessVariableSchema): Observable<ProcessVariableSchema> {
    if (schema.id) {
      return this.http.put<ProcessVariableSchema>(`${this.apiUrl}/${schema.id}`, schema);
    }
    return this.http.post<ProcessVariableSchema>(this.apiUrl, schema);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  validate(processKey: string, variables: { [key: string]: any }): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(`${this.apiUrl}/validate/${processKey}`, variables);
  }
}
