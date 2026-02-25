// src/app/modules/admin/orders/order.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';

// Components

// Services
import { BaseService } from '../../shared/services/base.service';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService } from './services';
import { UserRoutingModule } from './user-routing.module';
import { UserAddComponent } from './containers/user-add/user-add.component';
import { UserListComponent } from './containers/user-list/users-list.component';
import { ConfirmDialogComponent } from './containers/confirm-dialog/confirm-dialog.component';
import { AdminListComponent } from './containers/admin-list/admin-list.component';
import { AdminAddComponent } from './containers/admin-add/admin-add.component';
import { PromoteDialogComponent } from './containers/promote-dialog/promote-dialog.component';






@NgModule({
  declarations: [

    UserListComponent,
    UserAddComponent,
    ConfirmDialogComponent,
    AdminListComponent,
    AdminAddComponent,
    PromoteDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoutingModule,
    SharedModule,

    // Material Modules
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatSnackBarModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatDialogModule,
    MatTableModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule,



  ],
  providers: [
    UserService,
    BaseService,
    CloudinaryService
  ]
})
export class UserModule { } 