import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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
import { ProductService } from '../e-commerce/services';
import { DiscountRoutingModule } from './discount-routing.module';
import { DiscountDetailComponent } from './containers/discount-deatails/discount-detail.component';
import { ManagementDiscountComponent } from './containers/management-discount/management-discount.component';

@NgModule({
  declarations: [
    ManagementDiscountComponent,
    DiscountDetailComponent,

    
  ],
  imports: [
    CommonModule,
    DiscountRoutingModule,
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
    MatPaginatorModule,
    ReactiveFormsModule,
    CKEditorModule,
  ],
  providers: [
    
    BaseService,
  ]
})
export class DiscountModule { }
