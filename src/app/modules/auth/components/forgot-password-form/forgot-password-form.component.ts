import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-forgot-password-form',
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.scss'],
})
export class ForgotPasswordFormComponent {
  @Output() codeSent = new EventEmitter<string>(); // ایمیل رو به بالا پاس میدیم برای مرحله بعد

  public form: FormGroup;
  public loading = false;
  public errorMessage = '';
  public successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  public onSubmit(): void {
     console.log('submit clicked', this.form.value);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.form.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: (res: any) => {
         console.log('success', res);
        this.loading = false;
        this.successMessage = res.message || 'کد بازیابی ارسال شد';
        this.form.reset();
        this.codeSent.emit(email);
      },
      error: (err) => {
        console.log('error', err)
        this.loading = false;
        this.errorMessage = err?.error?.message || 'خطایی رخ داد';
      },
    });
  }
}