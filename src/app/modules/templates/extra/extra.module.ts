import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExtraRoutingModule } from './extra-routing.module';
import {SharedModule} from '../../../shared/shared.module';
import {FullCalendarModule} from '@fullcalendar/angular';
import {MatCardModule} from '@angular/material/card';
import { DayInfoComponent } from './components/day-info/day-info.component';
import {MatDialogModule} from '@angular/material/dialog';
import {CalendarPageComponent,  InvoicePageComponent, } from './containers';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { ResultFilteringComponent } from './components/result-filtering/result-filtering.component';
import {MatListModule} from '@angular/material/list';
import { InvoiceCardComponent } from './components/invoice-card/invoice-card.component';
import {InvoiceService} from './services/invoice.service';
import {MatTableModule} from '@angular/material/table';
import {AgmCoreModule} from '@agm/core';
import {googleMapKey} from '../maps/consts';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';



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
