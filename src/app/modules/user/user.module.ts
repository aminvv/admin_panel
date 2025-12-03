import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatStepperModule } from '@angular/material/stepper';

import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { DeleteUserPopupComponent } from './popups';

import {
  ListPageComponent,
  EditPageComponent,
  AddPageComponent,
  ProfilePageComponent
} from './containers';

import {
  AccountEditFormComponent,
  ProfileEditFormComponent,
  PasswordEditFormComponent,
  SettingsEditFormComponent,
  AccountCreateFormComponent,
  UserArticleComponent,
  UserFilesComponent,
  UserInfoComponent,
  UserMediaComponent,
  UserProjectsComponent,
  UserTasksComponent
} from './components';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {CalendarModule} from 'angular-calendar';

@NgModule({
  declarations: [
    ListPageComponent,
    AddPageComponent,
    EditPageComponent,
    AccountEditFormComponent,
    ProfileEditFormComponent,
    PasswordEditFormComponent,
    SettingsEditFormComponent,
    DeleteUserPopupComponent,
    AccountCreateFormComponent,
    ProfilePageComponent,
    UserArticleComponent,
    UserFilesComponent,
    UserInfoComponent,
    UserMediaComponent,
    UserProjectsComponent,
    UserTasksComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatCheckboxModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatSelectModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatStepperModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatMenuModule,
    CalendarModule
  ]
})
export class UserModule { }
