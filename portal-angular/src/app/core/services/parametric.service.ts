import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ParametricColumn {
  id?: number;
  name: string;
  label: string;
  type: string;
  primaryKey?: boolean;
  referencedTableId?: number | null;
  referencedTableLabel?: string;
}

export interface ParametricTable {
  id?: number;
  name: string;
  label: string;
  description: string;
  columns: ParametricColumn[];
}

@Injectable({
  providedIn: 'root'
})
export class ParametricService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/parametric';

  getTables(): Observable<ParametricTable[]> {
    return this.http.get<ParametricTable[]>(`${this.apiUrl}/tables`);
  }

  saveTable(table: ParametricTable): Observable<ParametricTable> {
    return this.http.post<ParametricTable>(`${this.apiUrl}/tables`, table);
  }

  updateTableMeta(id: number, body: { label: string; description: string }): Observable<ParametricTable> {
    return this.http.patch<ParametricTable>(`${this.apiUrl}/tables/${id}`, body);
  }

  addColumn(tableId: number, col: any): Observable<ParametricColumn> {
    return this.http.post<ParametricColumn>(`${this.apiUrl}/tables/${tableId}/columns`, col);
  }

  removeColumn(tableId: number, colId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tables/${tableId}/columns/${colId}`);
  }

  updateColumnLabel(colId: number, label: string): Observable<ParametricColumn> {
    return this.http.patch<ParametricColumn>(`${this.apiUrl}/columns/${colId}/label`, { label });
  }

  updateColumn(colId: number, col: any): Observable<ParametricColumn> {
    return this.http.put<ParametricColumn>(`${this.apiUrl}/columns/${colId}`, col);
  }

  getTableData(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tables/${id}/data`);
  }

  insertData(id: number, data: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/tables/${id}/data`, data);
  }

  updateData(tableId: number, rowId: number, data: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/tables/${tableId}/data/${rowId}`, data);
  }

  deleteData(tableId: number, rowId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tables/${tableId}/data/${rowId}`);
  }

  deleteTable(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tables/${id}`);
  }
}

