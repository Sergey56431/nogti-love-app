import {Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {Observable, Subject} from 'rxjs';
import {
  DefaultResponseType,
  LoginResponseType,
  RefreshResponseType,
  SignupResponseType,
  UserInfoType
} from '@shared/types';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public _accessTokenKey = 'accessToken';
  public _refreshTokenKey = 'refreshToken';
  private _userInfoKey = 'userInfo';

  public isLogged = signal(false);
  public isLogged$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.isLogged.set(!!this.cookieService.get(this._accessTokenKey));
  }

  login(username: string, password: string): Observable<LoginResponseType | DefaultResponseType> {
    return this.http.post<LoginResponseType>(environment.api + 'auth/login', {
      username,
      password
    });
  }

  signup(username: string, password: string, phone?: string, birthDay?: string): Observable<SignupResponseType> {
    return this.http.post<SignupResponseType>(environment.api + 'auth/signup', {
      username,
      password,
      phone,
      birthDay
    });
  }

  public getUser(id: string): Observable<UserInfoType> {
    return this.http.get<UserInfoType>(environment.api + 'users/' + id);
  }

  logout(id: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'auth/logout/' + id, {
      id
    });
  }

  refresh(refreshToken: string): Observable<RefreshResponseType> {
    return this.http.post<RefreshResponseType>(environment.api + 'auth/refresh', {
      refreshToken
    });
  }

  public getIsLoggedIn() {
    return this.isLogged();
  }

  public setTokens(accessToken: string, refreshToken: string) {
    this.cookieService.set(this._accessTokenKey, accessToken);
    this.cookieService.set(this._refreshTokenKey, refreshToken);
    this.isLogged.set(true);
    this.isLogged$.next(true);
  }

  public removeTokens() {
    this.cookieService.delete(this._accessTokenKey);
    this.cookieService.delete(this._refreshTokenKey);
    this.removeUserInfo();
    this.isLogged.set(false);
    this.isLogged$.next(false);
  }

  public removeUserInfo(): void {
    localStorage.removeItem(this._userInfoKey);
  }

  public getUserInfo(): UserInfoType | null {
    const userInfo: string | null = localStorage.getItem(this._userInfoKey);
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    return null;
  }

  public setUserInfo(info: object) {
    localStorage.setItem(this._userInfoKey, JSON.stringify(info));
  }

  public getTokens(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken: this.cookieService.get(this._accessTokenKey),
      refreshToken: this.cookieService.get(this._refreshTokenKey)
    };
  }
}
