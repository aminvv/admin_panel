import { Component, EventEmitter, Input, Output } from '@angular/core';
import { routes } from '../../../../consts';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  @Input() user: any; // دیتای واقعی از AuthService.getCurrentUserInfo() میاد
  @Output() signOut: EventEmitter<void> = new EventEmitter<void>();
  public routes: typeof routes = routes;

  public signOutEmit(): void {
    this.signOut.emit();
  }

  getInitials(): string {
    if (!this.user?.fullName) {
      return (this.user?.email || 'A')[0].toUpperCase();
    }
    const parts = this.user.fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.user.fullName.substring(0, 2).toUpperCase();
  }

  hasAvatar(): boolean {
    return !!this.user?.avatar;
  }

  avatar(): string {
    if (!this.hasAvatar()) return '';
    const cleanPath = this.user.avatar.replace(/\\/g, '/');
    return `${environment.apiUrl}/${cleanPath}`;
  }
}