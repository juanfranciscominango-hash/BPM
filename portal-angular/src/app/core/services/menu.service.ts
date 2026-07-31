import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MenuItem {
  id?: number;
  title: string;
  icon: string;
  route: string;
  permissionCode: string;
  children?: MenuItem[];
  sortOrder: number;
  parentId?: number;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.back_url}/api/v1/menu`;

  getMenu(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl);
  }

  createMenu(menu: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, menu);
  }

  updateMenu(id: number, menu: MenuItem): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, menu);
  }

  deleteMenu(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
