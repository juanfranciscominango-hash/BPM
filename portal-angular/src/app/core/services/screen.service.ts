import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScreenDefinition {
  id?: number;
  name: string;
  processKey: string;
  taskKey?: string;
  layoutJson: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/screens';

  getScreens(): Observable<ScreenDefinition[]> {
    return this.http.get<ScreenDefinition[]>(`${this.apiUrl}?_t=${new Date().getTime()}`);
  }

  getScreensByProcess(processKey: string): Observable<ScreenDefinition[]> {
    return this.http.get<ScreenDefinition[]>(`${this.apiUrl}/process/${processKey}?_t=${new Date().getTime()}`);
  }

  saveScreen(screen: ScreenDefinition): Observable<ScreenDefinition> {
    return this.http.post<ScreenDefinition>(this.apiUrl, screen);
  }

  getForTask(processKey: string, taskKey: string): Observable<ScreenDefinition | null> {
    return this.http.get<ScreenDefinition | null>(`${this.apiUrl}/task?processKey=${processKey}&taskKey=${taskKey}`);
  }

  deleteScreen(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
