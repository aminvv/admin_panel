import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { NgxEchartsModule } from 'ngx-echarts';
import { TrendModule } from 'ngx-trend';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';

import { DashboardPageComponent } from './containers';
import {
  VisitsChartComponent,
  PerformanceChartComponent,
  ServerChartComponent,
  RevenueChartComponent,
  DailyLineChartComponent,
  SupportRequestsComponent,
  ProjectStatChartComponent
} from './components';
import { SharedModule } from '../../shared/shared.module';
import { DashboardService } from './services';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatSortModule} from '@angular/material/sort';


@NgModule({
  declarations: [
    DashboardPageComponent,
    VisitsChartComponent,
    PerformanceChartComponent,
    ServerChartComponent,
    RevenueChartComponent,
    DailyLineChartComponent,
    SupportRequestsComponent,
    ProjectStatChartComponent
  ],
    imports: [
        CommonModule,
        MatTableModule,
        NgxEchartsModule,
        TrendModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatProgressBarModule,
        MatToolbarModule,
        MatGridListModule,
        MatSelectModule,
        MatInputModule,
        NgApexchartsModule,
        FormsModule,
        SharedModule,
        MatTabsModule,
        MatCheckboxModule,
        MatSortModule
    ],
  exports: [
    DailyLineChartComponent
  ],
  providers: [
    DashboardService
  ]
})
export class DashboardModule { }
