import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Permission {
  id?: number;
  code: string;
  description: string;
}

export interface Role {
  id?: number;
  name: string;
  permissions: Permission[];
}

export interface UserAccount {
  id?: number;
  username: string;
  fullName: string;
  active: boolean;
  agencia?: string;
  roles: Role[];
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/security';

  getUsers(): Observable<UserAccount[]> { return this.http.get<UserAccount[]>(`${this.apiUrl}/users`); }
  saveUser(user: UserAccount): Observable<UserAccount> { return this.http.post<UserAccount>(`${this.apiUrl}/users`, user); }
  transferUser(userId: number, newAgencia: string, backupUsername: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/transfer`, { userId, newAgencia, backupUsername });
  }
  
  getRoles(): Observable<Role[]> { return this.http.get<Role[]>(`${this.apiUrl}/roles`); }
  saveRole(role: Role): Observable<Role> { return this.http.post<Role>(`${this.apiUrl}/roles`, role); }
  
  getPermissions(): Observable<Permission[]> { return this.http.get<Permission[]>(`${this.apiUrl}/permissions`); }
}
