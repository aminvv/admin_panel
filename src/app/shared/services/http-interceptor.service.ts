import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfig } from '../../app.config';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  config;

  constructor(appConfig: AppConfig, private authService: AuthService) {
    this.config = appConfig.getConfig();
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    req = req.clone({ url: this.config.baseURLApi + req.url });

    const token: string = localStorage.getItem('token');


    // 🔴 اضافه کردن این لاگ‌ها
    console.log('🟢 Interceptor - Request URL:', req.url);
    console.log('🟢 Interceptor - Token exists:', !!token);
    if (token) {
      console.log('🟢 Interceptor - Token:', token);
    }



    if (token) {
      req = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + token),
      });
    }

    return next.handle(req).pipe(
      tap(
        (event) => { },
        (err) => {
          console.log('❌ Request failed - URL:', req.url); // اضافه کردن این
          console.log('❌ Request failed - Error:', err); // اضافه کردن این
          if (err instanceof HttpErrorResponse) {
            console.log('🔴 Error Status:', err.status);
            if (err.status == 401) {
              console.log('🔴 401 Error - Logging out...');
              this.authService.logoutUser();
            }
          }
        },
      ),
    );
  }
}
