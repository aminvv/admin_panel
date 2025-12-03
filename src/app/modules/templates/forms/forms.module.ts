import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormElementsPageComponent } from './components/form-elements-page/form-elements-page.component';
import { FormValidationPageComponent } from './components/form-validation-page/form-validation-page.component';
import {FormsRoutingModule} from './forms-routing.module';
import {SharedModule} from '../../../shared/shared.module';
import { HorizontalFormComponent } from './components/horizontal-form/horizontal-form.component';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import { DefaultFormComponent } from './components/default-form/default-form.component';
import { SelectsComponent } from './components/selects/selects.component';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import { InputVariantsComponent } from './components/input-variants/input-variants.component';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import { TextariasComponent } from './components/textarias/textarias.component';
import { SimpleValidationComponent } from './components/simple-validation/simple-validation.component';
import {ReactiveFormsModule} from '@angular/forms';



@NgModule({
  declarations: [
    FormElementsPageComponent,
    FormValidationPageComponent,
    HorizontalFormComponent,
    DefaultFormComponent,
    SelectsComponent,
    InputVariantsComponent,
    TextariasComponent,
    SimpleValidationComponent
  ],
    imports: [
        CommonModule,
        FormsRoutingModule,
        SharedModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
        ReactiveFormsModule
    ]
})
export class FormsModule { }
