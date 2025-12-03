import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { CommonModule } from '@angular/common';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgSelectModule } from '@ng-select/ng-select';

import { HeaderModule } from './header/header.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { LayoutComponent } from './layout/layout.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatBadgeModule } from '@angular/material/badge';
import { ChatPopupComponent } from './popups/chat-popup/chat-popup.component';
import { SettingsMenuComponent, DateMenuComponent, BreadcrumbComponent } from './ui-elements';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { SettingsMenuAppComponent } from './settings-menu/settings-menu.component';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { ImageUploaderComponent } from './uploaders/image-uploader/image-uploader.component';
import { FileUploaderComponent } from './uploaders/file-uploader/file-uploader.component';
import { DeletePopupComponent } from './popups/delete-popup/delete-popup.component';
import { FilterComponent } from './filter/filter.component';

@NgModule({
  declarations: [
    SidebarComponent,
    FooterComponent,
    LayoutComponent,
    BreadcrumbComponent,
    SettingsMenuAppComponent,
    ImageUploaderComponent,
    FileUploaderComponent,
    DeletePopupComponent,
    FilterComponent,
    DateMenuComponent,
    SettingsMenuComponent,
    ChatPopupComponent,
  ],
  imports: [
    HeaderModule,
    ReactiveFormsModule,
    MatListModule,
    MatIconModule,
    RouterModule,
    MatButtonModule,
    CommonModule,
    MatMenuModule,
    MatSelectModule,
    FormsModule,
    MatSidenavModule,
    MatTreeModule,
    MatBadgeModule,
    MatCardModule,
    MatDialogModule,
    MatInputModule,
    MatRadioModule,
    MatSlideToggleModule,
    NgSelectModule,
  ],
  exports: [
    HeaderModule,
    SidebarComponent,
    FooterComponent,
    LayoutComponent,
    BreadcrumbComponent,
    ImageUploaderComponent,
    FileUploaderComponent,
    DeletePopupComponent,
    FilterComponent,
    DateMenuComponent,
    SettingsMenuComponent
  ],
})
export class SharedModule {}
