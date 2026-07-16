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
import { MatTabsModule } from '@angular/material/tabs'; 
import { MatDialogModule } from '@angular/material/dialog';

import { MatPaginatorModule } from '@angular/material/paginator';

import { ECommerceRoutingModule } from './e-commerce-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ProductEditFormComponent, ProductCardComponent } from './components';
import { ManagementPageComponent,  ProductPageComponent, ProductEditPageComponent, ProductCreatePageComponent } from './containers';
import { BaseService } from 'src/app/shared/services/base.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ProductSpotlightEditFormComponent } from './components/product-spotlight/product-spotlight-edit-form.component';
import { ProductSpotlightListComponent } from './components/product-spotlight/product-spotlight-list/product-spotlight-list.component';
import { SlideEditFormComponent } from './components/slide/slide-edit-form.component';
import { SlideListComponent } from './components/slide/slide-list.component/slide-list.component';

@NgModule({
  declarations: [
    ManagementPageComponent,
    ProductPageComponent,
    ProductCardComponent,
    ProductEditPageComponent,
    ProductEditFormComponent,
    ProductCreatePageComponent,
    ProductSpotlightEditFormComponent,
    ProductSpotlightListComponent,
    SlideEditFormComponent,
     SlideListComponent,
    
  ],
  imports: [
    CommonModule,
    ECommerceRoutingModule,
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
     CKEditorModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatTabsModule, 
    MatDialogModule,
  ],
  providers: [
    // ProductsService,
    BaseService
  ]
})
export class ECommerceModule { }
