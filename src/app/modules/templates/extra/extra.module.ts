import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExtraRoutingModule } from './extra-routing.module';
import {SharedModule} from '../../../shared/shared.module';
import {FullCalendarModule} from '@fullcalendar/angular';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import { DayInfoComponent } from './components/day-info/day-info.component';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {CalendarPageComponent,  InvoicePageComponent, } from './containers';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {FormsModule} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { ResultFilteringComponent } from './components/result-filtering/result-filtering.component';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import { InvoiceCardComponent } from './components/invoice-card/invoice-card.component';
import {InvoiceService} from './services/invoice.service';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {AgmCoreModule} from '@agm/core';
import {googleMapKey} from '../maps/consts';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyChipsModule as MatChipsModule} from '@angular/material/legacy-chips';



@NgModule({
    declarations: [
        CalendarPageComponent,
        InvoicePageComponent,
        DayInfoComponent,
        ResultFilteringComponent,
        InvoiceCardComponent,
    ],
    imports: [
        CommonModule,
        ExtraRoutingModule,
        SharedModule,
        FullCalendarModule,
        MatCardModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        FormsModule,
        MatButtonToggleModule,
        MatListModule,
        MatTableModule,
        AgmCoreModule,
        AgmCoreModule.forRoot({
            apiKey: googleMapKey
        }),
        MatInputModule,
        MatChipsModule,
    ],
    providers: [
        InvoiceService,
    ]
})
export class ExtraModule { }
