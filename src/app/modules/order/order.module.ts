import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

// import { ProductsService } from './services';
import { SharedModule } from '../../shared/shared.module';
import { BaseService } from 'src/app/shared/services/base.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CloudinaryService } from 'src/app/shared/services/cloudinary-upload.service';
import { OrderRoutingModule } from './order-routing.module';
import { OrderListComponent } from './containers/management-page/order-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderStatusFlowComponent } from './containers/order-status-flow/order-status-flow.component';

@NgModule({
  declarations: [
    OrderListComponent,
    OrderStatusFlowComponent,

    
  ],
  imports: [
    FormsModule,
    CommonModule,
    OrderRoutingModule,
    SharedModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    CKEditorModule,

  ],
  providers: [
    
    BaseService,CloudinaryService
  ]
})
export class OrderModule { }
