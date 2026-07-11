import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  @Output() sendLoginForm = new EventEmitter<any>();
  @Output() forgotPasswordClick = new EventEmitter<void>();
  public form: UntypedFormGroup;

  public forgotPasswordStep: 'request' | 'reset' = 'request';
  public forgotPasswordEmail: string = '';

  constructor() {}

  public ngOnInit(): void {
    this.form = new UntypedFormGroup({
      email: new UntypedFormControl('', [
        Validators.required,
        Validators.email,
      ]),
      password: new UntypedFormControl('', [Validators.required]),
    });
  }

  public login(): void {
    if (this.form.valid) {
      this.sendLoginForm.emit(this.form.value);
    }
  }

  public onForgotPasswordClick(): void {
    this.forgotPasswordClick.emit();
  }
}