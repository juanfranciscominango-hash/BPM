import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MetaEntity {
  id?: number;
  name: string;
  label: string;
  description?: string;
}

export interface MetaAttribute {
  id?: number;
  entity?: { id: number }; // Relación con la entidad
  name: string;
  label: string;
  type: string;
  required: boolean;
  parametricTableId?: number;
  fieldSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/meta';

  // Entidades
  listarEntidades(): Observable<MetaEntity[]> {
    return this.http.get<MetaEntity[]>(`${this.apiUrl}/entities`);
  }

  getEntityData(entityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/entities/${entityId}/data`);
  }

  guardarEntidad(entity: MetaEntity): Observable<MetaEntity> {
    return this.http.post<MetaEntity>(`${this.apiUrl}/entities`, entity);
  }

  eliminarEntidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/entities/${id}`);
  }

  // Atributos registrados en MetaAttribute
  listarAtributos(entityId: number): Observable<MetaAttribute[]> {
    return this.http.get<MetaAttribute[]>(`${this.apiUrl}/entities/${entityId}/attributes`);
  }

  // Columnas físicas reales desde information_schema (incluye tablas sin MetaAttributes)
  getPhysicalTableColumns(entityId: number): Observable<{name: string; type: string}[]> {
    return this.http.get<{name: string; type: string}[]>(`${this.apiUrl}/entities/${entityId}/table-columns`);
  }

  guardarAtributo(attribute: MetaAttribute): Observable<MetaAttribute> {
    return this.http.post<MetaAttribute>(`${this.apiUrl}/attributes`, attribute);
  }

  actualizarAtributo(id: number, attribute: MetaAttribute): Observable<MetaAttribute> {
    return this.http.put<MetaAttribute>(`${this.apiUrl}/attributes/${id}`, attribute);
  }

  eliminarAtributo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/attributes/${id}`);
  }
}
