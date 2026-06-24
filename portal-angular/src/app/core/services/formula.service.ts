import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FormulaDefinition {
  id?: number;
  key: string;
  name: string;
  description: string;
  version?: number;
  author?: string;
  expression: string;
  canvasJson: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormulaHistory {
  id: number;
  formulaDefinitionId: number;
  key: string;
  name: string;
  description: string;
  version: number;
  author: string;
  expression: string;
  canvasJson: string;
  archivedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormulaService {
  private apiUrl = environment.apiUrl + '/formulas';

  constructor(private http: HttpClient) {}

  getAllFormulas(): Observable<FormulaDefinition[]> {
    return this.http.get<FormulaDefinition[]>(this.apiUrl);
  }

  getFormula(id: number): Observable<FormulaDefinition> {
    return this.http.get<FormulaDefinition>(`${this.apiUrl}/${id}`);
  }

  getFormulaHistory(id: number): Observable<FormulaHistory[]> {
    return this.http.get<FormulaHistory[]>(`${this.apiUrl}/${id}/history`);
  }

  createFormula(formula: FormulaDefinition): Observable<FormulaDefinition> {
    return this.http.post<FormulaDefinition>(this.apiUrl, formula);
  }

  updateFormula(id: number, formula: FormulaDefinition): Observable<FormulaDefinition> {
    return this.http.put<FormulaDefinition>(`${this.apiUrl}/${id}`, formula);
  }

  deleteFormula(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  evaluateFormula(expression: string, variables: any): Observable<{result: any}> {
    return this.http.post<{result: any}>(`${this.apiUrl}/evaluate`, { expression, variables });
  }

  evaluateFormulaByKey(key: string, variables: any): Observable<{result: any}> {
    return this.http.post<{result: any}>(`${this.apiUrl}/evaluate/${key}`, variables);
  }
}
