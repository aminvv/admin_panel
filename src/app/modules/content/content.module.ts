import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';

// import { ProductsService } from './services';
import { ContentRoutingModule } from './content-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { BlogEditFormComponent, BlogCardComponent  } from './components';
import { ManagementPageComponent ,  BlogPageComponent, BlogsPageComponent, BlogEditPageComponent, BlogCreatePageComponent } from './containers';
import { BaseService } from 'src/app/shared/services/base.service';
// import { CKEditorModule } from '@ckeditor/ckeditor5-angular';


@NgModule({
  declarations: [
    ManagementPageComponent,
    BlogsPageComponent,
    BlogPageComponent,
    BlogCardComponent,
    BlogEditPageComponent,
    BlogEditFormComponent,
    BlogCreatePageComponent,
    
  ],
  imports: [
    CommonModule,
    ContentRoutingModule,
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
    // CKEditorModule,
  ],
  providers: [
    
    BaseService
  ]
})
export class ContentModule { }
