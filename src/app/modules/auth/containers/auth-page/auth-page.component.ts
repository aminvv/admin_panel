import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { routes } from '../../../../consts';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss'],
})
export class AuthPageComponent {
  public todayDate: Date = new Date();
  public routers: typeof routes = routes;

  public selectedTabIndex = 0;
  public forgotPasswordStep: 'request' | 'reset' = 'request';
  public forgotPasswordEmail: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    if (this.authService.isAuthenticated()) {
      this.authService.receiveLogin();
    }

    this.route.queryParams.subscribe((params) => {
      if (params.token) {
        this.authService.receiveToken(params.token);
      }
    });
  }

  public sendLoginForm(creds: any): void {
    this.authService.loginUser(creds);
  }

  public goToForgotPasswordTab(): void {
    this.forgotPasswordStep = 'request';
    this.selectedTabIndex = 1;
  }

  public onCodeSent(email: string): void {
    this.forgotPasswordEmail = email;
    this.forgotPasswordStep = 'reset';
  }

public onResetSuccess(): void {
  this.forgotPasswordStep = 'request';
  this.forgotPasswordEmail = '';
  this.selectedTabIndex = 0;
}
}