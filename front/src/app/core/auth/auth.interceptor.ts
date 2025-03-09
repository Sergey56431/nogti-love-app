import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { Router } from '@angular/router';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { DefaultResponseType, RefreshResponseType } from '@shared/types';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private _token = '';
  private _userId = '';

  constructor(
    private _authService: AuthService,
    private _router: Router,
  ) {
  }

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    //вызвать лоадер
    this._token = this._authService.getTokens();
    if (this._token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', 'bearer ' + this._token),
      });
      return next
        .handle(authReq)

        .pipe(
          catchError((error) => {
            if (
              error.status === 401 &&
              !authReq.url.includes('/login') &&
              !authReq.url.includes('/registration')
            ) {
              return this.handle401(authReq, next);
            }
            return throwError(error);
          }),
          // finalize(() => this.loaderService.hide())
        );
    }
    return next.handle(req);
    // .pipe(
    // finalize(() => this.loaderService.hide())
    // );
  }

  private handle401(req: HttpRequest<unknown>, next: HttpHandler) {
    if (!this._token) {
      this._router.navigate(['/login']);
      return throwError(() => new Error('Refresh token is missing'));
    }
    this._userId = this._authService.getUserInfo().userId ?? '';

    return this._authService.refresh(this._userId ?? '').pipe(
      switchMap((result: DefaultResponseType | RefreshResponseType) => {
        let error = '';
        if ((result as DefaultResponseType).error !== undefined) {
          error = (result as DefaultResponseType).message;
        }

        const refreshResult = result as RefreshResponseType;
        if (!refreshResult.accessToken) {
          error = 'Не удалось авторизоваться';
        }

        if (error) {
          return throwError(() => new Error(error));
        }

        this._authService.setTokens(refreshResult.accessToken);
        const authReq = req.clone({
          headers: req.headers.set(
            'Authorization',
            'bearer ' + refreshResult.accessToken,
          ),
        });

        return next.handle(authReq);
      }),

      catchError((error) => {
        this._authService.logout(this._userId);
        this._authService.removeTokens();
        this._router.navigate(['/login']);
        return throwError(() => error); // Возвращаем оригинальную ошибку
      }),
    );
  }
}
