import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AppConfig } from '../../../../app.config';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  @Output() sendLoginForm = new EventEmitter<any>();
  public form: UntypedFormGroup;
  public email: string;
  public password: string;

  constructor(appConfig: AppConfig) {
    const config: any = appConfig.getConfig();
    const creds = config.auth;
    this.email = creds.email;
    this.password = creds.password;
  }

  public ngOnInit(): void {
    this.form = new UntypedFormGroup({
      email: new UntypedFormControl(this.email, [
        Validators.required,
        Validators.email,
      ]),
      password: new UntypedFormControl(this.password, [Validators.required]),
    });
  }

  public login(): void {
    if (this.form.valid) {
      this.sendLoginForm.emit(this.form.value);
    }
  }
}
