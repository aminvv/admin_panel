// src/app/modules/admin/orders/order.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderRoutingModule } from './order-routing.module';
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
import { OrderListComponent } from './containers/management-page/order-list.component';
import { OrderDetailComponent } from './containers/order-detail/order-detail.component';

// Services
import { OrderService } from './services/order.service';
import { BaseService } from '../../shared/services/base.service';
import { OrderStatusFlowComponent } from './containers/order-status-flow/order-status-flow.component';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { CustomerInfoComponent } from './containers/coustomer/customer-info/customer-info.component';
import { CustomerService } from './services/customer.service';
import { CustomerDetailDialogComponent } from './containers/coustomer/customer-detail-dialog/customer-detail-dialog.component';

@NgModule({
  declarations: [
    OrderListComponent,
    OrderStatusFlowComponent,
    OrderDetailComponent,
    CustomerInfoComponent,
    CustomerDetailDialogComponent

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OrderRoutingModule,
    SharedModule,

    // Material Modules
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    MatTableModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule
  ],
  providers: [
    OrderService,
    CustomerService,
    BaseService,
    CloudinaryService
  ]
})
export class OrderModule { }