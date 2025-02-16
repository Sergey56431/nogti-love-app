import {Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {Observable, Subject} from 'rxjs';
import {
  DefaultResponseType,
  LoginResponseType,
  RefreshResponseType,
  SignupResponseType, UserInfoType,
} from '@shared/types';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public _accessTokenKey = 'accessToken';
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

  signup(body: SignupResponseType): Observable<SignupResponseType> {
    return this.http.post<SignupResponseType>(environment.api + 'auth/signup', { body });
  }

  logout(id: string): Observable<DefaultResponseType> {
    return this.http.get<DefaultResponseType>(environment.api + 'auth/logout/' + id);
  }

  refresh(userId: string): Observable<RefreshResponseType> {
    return this.http.get<RefreshResponseType>(environment.api + 'auth/refresh' + userId);
  }

  public getIsLoggedIn() {
    return this.isLogged();
  }

  public setTokens(accessToken: string,) {
    this.cookieService.set(this._accessTokenKey, accessToken);
    this.isLogged.set(true);
    this.isLogged$.next(true);
  }

  public removeTokens() {
    this.cookieService.delete(this._accessTokenKey);
    this.removeUserInfo();
    this.isLogged.set(false);
    this.isLogged$.next(false);
  }

  public removeUserInfo(): void {
    localStorage.removeItem(this._userInfoKey);
  }

  public setUserInfo(info: object) {
    localStorage.setItem(this._userInfoKey, JSON.stringify(info));
  }

  public getUserInfo(): UserInfoType {
    return JSON.parse(localStorage.getItem(this._userInfoKey) ?? '');
  }

  public getTokens(): string {
    return this.cookieService.get(this._accessTokenKey);
  }
}
