import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentDefinition {
  id?: number;
  name: string;
  description: string;
  processKey: string;
  isTemplate: boolean;
  templateContent?: string;
  templatePath?: string;
  mappingJson?: string;
  exportFormat?: string;
  required: boolean;
}

export interface StoredDocument {
  id?: number;
  fileName: string;
  contentType: string;
  uploadedAt: string;
  uploadedBy: string;
  definitionId: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.back_url}/api/v1/documents`;

  getDefinitions(processKey: string): Observable<DocumentDefinition[]> {
    return this.http.get<DocumentDefinition[]>(`${this.apiUrl}/definitions/${processKey}`);
  }

  saveDefinition(def: DocumentDefinition): Observable<DocumentDefinition> {
    return this.http.post<DocumentDefinition>(`${this.apiUrl}/definitions`, def); // Necesitaremos este endpoint
  }

  getDocumentsByInstance(instanceId: string): Observable<StoredDocument[]> {
    return this.http.get<StoredDocument[]>(`${this.apiUrl}/instance/${instanceId}`);
  }

  upload(file: File, instanceId: string, definitionId: number, user: string): Observable<StoredDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('instanceId', instanceId);
    formData.append('definitionId', definitionId.toString());
    formData.append('user', user);
    return this.http.post<StoredDocument>(`${this.apiUrl}/upload`, formData);
  }

  uploadTemplate(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/definitions/upload`, formData, { responseType: 'text' });
  }

  generate(definitionId: number, instanceId: string, variables: any, user: string): Observable<StoredDocument> {
    return this.http.post<StoredDocument>(`${this.apiUrl}/generate/${definitionId}?instanceId=${instanceId}&user=${user}`, variables);
  }

  generateByName(documentName: string, instanceId: string, variables: any, user: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate-by-name/${documentName}?instanceId=${instanceId}&user=${user}`, variables);
  }

  signDocument(docId: number, username: string, pin: string): Observable<StoredDocument> {
    return this.http.post<StoredDocument>(`${this.apiUrl}/sign/${docId}?username=${username}&pin=${pin}`, {});
  }
}
