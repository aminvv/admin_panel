import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
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
  private refreshInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(appConfig: AppConfig, private authService: AuthService) {
    this.config = appConfig.getConfig();
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('cloudinary.com') || req.url.includes('res.cloudinary.com')) {
      return next.handle(req);
    }

    const clonedReq = req.clone({ url: this.config.baseURLApi + req.url, withCredentials: true });

    const token: string = localStorage.getItem('token');
    let authReq = clonedReq;
    if (token) {
      authReq = clonedReq.clone({
        headers: clonedReq.headers.set('Authorization', 'Bearer ' + token),
      });
    }

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !req.url.includes('/refresh')) {
          if (!this.refreshInProgress) {
            this.refreshInProgress = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken().pipe(
              switchMap((res: any) => {
                const newToken = res?.accessToken;
                if (!newToken) {
                  this.authService.logoutUser();
                  return throwError(() => err);
                }
                localStorage.setItem('token', newToken);
                this.refreshTokenSubject.next(newToken);

                const retryReq = authReq.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                });
                return next.handle(retryReq);
              }),
              catchError((refreshErr) => {
                this.authService.logoutUser();
                return throwError(() => refreshErr);
              }),
              finalize(() => {
                this.refreshInProgress = false;
              })
            );
          } else {
            return this.refreshTokenSubject.pipe(
              filter((t) => t != null),
              take(1),
              switchMap((newToken) => {
                const retryReq = authReq.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                });
                return next.handle(retryReq);
              })
            );
          }
        }
        return throwError(() => err);
      })
    );
  }
}