import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {Observable, Subject, tap} from 'rxjs';
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
  public accessTokenKey = 'accessToken';
  public refreshTokenKey = 'refreshToken';
  private userInfoKey = 'userInfo';

  public isLogged = false;
  public isLogged$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.isLogged = !!this.cookieService.get(this.accessTokenKey);
  }

  login(username:string, password: string): Observable<LoginResponseType | DefaultResponseType> {
    return this.http.post<LoginResponseType>(environment.api + 'login', {
      username,
      password
    })
      .pipe(
        tap((data: LoginResponseType) => {
          if (data.username && data.accessToken) {
            this.setUserInfo({
              name: data.username
            });
            this.setTokens(data.accessToken);
          }
        })
      );
  }

  signup(email: string, password: string, phone: string, username: string): Observable<SignupResponseType> {
    return this.http.post<SignupResponseType>(environment.api + 'register', {
      username, password, phone, email
    });
  }

  logout(): Observable<DefaultResponseType> {
    return this.http.get<DefaultResponseType>(environment.api + 'logout');

  }

  refresh(): Observable<RefreshResponseType> {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
    return this.http.post<RefreshResponseType>(environment.api + 'refresh', {
      refreshToken
    });
  }

  public getIsLoggedIn() {
    return this.isLogged;
  }

  public setTokens(accessToken: string) {
    this.cookieService.set(this.accessTokenKey, accessToken);
    // this.cookieService.set(this.refreshTokenKey, refreshToken);
    this.isLogged = true;
    this.isLogged$.next(true);
  }

  public removeTokens() {
    this.cookieService.delete(this.accessTokenKey);
    // this.cookieService.delete(this.refreshTokenKey);
    this.isLogged = false;
    this.isLogged$.next(false);
    console.log(this.cookieService.get(this.accessTokenKey));
  }

  public removeUserInfo(): void {
    localStorage.removeItem(this.userInfoKey);
  }

  public getUserInfo(): UserInfoType | null {
    const userInfo: string | null = localStorage.getItem(this.userInfoKey);
    if (userInfo) {
      return JSON.parse(userInfo);
    }

    return null;
  }

  public setUserInfo(info: object) {
    localStorage.setItem(this.userInfoKey, JSON.stringify(info));
  }

  public getTokens(): { accessToken: string | null, refreshToken: string | null }{
    return {
      accessToken: this.cookieService.get(this.accessTokenKey),
      refreshToken: this.cookieService.get(this.refreshTokenKey)
    };
  }
}
