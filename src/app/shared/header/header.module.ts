import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatBadgeModule } from '@angular/material/badge';

import { HeaderComponent } from './containers';
import { UserComponent, SearchComponent } from './components';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ShortNamePipe } from './pipes';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    HeaderComponent,
    NotificationsComponent,
    UserComponent,
    SearchComponent,
    ShortNamePipe,
  ],
  exports: [HeaderComponent, ShortNamePipe, SearchComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatInputModule,
    MatBadgeModule,
    RouterModule,
  ],
})
export class HeaderModule {}
