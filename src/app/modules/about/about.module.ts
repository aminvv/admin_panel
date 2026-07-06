// src/app/modules/dashboard/dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { NgxEchartsModule } from 'ngx-echarts';
import { TrendModule } from 'ngx-trend';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';

import { AboutManagementComponent, } from './containers/about-management/about-management.component';
import { AboutService } from './services';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

const routes: Routes = [
  { path: '', component: AboutManagementComponent }
];

@NgModule({
  declarations: [AboutManagementComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTableModule,
    MatMenuModule,
    CKEditorModule,
    NgxEchartsModule,
    TrendModule,
    MatToolbarModule,
    MatGridListModule,
    MatSelectModule,
    MatInputModule,
    NgApexchartsModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MatTabsModule,
    MatCheckboxModule,
    MatSortModule
  ],
  providers: [AboutService]
})
export class AboutModule { }