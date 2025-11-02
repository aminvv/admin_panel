import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AppConfig } from '../../app.config';
import { routes } from '../../consts';

const jwt = new JwtHelperService();

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  config: any;
  api = '/api/auth';
  private apiUrl = 'http://127.0.0.1:4000/authAdmin';
  ROUTES: typeof routes = routes;

  constructor(
    appConfig: AppConfig,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.config = appConfig.getConfig();
  }

  _isFetching: boolean = false;

  get isFetching() {
    return this._isFetching;
  }

  set isFetching(val: boolean) {
    this._isFetching = val;
  }

  _errorMessage: string = '';

  get errorMessage() {
    return this._errorMessage;
  }

  set errorMessage(val: string) {
    this._errorMessage = val;
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');
    let data = null;

    // We check if app runs with backend mode
    if (!this.config.isBackend && token) return true;
    if (!token) return;
    const date = new Date().getTime() / 1000;
    try {
      data = jwt.decodeToken(token);
    } catch (e) {
      this.router.navigate(['/login']);
    }
    if (!data) return;
    return date < data.exp;
  }

  loginUser(creds) {
    this.requestLogin();
    if (creds.social) {
      // tslint:disable-next-line
      window.location.href =
        this.config.baseURLApi + `${this.api}/signin/` + creds.social
    } else if (creds.email.length > 0 && creds.password.length > 0) {
      this.http
        .post(`${this.apiUrl}/login-admin`, creds, { responseType: 'json' })
        .subscribe(
          (res: any) => {
            this.receiveToken(res.accessToken);
            this.toastr.success('ورود موفق');
          },
          (err) => {
            const msg =
              err.error?.message || err.message || 'خطایی رخ داده است';
            this.toastr.error(msg);
          },
        );
    } else {
      this.toastr.error(' لطفا ابمیل و پسورد خود را وارید کنید');
    }
  }










  requestRegister() {
    this.isFetching = true;
  }

  receiveRegister() {
    this.isFetching = false;
    this.errorMessage = '';
  }

  registerError(payload) {
    this.isFetching = false;
    this.errorMessage = payload;
  }

  receiveToken(token) {
    const decoded: any = jwt.decodeToken(token);

    localStorage.setItem('token', token);
    localStorage.setItem('userId', decoded.userId)

    this.receiveLogin();
  }

  logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    this.router.navigate([this.ROUTES.LOGIN]);
  }

  loginError(payload) {
    this.isFetching = false;
    this.errorMessage = payload;
  }

  receiveLogin() {
    this.isFetching = false;
    this.errorMessage = '';
    this.router.navigate([this.ROUTES.DASHBOARD]);
  }

  requestLogin() {
    this.isFetching = true;
  }

  getCurrentUserInfo(): Observable<any> {
    return this.http.get(`${this.api}/me`);
  }

  changePassword(data): Observable<any> {
    return this.http.put(`${this.api}/password-update`, data);
  }

  verifyEmail(token: string): void {
    this.http.put(`${this.api}/verify-email`, { token }).subscribe(
      () => {
        this.toastr.success("You've been verified your email");
      },
      (err) => {
        this.registerError(err.response.data);
      },
      () => {
        this.router.navigate([this.ROUTES.LOGIN]);
      },
    );
  }
}
