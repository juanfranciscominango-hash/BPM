import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id?: number;
  title: string;
  message: string;
  type: string;
  targetUser: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/notifications';

  getByUser(username: string, onlyUnread: boolean = false): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${username}?onlyUnread=${onlyUnread}`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/read`, {});
  }
}
