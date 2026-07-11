import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.scss'],
})
export class ResetPasswordFormComponent {
  @Input() email: string = '';
  @Output() success = new EventEmitter<void>();

  public form: FormGroup;
  public loading = false;
  public errorMessage = '';
  public successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.errorMessage = 'رمز عبور و تکرار آن یکسان نیستند';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService
      .resetPassword({
        email: this.email,
        code: this.form.value.code,
        newPassword: this.form.value.newPassword,
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.successMessage = res.message || 'رمز عبور با موفقیت تغییر کرد';
          this.form.reset();
          this.success.emit();
        },
error: (err) => {
  console.log('RESET ERROR full:', err);
  console.log('status:', err.status);
  console.log('error body:', err.error);
  this.loading = false;
  this.errorMessage = err?.error?.message || 'خطایی رخ داد';
},
      });
  }
}