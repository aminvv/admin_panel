// notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppNotification, NotificationService } from './notifications.service';

const ICON_MAP: Record<string, string> = {
  offer: 'local_offer',
  like: 'thumb_up',
  message: 'notifications_none',
  order: 'local_grocery_store',
};

const COLOR_CLASS_MAP: Record<string, string> = {
  offer: 'notification-menu__icon_yellow',
  like: 'notification-menu__icon_green',
  message: 'notification-menu__icon_pink',
  order: 'notification-menu__icon_blue',
};

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  public notifications$: Observable<AppNotification[]> = this.notificationService.notifications$;
  public unreadCount$: Observable<number> = this.notificationService.unreadCount$;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.notificationService.loadAll();
  }

  public iconFor(type: string): string {
    return ICON_MAP[type] ?? 'notifications_none';
  }

  public colorClassFor(type: string): string {
    return COLOR_CLASS_MAP[type] ?? 'notification-menu__icon_pink';
  }

public onOpen(notification: AppNotification): void {
  if (!notification.isRead) {
    this.notificationService.markAsRead(notification.id);
  }
  if (notification.type === 'order' && notification.orderId) {
    this.router.navigate(['/order/detail', notification.orderId]); 
}
}
}