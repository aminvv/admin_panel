import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable,  } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AppNotification {
  id: number;
  type: 'offer' | 'like' | 'message' | 'order';
  text: string;
  isRead: boolean;
  createdAt: string;
  orderId?: number; 
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = '/admin/notifications';

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadAll(): void {
    this.http.get<AppNotification[]>(this.baseUrl).subscribe((list) => {
      this.notificationsSubject.next(list);
      this.updateUnreadCount(list);
    });
  }

  markAsRead(id: number): void {
    this.http.patch<void>(`${this.baseUrl}/${id}/read`, {}).subscribe(() => {
      const updated = this.notificationsSubject.value.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      );
      this.notificationsSubject.next(updated);
      this.updateUnreadCount(updated);
    });
  }

  private updateUnreadCount(list: AppNotification[]): void {
    this.unreadCountSubject.next(list.filter((n) => !n.isRead).length);
  }

    public get unreadOrderCount$(): Observable<number> {
    return this.notifications$.pipe(
      map((list) => list.filter((n) => n.type === 'order' && !n.isRead).length),
    );
  }

  markAsReadByOrderId(orderId: number): void {
  const match = this.notificationsSubject.value.find(
    (n) => n.orderId === orderId && !n.isRead,
  );
  if (match) {
    this.markAsRead(match.id);
  }
}
}