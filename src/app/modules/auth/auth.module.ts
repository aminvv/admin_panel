import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { YearPipe } from './pipes';
import { LoginFormComponent } from './components';
import { AuthGuard } from './guards';
import { HomeComponent } from '../pages/home/home.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ResetPasswordFormComponent } from './components/reset-password-form.component/reset-password-form.component';
import { ForgotPasswordFormComponent } from './components/forgot-password-form/forgot-password-form.component';
import { AuthPageComponent } from './containers';
import { SignFormComponent } from './components/sign-form/sign-form.component';

@NgModule({
  declarations: [
    AuthPageComponent,
    YearPipe,
    ResetPasswordFormComponent,
    ForgotPasswordFormComponent,
    LoginFormComponent,
    HomeComponent,
    SignFormComponent,
    VerifyEmailComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [AuthGuard],
})
export class AuthModule {}
